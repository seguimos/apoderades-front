import axios from 'axios'
import Vue from 'vue'
import localforage from 'localforage'

import consolo from '@lib/consolo'
import emisorEventos from '@lib/emisorEventos'

const backURL = process.env.backURL

const cuentaBackStore = localforage.createInstance({ name: 'cuentaBackBackStore' })
const usarStores = true

const cuentaBack = {
	// Proporciona metodos on, off, emit, para emisión y escucha de eventos
	...emisorEventos,

	vm: undefined,
	_apoderade: undefined,

	sinConexion: undefined,
	backURL,

	init (vm) {
		const fx = 'cuentaBack>init'
		this.vm = vm
		// Revisar que se esté utilizando microservicio de cuentas
		if (!vm.$cuenta) {
			console.error('En este punto el microservicio de cuentas debería estar conectado')
			return
		}
		if (usarStores) this.apoderade = cuentaBackStore.getItem('apoderade', null)
		// Revisar que se haya inicializado
		consolo.log(fx, { token: this._token })
		this.leer()
	},

	get token () {
		return this.vm.$cuenta.token
	},

	get apoderade () {
		return this._apoderade
	},

	set apoderade (v) {
		if (usarStores) cuentaBackStore.setItem('apoderade', v)
		return this._apoderade
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


	async leerMisDatos () {
		const fx = 'cuentaBack>leerMisDatos'
		try {
			console.log(fx)
			const r = await axios({
				method: 'get',
				url: `${backURL}/apoderade`,
				headers: {
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

			// if (!apoderade || !apoderade.data.ok) {
			// 	this.erroDatos = apoderade.data.error
			// } else {
			// 	console.log(
			// 		'apoderade.data.usuario.FechaValidacionDatos',
			// 		apoderade.data.usuario[0].FechaValidacionDatos
			// 	)
			// 	if (!apoderade.data.usuario[0].FechaValidacionDatos) {
			// 		this.$store.commit('usuarioNoValidado', apoderade.data.usuario[0])
			// 		this.$router.push('/app/apoderades/validar')
			// 	} else {
			// 		this.$store.commit('usuarioLogeado', apoderade.data.usuario[0])
			// 		this.$router.push('/app/locales/resumenterritorial')
			// 	}
			// }




			// 	const token = cuentaBack.token
			// 	if (!token) {
			// 		console.log(fx, 'abortado por no haber token')
			// 		cuentaBack.salir()
			// 		return
			// 	}
			// 	console.log(fx)
			// 	const r = await solicitar.call(this, {
			// 		url: `${cuentaBack.backURL}/leer`,
			// 		method: 'get',
			// 		headers: { Authorization: `Bearer ${token}` }
			// 	})
			// 	return await procesarInfoUsuario(r)
		} catch (e) {
			console.error(fx, e)
		}
	},


	async salir () {
		cuentaBack.datosApoderade = null
		cuentaBack.token = null
		await cuentaBackStore.clear()
		// cuentaBack.ping()
		return true
	},

	async crearApoderade ({ nombre, apellido, email, pass, telefono }) {
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
		const c = await cuentaBack.vm.$cuenta.crearCuenta(autorizacionDelBack, { nombre, apellido, email, pass, telefono })
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
			url: `${backURL}/nuevo-usuario`,
			headers: {
				authorization: `Bearer ${cuentaBack.token}`
			},
			data: {
				usuarioID,
				urlValidacionEmail
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
