module.exports = {
	root: true,
	env: {
		browser: true,
		node: true
	},
	parserOptions: {
		parser: '@babel/eslint-parser',
		requireConfigFile: false
	},
	extends: [
		'@nuxtjs',
		'plugin:nuxt/recommended',
		'prettier'
	],
	plugins: [],
	// add your custom rules here
	rules: {
		indent: ['error', 'tab', { SwitchCase: 1 }],
		// 'quote-props': ["error", "as-needed"],
		'arrow-parens': ['error', 'as-needed'],
		'no-tabs': 'off',
		curly: ['error', 'multi-line'],
		'no-console': 'off',
		'no-undef': ['warn', { typeof: false }],
		// 'standard/computed-property-even-spacing': 'off',
		"space-before-function-paren": ["error", "always"],
		'import/no-webpack-loader-syntax': 'off',
		'prefer-promise-reject-errors': 'off',
		'no-throw-literal': 'off',
		'no-multiple-empty-lines': 'off',
		'vue/html-indent': ['error', 'tab', {
			attribute: 0,
			baseIndent: 1,
			closeBracket: 0,
			alignAttributesVertically: true,
			ignores: []
		}]
	}
}
