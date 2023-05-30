'use client'

import { SiweMessage } from 'siwe'
import { APP_NAME } from '@/lib/consts'
import { useRouter } from 'next/navigation'
import { FC, PropsWithChildren } from 'react'
import { WagmiConfig, createConfig } from 'wagmi'
import { IconContext } from '@phosphor-icons/react'
import { ConnectKitProvider, SIWEConfig, SIWEProvider, getDefaultConfig, useSIWE } from 'connectkit'

const config = createConfig(
	getDefaultConfig({
		appName: APP_NAME,
		infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
		walletConnectProjectId: process.env.NEXT_PUBLIC_WC_ID!,
	})
)

const siweConfig: SIWEConfig = {
	getNonce: async () => {
		const res = await fetch(`/login/siwe`, { method: 'PUT' })
		if (!res.ok) throw new Error('Failed to fetch SIWE nonce')

		return res.text()
	},
	createMessage: ({ nonce, address, chainId }) => {
		return new SiweMessage({
			nonce,
			chainId,
			address,
			version: '1',
			uri: window.location.origin,
			domain: window.location.host,
			statement: 'Sign In With Ethereum to prove you control this wallet.',
		}).prepareMessage()
	},
	verifyMessage: ({ message, signature }) => {
		return fetch(`/login/siwe`, {
			method: 'POST',
			body: JSON.stringify({ message, signature }),
			headers: { 'Content-Type': 'application/json' },
		}).then(res => res.ok)
	},
	getSession: async () => {
		const res = await fetch(`/login/siwe`)
		if (!res.ok) throw new Error('Failed to fetch SIWE session')

		const { userId } = await res.json()
		return userId ? { address: userId, chainId: 1 } : null
	},
	signOut: () => fetch(`/login/siwe`, { method: 'DELETE' }).then(res => res.ok),
}

const ClientLayout: FC<PropsWithChildren<{}>> = ({ children }) => {
	const router = useRouter()
	return (
		<IconContext.Provider value={{ color: 'currentColor', size: '' }}>
			<WagmiConfig config={config}>
				<SIWEProvider
					onSignIn={() => router.push('/dashboard')}
					onSignOut={() => router.push('/login')}
					{...siweConfig}
				>
					<ConnectKitProvider options={{ hideBalance: true, enforceSupportedChains: false }}>
						{children}
					</ConnectKitProvider>
				</SIWEProvider>
			</WagmiConfig>
		</IconContext.Provider>
	)
}

export default ClientLayout
export { config as wagmiConfig }
