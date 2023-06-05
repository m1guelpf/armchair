import type { Config } from 'drizzle-kit'

export default {
	schema: './src/db/schema.ts',
	out: './drizzle',
	connectionString: `mysql://hdihxg50j4mb4h3cu6yv:pscale_pw_NQetYNDeLcxAvlJQwMguuIIlIHhs2ikXUnw4lfpVYDW@aws.connect.psdb.cloud/arboretum?ssl={"rejectUnauthorized":true}`,
} satisfies Config
