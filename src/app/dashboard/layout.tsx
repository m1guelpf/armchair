import { db } from '@/db'
import Link from 'next/link'
import Session from '@/lib/session'
import { error } from '@/lib/errors'
import Navigation from './Navigation'
import { cookies } from 'next/headers'
import { PropsWithChildren } from 'react'
import { eq, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import TeamSwitcher from '@/components/TeamSwitcher'
import { teamMembersTable, teamsTable } from '@/db/schema'
import { Bell, X, List, Cube } from '@/components/ui/icons'
import ConnectWallet, { MobileProfileNav } from '@/components/ConnectWallet'
import Collapsible, { CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible'

const navigation = [
	{ name: 'Overview', href: '/dashboard' },
	{ name: 'Team Settings', href: '/dashboard/team-settings' },
]

const DashboardLayout = async ({ children }: PropsWithChildren<{}>) => {
	const session = await Session.fromCookies(cookies())
	const user = await db.query.usersTable.findFirst({
		where: (users, { eq }) => eq(users.id, session.userId as string),
		with: {
			teams: true,
		},
	})
	if (!user) throw new Error('User not found')

	const teams =
		user.teams.length === 0
			? []
			: await db
					.select()
					.from(teamsTable)
					.where(
						inArray(
							teamsTable.id,
							user.teams.map(membership => membership.teamId)
						)
					)

	const switchTeam = async (teamId: number) => {
		'use server'

		const session = await Session.fromCookies(cookies())
		const team = await db.query.teamsTable.findFirst({
			where: (teams, { eq }) => eq(teams.id, teamId),
			with: {
				members: true,
			},
		})
		if (!team) return error('Team not found')
		if (!team.members.length) return error('You are not a member of this team')

		session.teamId = team.id

		revalidatePath('/dashboard/team-settings')
		await session.persist(cookies())
	}

	const createTeam = async (name: string) => {
		'use server'

		const session = await Session.fromCookies(cookies())
		const teamInsert = await db.insert(teamsTable).values({
			name,
		})
		const teamMembersInsert = await db.insert(teamMembersTable).values({
			teamId: Number(teamInsert.insertId),
			userId: session.userId as string,
			role: 'owner',
		})

		session.teamId = Number(teamInsert.insertId)

		revalidatePath('/dashboard/team-settings')
		await session.persist(cookies())
	}

	return (
		<div className="min-h-screen bg-neutral-100">
			<div className="bg-neutral-800 pb-32 dark">
				<Collapsible asChild>
					<nav className="bg-neutral-800 group">
						<div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
							<div className="border-b border-neutral-700">
								<div className="flex h-16 items-center justify-between px-4 sm:px-0">
									<div className="flex items-center">
										<Link href="/dashboard" className="flex-shrink-0">
											<Cube className="h-8 w-8" color="white" weight="duotone" />
										</Link>
										<TeamSwitcher
											className="ml-4"
											onSwitch={switchTeam}
											onCreate={createTeam}
											currentTeamId={session.teamId!}
											teams={teams}
										/>
									</div>
									<div className="hidden md:block">
										<div className="ml-4 flex items-center md:ml-6">
											<button
												type="button"
												className="rounded-full bg-neutral-800 p-1 text-neutral-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-800"
											>
												<span className="sr-only">View notifications</span>
												<Bell className="h-6 w-6" aria-hidden="true" />
											</button>
											<div className="relative ml-3">
												<ConnectWallet />
											</div>
										</div>
									</div>
									<div className="-mr-2 flex md:hidden">
										{/* Mobile menu button */}
										<CollapsibleTrigger asChild>
											<button className="inline-flex items-center justify-center rounded-md bg-neutral-800 p-2 text-neutral-400 hover:bg-neutral-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-800">
												<span className="sr-only">Open main menu</span>
												<X
													className="hidden h-6 w-6 radix-state-open:block group-radix-state-open:block"
													aria-hidden="true"
												/>
												<List
													className="hidden h-6 w-6 group-radix-state-closed:block"
													aria-hidden="true"
												/>
											</button>
										</CollapsibleTrigger>
									</div>
								</div>
							</div>
							<div className="mt-2 hidden md:flex items-baseline space-x-4">
								{navigation.map(item => (
									<Navigation key={item.name} href={item.href}>
										{item.name}
									</Navigation>
								))}
							</div>
						</div>
						<CollapsibleContent className="border-b border-neutral-700 md:hidden">
							<MobileProfileNav navigation={navigation} />
						</CollapsibleContent>
					</nav>
				</Collapsible>
			</div>

			<main className="-mt-24">
				<div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
					<div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">{children}</div>
				</div>
			</main>
		</div>
	)
}

export default DashboardLayout
