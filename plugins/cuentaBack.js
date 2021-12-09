import axios from 'axios'
import Vue from 'vue'
import localforage from 'localforage'

import consolo from '@lib/consolo'
import emisorEventos from '@lib/emisorEventos'

const apiURL = process.env.apiOrigin

const cuentaBackStore = localforage.createInstance({ name: 'cuentaBackBackStore' })
const usarStores = true

const cuentaBack = {
	// Proporciona metodos on, off, emit, para emisión y escucha de eventos
	...emisorEventos,

	vm: undefined,
	_datosApoderade: undefined,

	sinConexion: undefined,
	apiURL,

	async init (vm) {
		const fx = 'cuentaBack>init'

		this.vm = vm
		this.token = (usarStores && await cuentaBackStore.getItem('token')) || null

		// Revisar que se esté utilizando microservicio de cuentas
		if (!vm.$cuenta) {
			console.error('En este punto el microservicio de cuentas debería estar conectado')
			return
		}
		// Revisar que se haya inicializado

		consolo.log(fx, { token: this._token })
		this.leer()
	},

	get host () {
		return new URL(cuentaBack.apiURL).host
	},

	// async ping () {
	// 	const fx = 'cuentaBack>ping'
	// 	try {
	// 		consolo.log(fx)
	// 		const r = await solicitar.call(this, {
	// 			url: `${cuentaBack.apiURL}/llavero`,
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
		const cuenta = this.vm.$cuenta
		try {
			console.log(fx)
			const r = await axios({
				method: 'get',
				url: 'http://localhost:3001/apoderade',
				headers: {
					authorization: `Bearer ${cuenta.token}`
				}
			}).then(r => r.data)

			if (!r || !r.ok) {
				console.error(fx, 'fail', r)
				return
			}
			console.log(fx, 'r', r)


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
			// 		url: `${cuentaBack.apiURL}/leer`,
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
	}
}


Vue.util.defineReactive(cuentaBack, 'apoderade', cuentaBack.datosApoderade)
// Vue.util.defineReactive(cuentaBack, 'sinConexion', cuentaBack.sinConexion)

export default function ({ app }, inject) {
	inject('back', cuentaBack)

	if (!app.mixins) app.mixins = []
	app.mixins.push({
		mounted () {
			consolo.log('cuentaBack MOUNTED')
			cuentaBack.init(this)
		}
	})
}
