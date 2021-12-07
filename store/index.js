

export const state = () => {
	return {

		token: null,
		usuario: null,
		id: null
	}
}

export const mutations = {
	usuarioLogeado (state, value) {
		state.token = value.token
		state.usuario = value.usuario
		state.id = value.id
	}
}
