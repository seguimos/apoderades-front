

export const state = () => {
	return {
		apoderade: null
	}
}

export const mutations = {
	usuarioLogeado (state, value) {
		state.apoderade = value.apoderade
	},
	usuarioNoValidado (state, value) {
		state.apoderade = value.apoderade
	}
}
