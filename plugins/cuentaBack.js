import axios from 'axios'
import Vue from 'vue'
import localforage from 'localforage'

import consolo from '@lib/consolo'
import emisorEventos from '@lib/emisorEventos'

const backURL = process.env.backURL

const cuentaBackStore = localforage.createInstance({
	name: 'cuentaBackBackStore'
})

const usarStores = true

const cuentaBack = {
	// Proporciona metodos on, off, emit, para emisión y escucha de eventos
	...emisorEventos,

	vm: undefined,
	_apoderade: undefined,

	sinConexion: undefined,
	backURL,

	async init (vm) {
		const fx = 'cuentaBack>init'
		this.vm = vm
		// Revisar que se esté utilizando microservicio de cuentas
		if (!vm.$cuenta) {
			console.error(
				'En este punto el microservicio de cuentas debería estar conectado'
			)
			await new Promise(resolve => {
				setTimeout(resolve(), 1000)
			})
			return cuentaBack.init(vm)
		}
		if (usarStores) this.apoderade = await cuentaBackStore.getItem('apoderade', null)

		// Si ya habia usuario logueado al momento de inicializar este script, leer datos
		if (this.usuario && !this.apoderade) cuentaBack.leerMisDatos()
		consolo.log(fx, { token: this._token })

		// Frente a cambios de usuario, reaccionar acorde
		cuentaBack.vm.$cuenta.on('cambioToken', token => {
			if (token) cuentaBack.leerMisDatos()
			else cuentaBack.salir()
		})
	},

	get token () {
		return this.vm.$cuenta.token
	},
	get cuenta () { return this.vm.$cuenta },
	get usuario () { return this.vm.$cuenta.usuario },
	get miLlavero () {
		return this.vm.$cuenta.miLlavero
	},

	get apoderade () {
		return this._apoderade
	},

	set apoderade (v) {
		if (usarStores) {
			if (v) cuentaBackStore.setItem('apoderade', v)
			else cuentaBackStore.removeItem('apoderade')
		}
		this._apoderade = v
	},

	// async ping () {
	// 	const fx = 'cuentaBack>ping'
	// 	try {
	// 		consolo.log(fx)
	// 		const r = await solicitar({
	// 			url: `${cuentaBack.backURL}/llavero`,
	// 			method: 'get'
	// 		}, e => { this.sinConexion = true })
	// 		consolo.log(fx, 'r', r)
	// 		this.sinConexion = !(r && r.ok)
	// 		if (!r) return

	// 		const { llaveroID, llaves } = r
	// 		if (!llaveroID) throw 'Falta llaveroID'
	// 		const llavero = new Llavero(llaveroID)
	// 		await llavero.prepararDestinatario(llaves)
	// 		llaverocuentaBack = llavero
	// 		if (usarStores) cuentaBackStore.setItem('llaverocuentaBack', llavero)
	// 		return llaverocuentaBack
	// 	} catch (e) {
	// 		console.error(fx, e)
	// 	}
	// },

	leyendoDatos: null,
	async leerMisDatos () {
		if (this.leyendoDatos) return
		const fx = 'cuentaBack>leerMisDatos'
		this.leyendoDatos = true
		try {
			console.log(fx)
			const r = await solicitar({
				method: 'get',
				url: `${backURL}/apoderade`
			})

			if (!r || !r.ok) {
				console.error(fx, 'fail', r)
				return
			}
			console.log(fx, 'r', r)
			const { apoderade } = r
			this.apoderade = apoderade
			return r
		} catch (e) {
			console.error(fx, e)
			this.apoderade = false
		}
	},

	async apoderadosXRegion (region, roles) {
		const fx = 'cuentaBack>apoderadosXRegion'
		try {
			console.log(fx)
			const r = await solicitar({
				method: 'get',
				url: `${backURL}/apoderades/region`,
				params: { region, roles }
			})
			if (!r || !r.ok) {
				console.error(fx, 'fail', r)
				return
			}
			console.log(fx, 'r', r)
		} catch (e) {
			console.error(fx, e)
		}
	},

	async apoderadosXcomuna (comunaCodigo, roles) {
		const fx = 'cuentaBack>apoderadosXcomuna'
		try {
			console.log(fx)
			const r = await solicitar({
				method: 'get',
				url: `${backURL}/apoderades/comuna/:comunaCodigo`,
				params: { comunaCodigo, roles }
			})

			if (!r || !r.ok) {
				console.error(fx, 'fail', r)
				return
			}
			console.log(fx, 'r', r)
		} catch (e) {
			console.error(fx, e)
		}
	},

	async autoValidarDatos ({ territorioPreferencia, nombre, apellido, rut, email, telefono, rol }) {
		const fx = 'cuentaBack>autoValidarDatos'
		// Primero obtener autorización del back
		const r = await solicitar({
			method: 'get',
			url: `${backURL}/autorizaredicion`
		})
		console.log(fx, 'back/autorizaredicion', r)
		if (!r || !r.ok) {
			console.error(fx, 'fail autorizando creación de usuario (back)', r)
			return
		}
		const autorizacionBack = r.autorizacion
		// console.log('autorizacionDelBack', autorizacionBack)
		// Crear usuario en microservicio de cuentas
		const c = await cuentaBack.vm.$cuenta.editarCuenta(autorizacionBack, { nombre, apellido, email, telefono, rut, rol })
		if (!c || !c.ok) {
			console.error(fx, 'fail editando usuario en microcuentas', c)
			return
		}

		console.log(fx, 'microcuentas/editarCuenta', c)

		const s = await solicitar({
			method: 'post',
			url: `${backURL}/apoderade/datos`,
			data: { territorioPreferencia }
		})

		if (!s || !s.ok) {
			console.error(fx, 'fail', s)
			return
		}
		console.log(fx, 'r', s)
	},

	async asignarTerritorio ({ apoderadeID, region, comunaCodigo }) {
		const fx = 'cuentaBack>asignarTerritorio'
		try {
			console.log(fx)
			const r = await solicitar({
				method: 'post',
				url: `${backURL}/apoderades/:apoderadeID/territorio`,
				body: { territorio: {	region, comunaCodigo } },
				params: { apoderadeID }
			})

			if (!r || !r.ok) {
				console.error(fx, 'fail', r)
				return
			}
			console.log(fx, 'r', r)
		} catch (e) {
			console.error(fx, e)
		}
	},

	async asignarLocal ({ region, localId, idCriptocuentas }) {
		const fx = 'cuentaBack>asignarLocal'
		try {
			console.log(fx)
			const r = await solicitar({
				method: 'post',
				url: `${backURL}/locales/:region/locales/:localId/apoderades`,
				body: { idCriptocuentas },
				params: { region, localId }
			})

			if (!r || !r.ok) {
				console.error(fx, 'fail', r)
				return
			}
			console.log(fx, 'r', r)
		} catch (e) {
			console.error(fx, e)
		}
	},

	async localesXRegion ({ region }) {
		const fx = 'cuentaBack>localesXRegion'
		try {
			console.log(fx)
			const r = await solicitar({
				method: 'get',
				url: `${backURL}/locales/:region`,
				params: { region }
			})

			if (!r || !r.ok) {
				console.error(fx, 'fail', r)
				return
			}
			console.log(fx, 'r', r)
		} catch (e) {
			console.error(fx, e)
		}
	},

	async localesXComuna ({ region, comunaCodigo }) {
		const fx = 'cuentaBack>localesXComuna'
		try {
			console.log(fx)
			const r = await solicitar({
				method: 'get',
				url: `${backURL}/locales/${region}/comunas/${comunaCodigo}/`
			})

			if (!r || !r.ok) {
				console.error(fx, 'fail', r)
				return
			}
			console.log(fx, 'r', r)
			return r
		} catch (e) {
			console.error(fx, e)
		}
		this.leyendoDatos = false
	},

	async misTerritorios () {
		const fx = 'cuentaBack>misTerritorios'
		try {
			console.log(fx)
			const r = await solicitar({
				method: 'get',
				url: `${backURL}/apoderade/territorios`
			})

			if (!r || !r.ok) {
				console.error(fx, 'fail', r)
				return
			}
			console.log(fx, 'r', r)
			return r
		} catch (e) {
			console.error(fx, e)
		}
		this.leyendoDatos = false
	},

	async obtenerLocal ({ region, localId }) {
		const fx = 'cuentaBack>obtenerLocal'
		try {
			console.log(fx)
			const r = await solicitar({
				method: 'get',
				url: `${backURL}/locales/:region/locales/:localId`,
				params: { region, localId }
			})

			if (!r || !r.ok) {
				console.error(fx, 'fail', r)
				return
			}
			console.log(fx, 'r', r)
		} catch (e) {
			console.error(fx, e)
		}
	},

	async buscarXRut (rut) {
		const fx = 'cuentaBack>buscarXRut'
		// Primero obtener autorización del back
		const r = await solicitar({
			method: 'get',
			url: `${backURL}/autorizarBusquedaPorRut`
		})
		// console.log(fx, 'back/autorizarBusquedaPorRut', r)

		if (!r || !r.ok) {
			console.error(fx, 'fail autorizando creación de usuario (back)', r)
			return
		}
		const autorizacion = r.autorizacion
		const s = await cuentaBack.vm.$cuenta.buscarRut(autorizacion, rut)
		return s
	},

	async salir () {
		cuentaBack.apoderade = null
		await cuentaBackStore.clear()
		// cuentaBack.ping()
		return true
	},

	async crearApoderade ({ nombre, apellido, email, telefono, rol, rut, region, comunaCodigo, localAsignado }) {
		const fx = 'cuentaBack>crearApoderade'
		// Primero obtener autorización del back
		const r = await solicitar({
			method: 'get',
			url: `${backURL}/autorizarCreacion`
		})
		// console.log(fx, 'back/autorizarCreacion', r)

		if (!r || !r.ok) {
			console.error(fx, 'fail autorizando creación de usuario (back)', r)
			return
		}
		const autorizacionBack = r.autorizacion

		// Crear usuario en microservicio de cuentas
		const c = await cuentaBack.vm.$cuenta.crearCuenta(autorizacionBack, { nombre, apellido, email, telefono, rut, rol })
		if (!c || !c.ok) {
			console.error(fx, 'fail creando usuario en microcuentas', c)
			return
		}
		console.log(fx, 'microcuentas/crearCuenta', c)
		const usuarioID = c.usuarioID
		const tokenIngresoEncriptado = c.tokenIngresoEncriptado

		// Ya se tiene el usuarioID, ahora a hacer lo que se tenga q hacer con eso y los demas datos en el back.
		const b = await solicitar({
			method: 'post',
			url: `${backURL}/apoderades`,
			data: {
				usuarioID,
				tokenIngresoEncriptado,
				rol,
				territorioPreferencia: {
					region, comunaCodigo, localAsignado
				}
			}
		})
		console.log(fx, 'back/nuevo-usuario', b)
	}
}



