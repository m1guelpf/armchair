import { db } from '@/db'
import { eq } from 'drizzle-orm'
import Session from '@/lib/session'
import DeleteTeam from './DeleteTeam'
import { cookies } from 'next/headers'
import TeamMembers from './TeamMembers'
import { teamsTable } from '@/db/schema'
import { notFound } from 'next/navigation'
import EditTeamDetails from './EditTeamDetails'

const TeamSettingsPage = async () => {
	const session = await Session.fromCookies(cookies())
	const team = await db.query.teamsTable.findFirst({
		where: (teams, { eq }) => eq(teams.id, session.teamId!),
		with: {
			members: true,
		},
	})

	const user = team?.members.find(member => member.userId == session.userId)
	if (!team || !user) return notFound()

	return (
		<div className="space-y-8">
			<EditTeamDetails key={team.id} team={team} />
			<TeamMembers team={team} role={user.role} />
			<DeleteTeam team={team} role={user.role} />
		</div>
	)
}

export default TeamSettingsPage
