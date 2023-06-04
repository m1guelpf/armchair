const { NormalModuleReplacementPlugin } = require('webpack')
require('./src/env.mjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverActions: true,
	},
	webpack: config => {
		config.resolve.fallback = { fs: false, net: false, tls: false, crypto: false }
		config.plugins.push(
			new NormalModuleReplacementPlugin(/node:/, resource => {
				resource.request = resource.request.replace(/^node:/, '')
			})
		)
		return config
	},
}

module.exports = nextConfig
