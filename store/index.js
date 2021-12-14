import _ from "lodash"


export const state = () => {
	return {
		locales: {}
	}
}

export const mutations = {
	locales (s, ls) {
		const locales = _.reduce(ls, (res, l, localID) => {
			const local = {
				localID,
				nombre: l.nombre,
				comuna: _.get(l, 'ubicacion.comuna'),
				comunaID: _.get(l, 'ubicacion.comunaCodigo'),
				regionID: _.get(l, 'ubicacion.region'),
				direccion: _.get(l, 'ubicacion.direccion'),
				latitud: _.get(l, 'ubicacion.latitud'),
				longitud: _.get(l, 'ubicacion.longitud'),
			}
			res[localID] = local
			return res
		}, {})
		s.locales = Object.assign({}, s.locales, locales)
	},
	local (s, l) {
		const localID = l._id
		const local = {
			localID,
			nombre: l.nombre,
			comuna: _.get(l, 'ubicacion.comuna'),
			comunaID: _.get(l, 'ubicacion.comunaCodigo'),
			regionID: _.get(l, 'ubicacion.region'),
			direccion: _.get(l, 'ubicacion.direccion'),
			latitud: _.get(l, 'ubicacion.latitud'),
			longitud: _.get(l, 'ubicacion.longitud'),
		}
		const r = {}
		r[localID] = local
		s.locales = Object.assign({}, s.locales, r)
	}
}