async function solicitar (request, errorHandler) {
	const _ = cuentaBack.vm._
	const defaultHeaders = {
		Accept: 'application/json',
		'Content-Type': 'application/json',
		Authorization: `Bearer ${cuentaBack.cuenta.token}`,
		'Token-Autofirmado': cuentaBack.cuenta.tokenAutofirmado
	}
	const ops = _.merge({ headers: defaultHeaders }, request)

	const data = await axios(ops).then(r => {
		if (cuentaBack.sinConexion === undefined || cuentaBack.sinConexion) cuentaBack.sinConexion = false
		return r.data
	}).catch(errorHandler || capturadorErrorSolicitud)

	if (!data) {
		console.error('Sin respuesta')
		return data
	}
	if (data.desconectar) cuentaBack.salir()
	if (!data.ok && _.get(data, 'error.titulo')) {
		// Mostrar mensaje de error ya preconfigurado
	}
	if (_.get(data, 'notificar.titulo')) {
		// Mostrar mensaje ya preconfigurado
	}
	return data
}

function capturadorErrorSolicitud (error) {
	console.error('capturadorErrorSolicitud', error)
	if (error.response) {
		const { status, data } = error.response
		console.log('Status fuera del rango 2XX', { status, data })
	} else if (error.request) {
		console.log('Sin respuesta (capturadorErrorSolicitud)')
		// consolo.log(error.request)
	} else {
		console.log('Error inesperado (capturadorErrorSolicitud)', error.message)
	}
	consolo.log(error.config)
}

Vue.util.defineReactive(cuentaBack, 'apoderade', cuentaBack.apoderade)
// Vue.util.defineReactive(cuentaBack, 'sinConexion', cuentaBack.sinConexion)

export default function ({ app }, inject) {
	inject('back', cuentaBack)

	if (!app.mixins) app.mixins = []
	app.mixins.push({
		mounted () {
			const vm = this
			vm.$nextTick(() => {
				consolo.log('cuentaBack MOUNTED')
				cuentaBack.init(vm)
			})
		}
	})
}
