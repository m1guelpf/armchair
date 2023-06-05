import { InferModel, relations } from 'drizzle-orm'
import { mysqlTable, serial, text, varchar, timestamp, mysqlEnum, int, primaryKey } from 'drizzle-orm/mysql-core'

export const usersTable = mysqlTable('users', {
	id: varchar('id', {
		length: 42,
	}).primaryKey(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').onUpdateNow(),
})

export type User = InferModel<typeof usersTable>
export type NewUser = InferModel<typeof usersTable, 'insert'>

export const teamsTable = mysqlTable('teams', {
	id: int('id').primaryKey().autoincrement(),
	name: varchar('name', {
		length: 255,
	}).notNull(),
	type: mysqlEnum('type', ['personal', 'organization']).default('organization').notNull(),
	avatarUrl: text('avatar_url'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').onUpdateNow(),
})

export type Team = InferModel<typeof teamsTable>
export type TeamType = (typeof teamsTable.type.enumValues)[number]
export type NewTeam = InferModel<typeof teamsTable, 'insert'>

export const teamMembersTable = mysqlTable(
	'team_members',
	{
		userId: varchar('user_id', {
			length: 42,
		}).notNull(),
		teamId: int('team_id').notNull(),
		role: mysqlEnum('role', ['owner', 'admin', 'member']).default('member').notNull(),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').onUpdateNow(),
	},
	table => {
		return { pk: primaryKey(table.userId, table.teamId) }
	}
)

export type TeamMember = InferModel<typeof teamMembersTable>
export type TeamRoleType = (typeof teamMembersTable.role.enumValues)[number]
export type NewTeamMember = InferModel<typeof teamMembersTable, 'insert'>

export const usersRelations = relations(usersTable, ({ many }) => ({
	teams: many(teamMembersTable),
}))

export const teamsRelations = relations(teamsTable, ({ many }) => ({
	members: many(teamMembersTable),
}))
export const teamMembersRelations = relations(teamMembersTable, ({ one }) => ({
	team: one(teamsTable, {
		fields: [teamMembersTable.teamId],
		references: [teamsTable.id],
	}),
	user: one(usersTable, {
		fields: [teamMembersTable.userId],
		references: [usersTable.id],
	}),
}))
