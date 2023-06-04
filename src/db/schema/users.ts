import { relations } from 'drizzle-orm'
import { teamMembers, teams } from '@/db/schema/teams'
import { mysqlTable, serial, text, varchar, timestamp } from 'drizzle-orm/mysql-core'

export const users = mysqlTable('users', {
	id: varchar('id', {
		length: 42,
	}).primaryKey(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const teamsRelations = relations(teams, ({ many }) => ({
	teams: many(teamMembers),
}))
