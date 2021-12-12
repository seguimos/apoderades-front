

export const state = () => {
	return {
		locales: {}
	}
}

export const mutations = {
	locales (s, locales) {
		s.locales = Object.assign({}, s.locales, locales)
	},
	local (s, {localID, local}) {
		s.locales = Object.assign({}, s.locales, {[localID]: local})
	}
}
