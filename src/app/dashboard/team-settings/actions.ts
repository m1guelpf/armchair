'use server'

import { db } from '@/db'
import { isAddress } from 'viem'
import Session from '@/lib/session'
import { number, string } from 'zod'
import { and, eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { error, isError } from '@/lib/errors'
import { getAddressFromENS } from '@/lib/utils'
import { TeamMember, teamMembersTable, teamsTable } from '@/db/schema'

const ensurePermissions = async (session: Session) => {
	const memebers = await db
		.select({
			role: teamMembersTable.role,
		})
		.from(teamMembersTable)
		.where(and(eq(teamMembersTable.userId, session.userId!), eq(teamMembersTable.teamId, session.teamId!)))

	const member = memebers[0]
	if (
		member.role !== teamMembersTable.role.enumValues['0'] &&
		member.role !== teamMembersTable.role.enumValues['1']
	) {
		return error("You don't have permission to perform this action.")
	}

	return member.role
}

export const inviteUser = async ({ address }: { address: string }) => {
	const session = await Session.fromCookies(cookies())
	await ensurePermissions(session)

	const resolvedAddress = (await getAddressFromENS(address)) ?? address
	if (!isAddress(resolvedAddress)) return error('Invalid address.')

	try {
		if (!session.teamId) return error('No team found')
		if (!session.userId) return error('No user found')
		await db.insert(teamMembersTable).values({
			userId: resolvedAddress,
			teamId: session.teamId,
		})
	} catch (e) {
		return error('User is already a member of this team.')
	}

	revalidatePath('/dashboard/team-settings')
}

export const updateTeamData = async ({ name, avatarUrl }: { name: string; avatarUrl?: string }) => {
	const session = await Session.fromCookies(cookies())
	await ensurePermissions(session)

	await db
		.update(teamsTable)
		.set({
			name,
			avatarUrl,
		})
		.where(eq(teamsTable.id, session.teamId!))

	revalidatePath('/dashboard/team-settings')
}

type actionType = (typeof teamMembersTable.role.enumValues)[number] | 'delete'

export const updateMember = async (userId: string, action: actionType) => {
	const session = await Session.fromCookies(cookies())
	const userRole = await ensurePermissions(session)
	if (isError(userRole)) return userRole

	const transaction = await db.transaction(async tx => {
		const team = await tx.query.teamsTable.findFirst({
			where: (teamsTable, { eq }) => eq(teamsTable.id, session.teamId!),
		})
		if (!team) return error('Team not found.')
		const teamMember = await tx.query.teamMembersTable.findFirst({
			where: (teamMembersTable, { and, eq }) =>
				and(eq(teamMembersTable.userId, userId), eq(teamMembersTable.teamId, session.teamId!)),
		})
		if (!teamMember) return error('User not found.')
		return { team, teamMember }
	})

    console.log(transaction)

	if (isError(transaction)) return error('Failed to load team or user.')
	const { team, teamMember } = transaction

	if (teamMember.role === 'owner') return error("You can't modify the owner.")
	if (teamMember.role === 'admin' && userRole !== 'owner') return error("You can't modify admins.")

	if (action === 'delete') {
		await db
			.delete(teamMembersTable)
			.where(and(eq(teamMembersTable.userId, userId), eq(teamMembersTable.teamId, session.teamId!)))

		if (teamMember.userId == session.userId) {
			const userTeams = await db.query.teamMembersTable.findMany({
				where: (teamMembersTable, { eq, and }) => eq(teamMembersTable.userId, session.userId!),
				with: {
					team: true,
				},
			})
			const personalTeam = userTeams.find(team => team.team.type == 'personal')
			if (personalTeam) session.teamId = personalTeam.team.id
			await session.persist(cookies())
		}

		return revalidatePath('/dashboard/team-settings')
	}

	// Unset previous owner
	if (action === 'owner') {
		if (team.type == 'personal') return error("You can't transfer ownership of a personal team.")

		await db
			.update(teamMembersTable)
			.set({ role: 'admin' })
			.where(and(eq(teamMembersTable.teamId, session.teamId!), eq(teamMembersTable.role, 'owner')))
	}

	await db
		.update(teamMembersTable)
		.set({ role: action })
		.where(and(eq(teamMembersTable.userId, userId), eq(teamMembersTable.teamId, session.teamId!)))

	revalidatePath('/dashboard/team-settings')
}

export const deleteTeam = async () => {
	const session = await Session.fromCookies(cookies())
	const role = await ensurePermissions(session)

	const team = await db.query.teamsTable.findFirst({
		where: (teamsTable, { eq }) => eq(teamsTable.id, session.teamId!),
		columns: {
			type: true,
		},
	})

	if (team?.type === 'personal') return error("You can't delete a personal team.")
	if (role !== 'owner') return error("You don't have permission to perform this action.")

	await db.delete(teamMembersTable).where(eq(teamMembersTable.teamId, session.teamId!))

	const userTeams = await db.query.teamMembersTable.findMany({
		where: (teamMembersTable, { eq, and }) => eq(teamMembersTable.userId, session.userId!),
		with: {
			team: true,
		},
	})
	const personalTeam = userTeams.find(team => team.team.type == 'personal')
	if (personalTeam) session.teamId = personalTeam.team.id

	await session.persist(cookies())
	revalidatePath('/dashboard')
}
