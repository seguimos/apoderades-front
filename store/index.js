import _ from "lodash"


export const state = () => {
	return {
		locales: {},
		apoderades: {},
	}
}

export const mutations = {
	locales (s, ls) {
		const locales = _.reduce(ls, (res, l, localID) => {
			const nombre = _.map((l.nombre || '').toLowerCase().split(' '), p => _.capitalize(p)).join(' ')
			const local = {
				...l,
				localID,
				nombre,
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
		s.locales = _.assignIn({}, s.locales, locales)
	},
	local (s, l) {
		const localID = l._id
		const nombre = _.map((l.nombre || '').toLowerCase().split(' '), p => _.capitalize(p)).join(' ')
		const local = {
			...l,
			localID,
			nombre,
			comuna: _.get(l, 'ubicacion.comuna'),
			comunaID: _.get(l, 'ubicacion.comunaCodigo'),
			regionID: _.get(l, 'ubicacion.region'),
			direccion: _.get(l, 'ubicacion.direccion'),
			latitud: _.get(l, 'ubicacion.latitud'),
			longitud: _.get(l, 'ubicacion.longitud'),
		}
		const r = {}
		r[localID] = local
		s.locales = _.assignIn({}, s.locales, r)
	},
	apoderades (s, aps) {
		const apoderades = _.reduce(aps, (res, apoderade) => {
			const usuarioID = `${apoderade.usuarioID}`
			delete apoderade.usuarioID
			const apoderadeAnterior = _.find(s.apoderades, a => a.usuarioID === usuarioID)
			res[usuarioID] = _.assignIn({}, apoderadeAnterior, apoderade)
			return res
		}, {})
		s.apoderades = _.assignIn({}, s.apoderades, apoderades)
	},
	apoderade (s, apo) {
		const usuarioID = `${apo.usuarioID}`
		// delete apo.usuarioID
		const apoderadeAnterior = _.find(s.apoderades, a => a.usuarioID === usuarioID)
		const apoderades = Object.assign({}, s.apoderades)
		apoderades[usuarioID] = _.assignIn(apoderadeAnterior, apo)
		s.apoderades = apoderades
	}
}
