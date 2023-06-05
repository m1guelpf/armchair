import { db } from '@/db'
import { eq } from 'drizzle-orm'
import { tap } from '@/lib/utils'
import Session from '@/lib/session'
import { NextRequest, NextResponse } from 'next/server'
import { SiweErrorType, SiweMessage, generateNonce } from 'siwe'
import { User, teamMembersTable, teamsTable, usersTable } from '@/db/schema'

export const GET = async (req: NextRequest): Promise<NextResponse> => {
	const session = await Session.fromRequest(req)

	return NextResponse.json(session.toJSON())
}

export const PUT = async (req: NextRequest): Promise<NextResponse> => {
	const session = await Session.fromRequest(req)
	if (!session?.nonce) session.nonce = generateNonce()

	return tap(new NextResponse(session.nonce), res => session.persist(res))
}

export const POST = async (req: NextRequest) => {
	const { message, signature } = await req.json()
	const session = await Session.fromRequest(req)

	try {
		const siweMessage = new SiweMessage(message)
		const { data: fields } = await siweMessage.verify({ signature, nonce: session.nonce })

		if (fields.nonce !== session.nonce) {
			return tap(new NextResponse('Invalid nonce.', { status: 422 }), res => session.clear(res))
		}

		session.nonce = undefined
		session.userId = fields.address
	} catch (error) {
		switch (error) {
			case SiweErrorType.INVALID_NONCE:
			case SiweErrorType.INVALID_SIGNATURE:
				return tap(new NextResponse(String(error), { status: 422 }), res => session.clear(res))

			default:
				return tap(new NextResponse(String(error), { status: 400 }), res => session.clear(res))
		}
	}

	const upsertUser = await db.transaction(async tx => {
		const user = await tx
			.insert(usersTable)
			.values({
				id: session.userId as string,
			})
			.onDuplicateKeyUpdate({
				set: {
					updatedAt: new Date(),
					id: session.userId as string,
				},
			})

		console.log('User upsert', user)
		// this is a bit of a hack since mysql doesn't support returning the inserted row
		// what we can do is check wether the number of updated rows is bigger than one,
		// if that's the case, it's an update, otherwise it's an insert
		const isInsert = user.rowsAffected === 1

		if (!isInsert) {
			const user = await tx.query.usersTable.findFirst({
				where: (users, { eq }) => eq(users.id, session.userId as string),
				with: {
					teams: true,
				},
			})

			console.log('User', user)
			return user?.teams[0].teamId
		}

		const insertTeam = await tx.insert(teamsTable).values({
			name: 'Personal',
			type: 'personal',
		})

		console.log('Insert team', insertTeam)

		const insertTeamMember = await tx.insert(teamMembersTable).values({
			userId: session.userId as string,
			teamId: Number(insertTeam.insertId),
			role: 'owner',
			createdAt: new Date(),
			updatedAt: new Date(),
		})

		console.log('Insert team member', insertTeamMember)

		return Number(insertTeam.insertId)
	})

	session.teamId = upsertUser

	return tap(new NextResponse(''), res => session.persist(res))
}

export const DELETE = async (req: NextRequest) => {
	const session = await Session.fromRequest(req)

	return tap(new NextResponse(''), res => session.clear(res))
}
