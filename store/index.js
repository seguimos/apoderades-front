

export const state = () => {
	return {
		locales: {}
	}
}

export const mutations = {
	locales (s, locales) {
		s.locales = Object.assign({}, s.locales, locales)
	},
	local (s, local) {
		const id = local._id
		delete local._id
		s.locales = Object.assign({}, s.locales, {[id]: local})
	}
}
