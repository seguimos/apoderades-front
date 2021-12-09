import path from 'path';
import webpack from 'webpack';

const dev = process.env.MODO === 'dev';

export default {
	// Target: https://go.nuxtjs.dev/config-target
	target: 'static',
	server: {
		port: process.env.PORT || 3000,
		host: '0.0.0.0', // default: localhost,
		timing: false
	},
	env: {
		dev,
		apiOrigin: process.env.LOCAL ? 'https://capi.local.dev' : 'https://capi.lesapoderades.cl'
	},
	// Global page headers: https://go.nuxtjs.dev/config-head
	head: {
		title: 'Apoderadas y Apoderados x Boric',
		htmlAttrs: {
			lang: 'es'
		},
		meta: [
			{ charset: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
			{ hid: 'description', name: 'description', content: '' },
			{ name: 'format-detection', content: 'telephone=no' }
		],
		link: [
			{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
		]
	},

	// Global CSS: https://go.nuxtjs.dev/config-css
	css: [
		'ant-design-vue/dist/antd.css',
		'~/style/base.sass',
		'~/style/utils.sass',
		'~/style/paleta.sass'
	],

	// Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
	plugins: [
		'@/plugins/antd-ui',
		'@/plugins/consolo',
		'@/plugins/lodash',
		'@/plugins/i18n',
		'@/plugins/microCuentas',
		{ src: '@/plugins/leaflet', mode: 'client' },
		'plugins/localforage.js'
	],

	// Auto import components: https://go.nuxtjs.dev/config-components
	components: true,

	// Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
	buildModules: [
		// https://go.nuxtjs.dev/eslint
		'@nuxtjs/eslint-module',
		'@nuxtjs/google-fonts'
	],

	// Modules: https://go.nuxtjs.dev/config-modules
	modules: [
	],

	googleFonts: {
		donwload: true,
		families: {
			'Roboto+Slab': {
				wght: [300, 400, 700, 900],
				ital: [300, 400, 700, 900]
			}
		}
	},

	// Build Configuration: https://go.nuxtjs.dev/config-build
	build: {
		extend(config, ctx) {
			config.resolve.alias['@style'] = path.join(__dirname, 'style');
			config.resolve.alias['@mainlib'] = path.join(__dirname, 'lib');
		},
		plugins: [
			new webpack.IgnorePlugin({
				resourceRegExp: /^\.\/locale$/,
				contextRegExp: /moment$/
			})
		]
	}
};
