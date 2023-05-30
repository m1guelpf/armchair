import './globals.css'
import { Metadata } from 'next'
import ClientLayout from './client'
import { APP_NAME } from '@/lib/consts'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { FC, PropsWithChildren } from 'react'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', adjustFontFallback: false })

export const metadata = {
	title: {
		default: APP_NAME,
		template: `%s – ${APP_NAME}`,
	},
} satisfies Metadata

const RootLayout: FC<PropsWithChildren<{}>> = ({ children }) => {
	return (
		<html lang="en" className={inter.variable}>
			<body className="font-sans ">
				<ClientLayout>{children}</ClientLayout>
				<Toaster />
			</body>
		</html>
	)
}

export default RootLayout
