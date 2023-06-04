import { env } from '@/env.mjs'
import { connect } from '@planetscale/database'
import { drizzle } from 'drizzle-orm/planetscale-serverless'
// create the connection
const connection = connect({
	url: env.DATABASE_URL,
})

const db = drizzle(connection)
