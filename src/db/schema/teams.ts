import { users } from '@/db/schema/users'
import { InferModel, relations } from 'drizzle-orm'
import { mysqlTable, serial, text, varchar, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core'

export const teams = mysqlTable('teams', {
	id: serial('id').primaryKey().autoincrement(),
	name: varchar('name', {
		length: 255,
	}),
	type: mysqlEnum('type', ['personal', 'organization']).default('organization'),
	avatarUrl: text('avatar_url'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').onUpdateNow(),
})

export type Team = InferModel<typeof teams>
export type NewTeam = InferModel<typeof teams, 'insert'>

export const teamsRelations = relations(teams, ({ many }) => ({
	members: many(teamMembers),
}))

export const teamMembers = mysqlTable('team_members', {
	userId: varchar('user_id', {
		length: 42,
	}).notNull(),
	teamId: serial('team_id').notNull(),
	role: mysqlEnum('role', ['owner', 'admin', 'member']).default('member').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').onUpdateNow(),
})

export type TeamMember = InferModel<typeof teamMembers>
export type NewTeamMember = InferModel<typeof teamMembers, 'insert'>

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
	team: one(teams, {
		fields: [teamMembers.teamId],
		references: [teams.id],
	}),
	user: one(users, {
		fields: [teamMembers.userId],
		references: [users.id],
	}),
}))
