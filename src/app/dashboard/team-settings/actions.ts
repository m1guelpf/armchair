'use server'

import { isAddress } from 'viem'
import prisma from '@/db/prisma'
import Session from '@/lib/session'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { error, isError } from '@/lib/errors'
import { getAddressFromENS } from '@/lib/utils'
import { TeamRole, TeamType } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

const ensurePermissions = async (session: Session) => {
	const member = await prisma.teamMember.findUniqueOrThrow({
		select: { role: true },
		where: { userId_teamId: { userId: session.userId!, teamId: session.teamId! } },
	})

	if (member.role != TeamRole.OWNER && member.role != TeamRole.ADMIN) {
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
		await prisma.teamMember.create({
			data: {
				team: { connect: { id: session.teamId! } },
				user: { connectOrCreate: { where: { id: resolvedAddress }, create: { id: resolvedAddress } } },
			},
		})
	} catch (e) {
		if ((e as PrismaClientKnownRequestError)?.code != 'P2002') throw error
		return error('User is already a member of this team.')
	}

	revalidatePath('/dashboard/team-settings')
}

export const updateTeamData = async ({ name, avatarUrl }: { name: string; avatarUrl?: string }) => {
	const session = await Session.fromCookies(cookies())
	await ensurePermissions(session)

	await prisma.team.update({
		data: { name, avatarUrl },
		where: { id: session.teamId! },
	})

	revalidatePath('/dashboard/team-settings')
}

export const updateMember = async (userId: string, action: TeamRole | 'delete') => {
	const session = await Session.fromCookies(cookies())
	const userRole = await ensurePermissions(session)
	if (isError(userRole)) return userRole

	const [team, member] = await Promise.all([
		await prisma.team.findUniqueOrThrow({ where: { id: session.teamId! } }),
		await prisma.teamMember.findUniqueOrThrow({
			where: { userId_teamId: { userId: userId, teamId: session.teamId! } },
		}),
	])

	if (member.role == TeamRole.OWNER) return error("You can't modify the owner.")
	if (member.role == TeamRole.ADMIN && userRole != TeamRole.OWNER) {
		if (member.userId != session.userId || action == TeamRole.OWNER) return error("You can't modify admins.")
	}

	if (action == 'delete') {
		await prisma.teamMember.delete({
			where: { userId_teamId: { userId: member.userId, teamId: session.teamId! } },
		})

		if (member.userId == session.userId) {
			const personalTeam = await prisma.team.findFirstOrThrow({
				where: { type: TeamType.PERSONAL, members: { some: { userId: session.userId! } } },
			})
			session.teamId = personalTeam.id
			await session.persist(cookies())
		}

		return revalidatePath('/dashboard/team-settings')
	}

	// Unset previous owner
	if (action == TeamRole.OWNER) {
		if (team.type == TeamType.PERSONAL) return error("You can't transfer ownership of a personal team.")

		await prisma.teamMember.updateMany({
			data: { role: TeamRole.ADMIN },
			where: { teamId: session.teamId!, role: TeamRole.OWNER },
		})
	}

	await prisma.teamMember.update({
		data: { role: action },
		where: { userId_teamId: { userId: member.userId, teamId: session.teamId! } },
	})

	revalidatePath('/dashboard/team-settings')
}

export const deleteTeam = async () => {
	const session = await Session.fromCookies(cookies())
	const role = await ensurePermissions(session)

	const team = await prisma.team.findUniqueOrThrow({ where: { id: session.teamId! } })

	if (team.type == TeamType.PERSONAL) return error("You can't delete a personal team.")
	if (role != TeamRole.OWNER) return error("You don't have permission to perform this action.")

	await prisma.team.delete({ where: { id: session.teamId! } })

	const personalTeam = await prisma.team.findFirstOrThrow({
		where: { type: TeamType.PERSONAL, members: { some: { userId: session.userId! } } },
	})
	session.teamId = personalTeam.id

	await session.persist(cookies())
	revalidatePath('/dashboard')
}
