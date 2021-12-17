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
		const r = _.pickBy(s.locales)
		r[localID] = local
		s.locales = _.assignIn({}, s.locales, r)
	},
	apoderades (s, aps) {
		console.log('commit apoderades', aps)
		const apoderades = _.pickBy(s.apoderades, a => a)
		_.forEach(aps, apoderade => {
			const usuarioID = `${apoderade.usuarioID}`
			const apoderadeAnterior = _.find(apoderades, a => a.usuarioID === usuarioID)
			apoderades[usuarioID] = _.assignInWith({}, apoderadeAnterior, apoderade, (objValue, srcValue) => {
				return _.isUndefined(srcValue) ? objValue : srcValue;
			})
		})
		s.apoderades = apoderades
	},
	apoderade (s, apoderade) {
		console.log('commit apoderade', apoderade)
		const usuarioID = `${apoderade.usuarioID}`
		const apoderadeAnterior = _.find(s.apoderades, a => a.usuarioID === usuarioID)
		const apoderades = _.pickBy(s.apoderades, a => a)
		apoderades[usuarioID] = _.assignInWith({}, apoderadeAnterior, apoderade, (objValue, srcValue) => {
			return _.isUndefined(srcValue) ? objValue : srcValue;
		})

		console.log(`commit apoderades[${usuarioID}]`, apoderades[usuarioID])
		
		s.apoderades = apoderades
	}
}
