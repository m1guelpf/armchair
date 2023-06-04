import { z } from 'zod'
import { createEnv } from '@t3-oss/env-nextjs'

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().url(),
		SESSION_SECRET: z.string().min(1),
	},
	client: {
		NEXT_PUBLIC_WC_ID: z.string().min(1),
		NEXT_PUBLIC_INFURA_ID: z.string().min(1),
	},
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		SESSION_SECRET: process.env.SESSION_SECRET,
		NEXT_PUBLIC_WC_ID: process.env.NEXT_PUBLIC_WC_ID,
		NEXT_PUBLIC_INFURA_ID: process.env.NEXT_PUBLIC_INFURA_ID,
	},
})
