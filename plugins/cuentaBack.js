import axios from 'axios'
import Vue from 'vue'
import localforage from 'localforage'

import consolo from '@lib/consolo'
import emisorEventos from '@lib/emisorEventos'
import { _ } from './lodash'

const backURL = process.env.backURL
const dev = process.env.dev

const cuentaBackStore = localforage.createInstance({ name: 'cuentaBackBackStore' })

const usarStores = false

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
		if (cuentaBack.usuario && !cuentaBack.apoderade && cuentaBack.cuenta.tokenAutofirmado) {
			cuentaBack.leerMisDatos()
			cuentaBack.misTerritorios()
		}
		consolo.log(fx, { tokenAutofirmado: cuentaBack.cuenta.tokenAutofirmado })

		// Frente a cambios de usuario, reaccionar acorde
		cuentaBack.cuenta.on('cambioToken', token => {
			consolo.log('=============== on cambioToken')
			if (token) {
				cuentaBack.leerMisDatos()
				cuentaBack.misTerritorios()
			} else cuentaBack.salir()
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

	// Info de apoderado conectado

	leyendoDatos: null,
	async leerMisDatos () {
		if (this.leyendoDatos) return
		const fx = 'cuentaBack>leerMisDatos'
		this.leyendoDatos = true
		try {
			consolo.log(fx)
			const r = await solicitar({
				method: 'get',
				url: `${backURL}/apoderade`
			})
			this.leyendoDatos = false

			if (!r || !r.ok) {
				console.error(fx, 'fail', r)
				return
			}
			consolo.log(fx, 'r', r)
			const { apoderade } = r
			this.apoderade = apoderade
			return r
		} catch (e) {
			console.error(fx, e)
			this.apoderade = false
			this.leyendoDatos = false
		}
	},

	// Info de territorios que maneja apoderado conectado
	territorios: null,
	async misTerritorios () {
		const fx = 'cuentaBack>misTerritorios'
		try {
			consolo.log(fx)
			const r = await solicitar({
				method: 'get',
				url: `${backURL}/apoderade/territorios`
			})
			if (!r || !r.ok) throw ['No se pudo cargar territorios del usuario', r]
			// cuentaBack.vm.$message.success('Locales cargados')
			consolo.log(fx, 'r', r)
			return r
		} catch (e) {
			if (!(e instanceof Error) && _.isArray(e)) console.error(fx, ...e)
			else console.error(fx, e)
			cuentaBack.vm.$message.error('Algo falló')
		}
	},

	async salir () {
		cuentaBack.apoderade = null
		cuentaBack.territorio = null
		await cuentaBackStore.clear()
		return true
	},

	async crearApoderade ({ nombre, apellido, email, telefono, rut, region, comunaCodigo, localAsignado }) {
		const fx = 'cuentaBack>crearApoderade'
		try {
			// Primero obtener autorización del back
			const r = await solicitar({
				method: 'get',
				url: `${backURL}/autorizarCreacion`
			})
			if (!r || !r.ok) throw ['fail autorizando creación de usuario (back)', r]
			const { autorizacion } = r

			// Crear usuario en microservicio de cuentas
			const c = await cuentaBack.cuenta.crearCuenta(autorizacion, { nombre, apellido, email, telefono, rut })
			if (!c || !c.ok) throw ['fail creando usuario en microcuentas', c]
			// consolo.log(fx, 'microcuentas/crearCuenta', c)
			const { usuarioID, tokenIngresoEncriptado } = c

			// Ya se tiene el usuarioID, ahora a hacer lo que se tenga q hacer con eso y los demas datos en el back.
			const registroEnBack = await solicitar({
				method: 'post',
				url: `${backURL}/apoderades`,
				data: {
					usuarioID,
					url: `${new URL(window.location.href).origin}/ingresoConToken?token=`,
					tokenIngresoEncriptado,
					territorio: { region, comunaCodigo, localAsignado }
				}
			})
			if (!registroEnBack || !registroEnBack.ok) throw ['fail creando usuario en microcuentas', registroEnBack]
			cuentaBack.vm.$message.success('Registro realizado, se enviará correo al inscrito')
		} catch (e) {
			if (!(e instanceof Error) && _.isArray(e)) console.error(fx, ...e)
			else console.error(fx, e)
			cuentaBack.vm.$message.error('Algo falló')
		}
	},

	async soloCrearApoderade ({ nombre, apellido, email, telefono, rut }) {
		const fx = 'cuentaBack>soloCrearApoderade'
		try {
			// Primero obtener autorización del back
			const r = await solicitar({
				method: 'get',
				url: `${backURL}/autorizarCreacion`
			})
			if (!r || !r.ok) throw ['fail autorizando creación de usuario (back)', r]
			const { autorizacion } = r

			// Crear usuario en microservicio de cuentas
			const c = await cuentaBack.cuenta.crearCuenta(autorizacion, { nombre, apellido, email, telefono, rut })
			if (!c || !c.ok) throw ['fail creando usuario en microcuentas', c]
			// consolo.log(fx, 'microcuentas/crearCuenta', c)
			const { usuarioID, tokenIngresoEncriptado } = c

			// Ya se tiene el usuarioID, ahora a hacer lo que se tenga q hacer con eso y los demas datos en el back.
			const registroEnBack = await solicitar({
				method: 'post',
				url: `${backURL}/apoderades`,
				data: {
					nombre,
					email,
					usuarioID,
					url: `${new URL(window.location.href).origin}/ingresoConToken?token=`,
					tokenIngresoEncriptado
				}
			})
			if (!registroEnBack || !registroEnBack.ok) throw ['fail creando usuario en microcuentas', registroEnBack]
			cuentaBack.vm.$message.success('Registro realizado, se enviará correo al inscrito')
		} catch (e) {
			if (!(e instanceof Error) && _.isArray(e)) console.error(fx, ...e)
			else console.error(fx, e)
			cuentaBack.vm.$message.error('Algo falló')
		}
	},

	// OTROS APODERADOS

	async obtenerApoderade (apoderadeID) {
		if (this.leyendoDatos) return
		const fx = 'cuentaBack>obtenerApoderade'
		this.leyendoDatos = true
		try {
			consolo.log(fx, apoderadeID)
			const r = await solicitar({
				method: 'get',
				url: `${backURL}/apoderades/apoderade/${apoderadeID}`
			})
			this.leyendoDatos = false
			consolo.log(fx, 'r', r)
			return r
		} catch (e) {
			console.error(fx, e)
		}
	},


	async buscarXRut (rut) {
		const fx = 'cuentaBack>buscarXRut'
		try {
		// Primero obtener autorización del back
			const r = await solicitar({
				method: 'get',
				url: `${backURL}/autorizarBusquedaPorRut`
			})
			if (!r || !r.ok) throw ['No se pudo cargar local', r]

			const { autorizacion } = r
			const s = await cuentaBack.cuenta.buscarRut(autorizacion, rut)

			if (s.usuarioID) cuentaBack.vm.$message.success('Rut previamente inscrito')
			else cuentaBack.vm.$message.warn('Rut no inscrito')
			return s
		} catch (e) {
			if (!(e instanceof Error) && _.isArray(e)) console.error(fx, ...e)
			else console.error(fx, e)
			cuentaBack.vm.$message.error('Algo falló')
		}
	},

	async asignarTerritorio ({ apoderadeID, regionID, comunaID }) {
		const fx = 'cuentaBack>asignarTerritorio'
		try {
			consolo.log(fx)
			const r = await solicitar({
				method: 'post',
				url: `${backURL}/apoderades/${apoderadeID}/territorio`,
				data: { territorio: {	region: regionID, comunaCodigo:comunaID } }
			})
			if (!r || !r.ok) throw ['No se pudo asignar territorio', r]
			cuentaBack.vm.$message.success('Se asignó territorio')
			consolo.log(fx, 'r', r)
			return r
		} catch (e) {
			if (!(e instanceof Error) && _.isArray(e)) console.error(fx, ...e)
			else console.error(fx, e)
			cuentaBack.vm.$message.error('Algo falló')
		}
	},

	async asignarLocal ({ regionID, localID, usuarioID }) {
		const fx = 'cuentaBack>asignarLocal'
		try {
			const r = await solicitar({
				method: 'post',
				url: `${backURL}/locales/${regionID}/locales/${localID}/apoderades`,
				data: { usuarioID }
			})
			if (!r || !r.ok) throw ['No se pudo asignar local', r]
			cuentaBack.vm.$message.success('Se asignó local')
			consolo.log(fx, 'r', r)
			return r
		} catch (e) {
			if (!(e instanceof Error) && _.isArray(e)) console.error(fx, ...e)
			else console.error(fx, e)
			cuentaBack.vm.$message.error('Algo falló')
		}
	},


	// TERRITORIOS

	async apoderadosXRegion (region, roles) {
		const fx = 'cuentaBack>apoderadosXRegion'
		try {
			consolo.log(fx)
			const r = await solicitar({
				method: 'get',
				url: `${backURL}/apoderades/region`,
				params: { region, roles }
			})
			if (!r || !r.ok) throw r
			return r
		} catch (e) {
			console.error(fx, e)
		}
	},

	async apoderadosXcomuna (comunaID) {
		const fx = 'cuentaBack>apoderadosXcomuna'
		try {
			consolo.log(fx)
			const r = await solicitar({
				method: 'get',
				url: `${backURL}/apoderades/comuna/${comunaID}`
			})
			if (!r || !r.ok) throw r
			return r
		} catch (e) {
			console.error(fx, e)
		}
	},

	async autoValidarDatos ({ territorioPreferencia, nombre, apellido, rut, email, telefono, rol }) {
		const fx = 'cuentaBack>autoValidarDatos'
		try {
			// Primero obtener autorización del back
			const r = await solicitar({
				method: 'get',
				url: `${backURL}/autorizaredicion`
			})
			// consolo.log(fx, 'back/autorizaredicion', r)
			if (!r || !r.ok) throw ['fail autorizando creación de usuario (back)', r]
			const { autorizacion } = r

			// Crear usuario en microservicio de cuentas
			const c = await cuentaBack.cuenta.editarCuenta(autorizacion, { nombre, apellido, email, telefono, rut, rol })
			if (!c || !c.ok) throw ['fail editando usuario en microcuentas', c]

			const s = await solicitar({
				method: 'post',
				url: `${backURL}/apoderade/datos`,
				data: { territorioPreferencia }
			})
			if (!s || !s.ok) throw ['fail editando autovalidando datos', s]

			// Recargar info que indica si el usuario ha confirmado sus datos
			await cuentaBack.leerMisDatos()

			// TODO Marcar datos validados
			cuentaBack.vm.$message.success('Has confirmado tus datos')
		} catch (e) {
			if (!(e instanceof Error) && _.isArray(e)) console.error(fx, ...e)
			else console.error(fx, e)
			cuentaBack.vm.$message.error('Algo falló')
		}
	},

	async localesXRegion ({ region }) {
		const fx = 'cuentaBack>localesXRegion'
		try {
			consolo.log(fx)
			const r = await solicitar({
				method: 'get',
				url: `${backURL}/locales/:region`,
				params: { region }
			})
			if (!r || !r.ok) throw ['No se pudo cargar locales de la región', r]
			cuentaBack.vm.$message.success('Locales cargados')
			consolo.log(fx, 'r', r)
			return r
		} catch (e) {
			if (!(e instanceof Error) && _.isArray(e)) console.error(fx, ...e)
			else console.error(fx, e)
			cuentaBack.vm.$message.error('Algo falló')
		}
	},
	async localPorID (regionID, localID) {
		const fx = 'cuentaBack>localPorID'
		try {
			consolo.log(fx)
			const r = await solicitar({
				method: 'get',
				url: `${backURL}/locales/:region/locales/:localId`,
				params: { region:regionID, localId:localID  }
			})
			if (!r || !r.ok) throw [`No se pudo cargar local con id ${localID}`, r]
			if (dev) cuentaBack.vm.$message.success('Local cargado')
			consolo.log(fx, 'r', r)
			return r
		} catch (e) {
			if (!(e instanceof Error) && _.isArray(e)) console.error(fx, ...e)
			else console.error(fx, e)
			if (dev) cuentaBack.vm.$message.error('Algo falló')
		}
	},

	async localesXComuna ({ region, comunaCodigo }) {
		const fx = 'cuentaBack>localesXComuna'
		try {
			consolo.log(fx)
			const r = await solicitar({
				method: 'get',
				url: `${backURL}/locales/${region}/comunas/${comunaCodigo}/`
			})
			if (!r || !r.ok) throw ['No se pudo cargar locales de comuna', r]
			cuentaBack.vm.$message.success('Locales cargados')
			consolo.log(fx, 'r', r)
			return r
		} catch (e) {
			if (!(e instanceof Error) && _.isArray(e)) console.error(fx, ...e)
			else console.error(fx, e)
			cuentaBack.vm.$message.error('Algo falló')
		}
	},

	async obtenerLocal ({ region, localId }) {
		const fx = 'cuentaBack>obtenerLocal'
		try {
			consolo.log(fx)
			const r = await solicitar({
				method: 'get',
				url: `${backURL}/locales/${region}/locales/${localId}`
			})
			if (!r || !r.ok) throw ['No se pudo cargar local', r]
			cuentaBack.vm.$message.success('Local cargados')
			consolo.log(fx, 'r', r)
			return r
		} catch (e) {
			if (!(e instanceof Error) && _.isArray(e)) console.error(fx, ...e)
			else console.error(fx, e)
			cuentaBack.vm.$message.error('Algo falló')
		}
	},
}



async function solicitar (request, errorHandler) {
	// const fx = 'cuentaBack.js solicitar'
	// consolo.log(fx, 'token', cuentaBack.cuenta.token)
	// consolo.log(fx, 'tokenAutofirmado', cuentaBack.cuenta.tokenAutofirmado)
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
	if (data.desconectar) cuentaBack.cuenta.salir()
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
		consolo.log('Status fuera del rango 2XX', { status, data })
	} else if (error.request) {
		consolo.log('Sin respuesta (capturadorErrorSolicitud)')
		cuentaBack.sinConexion = true
		// consolo.log(error.request)
	} else {
		consolo.log('Error inesperado (capturadorErrorSolicitud)', error.message)
	}
	consolo.log(error.config)
}

Vue.util.defineReactive(cuentaBack, 'apoderade', cuentaBack.apoderade)
Vue.util.defineReactive(cuentaBack, 'sinConexion', cuentaBack.sinConexion)
Vue.util.defineReactive(cuentaBack, 'territorios', cuentaBack.territorios)
// Vue.util.defineReactive(cuentaBack, 'sinConexion', cuentaBack.sinConexion)

export default function ({ app }, inject) {
	// Con esto se puede llamar cuentaBack desde cualquier componente usando $cuentaBack
	// Con esto se puede llamar cuentaBack desde cualquier componente usando $apoderade

	if (!Vue.__cuentasBack__) {
		Vue.__cuentasBack__ = true
		Object.defineProperty(Vue.prototype, '$cuentaBack', {
			get () { return cuentaBack }
		})
		Object.defineProperty(Vue.prototype, '$apoderade', {
			get () { return cuentaBack.apoderade }
		})
	}

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
