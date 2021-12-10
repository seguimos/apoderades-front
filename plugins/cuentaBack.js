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
		if (usarStores) this.apoderade = cuentaBackStore.getItem('apoderade', null)

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
	get usuario () {
		return this.vm.$cuenta.usuario
	},
	get miLlavero () {
		return this.vm.$cuenta.miLlavero
	},

	get apoderade () {
		return this._apoderade
	},

	set apoderade (v) {
		if (usarStores) cuentaBackStore.setItem('apoderade', v)
		this._apoderade = v
	},

	// async ping () {
	// 	const fx = 'cuentaBack>ping'
	// 	try {
	// 		consolo.log(fx)
	// 		const r = await solicitar.call(this, {
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
			const r = await axios({
				method: 'get',
				url: `${backURL}/apoderade`,
				headers: {
					'content-type': 'application/json',
					accept: 'application/json',
					authorization: `Bearer ${cuentaBack.token}`
				}
			}).then(r => r.data)

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
		}
	},

	async apoderadosXRegion (region, roles) {
		const fx = 'cuentaBack>apoderadosXRegion'
		const cuenta = this.vm.$cuenta
		try {
			console.log(fx)
			const r = await axios({
				method: 'get',
				url: `${backURL}/apoderades/region`,
				headers: {
					authorization: `Bearer ${cuenta.token}`
				},
				params: { region, roles }

			}).then(r => r.data)

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
		const cuenta = this.vm.$cuenta
		try {
			console.log(fx)
			const r = await axios({
				method: 'get',
				url: `${backURL}/apoderades/comuna/:comunaCodigo`,
				headers: {
					authorization: `Bearer ${cuenta.token}`
				},
				params: { comunaCodigo, roles }
			}).then(r => r.data)

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
		const cuenta = this.vm.$cuenta
		// Primero obtener autorización del back
		const r = await axios({
			method: 'get',
			url: `${backURL}/autorizaredicion`,
			headers: {
				authorization: `Bearer ${cuentaBack.token}`
			}
		}).then(r => r.data)
		console.log(fx, 'back/autorizarCreacion', r)

		if (!r || !r.ok) {
			console.error(fx, 'fail autorizando creación de usuario (back)', r)
			return
		}
		const autorizacionBack = r.autorizacion
		console.log('autorizacionDelBack', autorizacionBack)
		// Crear usuario en microservicio de cuentas
		const c = await cuentaBack.vm.$cuenta.editarCuenta(autorizacionBack, { nombre, apellido, email, telefono, rut, rol })
		if (!c || !c.ok) {
			console.error(fx, 'fail editando usuario en microcuentas', c)
			return
		}

		console.log(fx, 'microcuentas/editarCuenta', c)

		const s = await axios({
			method: 'post',
			url: `${backURL}/apoderade/datos`,
			headers: {
				'content-type': 'application/json',
				accept: 'application/json',
				authorization: `Bearer ${cuenta.token}`
			},
			data: { territorioPreferencia }
		}).then(s => s.data)

		if (!s || !s.ok) {
			console.error(fx, 'fail', s)
			return
		}
		console.log(fx, 'r', s)
	},

	async asignarTerritorio ({ apoderadeID, region, comunaCodigo }) {
		const fx = 'cuentaBack>asignarTerritorio'
		const cuenta = this.vm.$cuenta
		try {
			console.log(fx)
			const r = await axios({
				method: 'post',
				url: `${backURL}/apoderades/:criptoIdApoderade/territorio`,
				headers: {
					authorization: `Bearer ${cuenta.token}`
				},
				body: { territorio: {	region, comunaCodigo } },
				params: { apoderadeID }
			}).then(r => r.data)

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
		const cuenta = this.vm.$cuenta
		try {
			console.log(fx)
			const r = await axios({
				method: 'post',
				url: `${backURL}/locales/:region/locales/:localId/apoderades`,
				headers: {
					authorization: `Bearer ${cuenta.token}`
				},
				body: { idCriptocuentas },
				params: { region, localId }
			}).then(r => r.data)

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
		const cuenta = this.vm.$cuenta
		try {
			console.log(fx)
			const r = await axios({
				method: 'get',
				url: `${backURL}/locales/:region`,
				headers: {
					authorization: `Bearer ${cuenta.token}`
				},
				params: { region }
			}).then(r => r.data)

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
		const cuenta = this.vm.$cuenta
		try {
			console.log(fx)
			const r = await axios({
				method: 'get',
				url: `${backURL}/locales/${region}/comunas/${comunaCodigo}/`,
				headers: {
					authorization: `Bearer ${cuenta.token}`
				}
				// params: { region, comunaCodigo }
			}).then(r => r.data)

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
		const cuenta = this.vm.$cuenta
		try {
			console.log(fx)
			const r = await axios({
				method: 'get',
				url: `${backURL}/apoderade/territorios`,
				headers: {
					authorization: `Bearer ${cuenta.token}`
				}
				// params: { region, comunaCodigo }
			}).then(r => r.data)

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
		const cuenta = this.vm.$cuenta
		try {
			console.log(fx)
			const r = await axios({
				method: 'get',
				url: `${backURL}/locales/:region/locales/:localId`,
				headers: {
					authorization: `Bearer ${cuenta.token}`
				},
				params: { region, localId }
			}).then(r => r.data)

			if (!r || !r.ok) {
				console.error(fx, 'fail', r)
				return
			}
			console.log(fx, 'r', r)
		} catch (e) {
			console.error(fx, e)
		}
	},

	async salir () {
		cuentaBack.datosApoderade = null
		await cuentaBackStore.clear()
		// cuentaBack.ping()
		return true
	},

	async crearApoderade ({ nombre, apellido, email, pass, telefono, rol, rut, territorioPreferencia }) {
		const fx = 'cuentaBack>crearApoderade'
		// Primero obtener autorización del back
		const r = await axios({
			method: 'get',
			url: `${backURL}/autorizarCreacion`,
			headers: {
				authorization: `Bearer ${cuentaBack.token}`
			}
		}).then(r => r.data)
		console.log(fx, 'back/autorizarCreacion', r)

		if (!r || !r.ok) {
			console.error(fx, 'fail autorizando creación de usuario (back)', r)
			return
		}
		const autorizacionDelBack = r.autorizacion

		// Crear usuario en microservicio de cuentas
		const c = await cuentaBack.vm.$cuenta.crearCuenta(autorizacionDelBack, { nombre, apellido, email, pass, telefono, rut, rol })
		if (!c || !c.ok) {
			console.error(fx, 'fail creando usuario en microcuentas', c)
			return
		}
		const usuarioID = c.usuarioID
		const urlValidacionEmail = c.urlValidacionEmail
		console.log(fx, 'microcuentas/crearCuenta', c)

		// Ya se tiene el usuarioID, ahora a hacer lo que se tenga q hacer con eso y los demas datos en el back.
		const b = await axios({
			method: 'post',
			url: `${backURL}/apoderades`,
			headers: {
				authorization: `Bearer ${cuentaBack.token}`
			},
			data: {
				usuarioID,
				urlValidacionEmail,
				rol,
				territorioPreferencia
			}
		}).then(r => r.data)
		console.log(fx, 'back/nuevo-usuario', b)
	}
}

Vue.util.defineReactive(cuentaBack, 'apoderade', cuentaBack.datosApoderade)
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
