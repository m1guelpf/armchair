import type { Config } from 'drizzle-kit'

export default {
	schema: './src/db/schema.ts',
	out: './drizzle',
	// it has to be hardcoded here cause for some reason drizzle-kit doesn't have access to env variables ¯\_(ツ)_/¯
	connectionString: `your-connection-string`,
} satisfies Config
