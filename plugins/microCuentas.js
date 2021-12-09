import axios from 'axios'
import Vue from 'vue'
import localforage from 'localforage'
import tokenDecoder from 'jwt-decode'

import consolo from '@mainlib/consolo'
import Llavero from '@mainlib/llavero'

const apiURL = process.env.apiOrigin

const cuentaStore = localforage.createInstance({ name: 'criptoCuentaStore' })
const llaveroStore = localforage.createInstance({ name: 'llaveroStore' })

const usarStores = true

const minutosDeConfianza = process.env.dev ? (7 * 24 * 60) : 5


let miLlavero
let llaveroMicroCuentas

async function procesarInfoUsuario (r) {
	// consolo.log(`${fx} r`, r)
	try {
		if (!r || !r.ok) throw r
		const decodificado = tokenDecoder(r.token)
		// Decriptar datos personales
		const desencriptado = await miLlavero.desencriptar(r.datosPrivados)
		const datosPrivados = JSON.parse(desencriptado)
		cuenta.usuario = {
			id: decodificado.sub,
			nombre: decodificado.nombre,
			...datosPrivados
		}
		cuenta.datosPrivados = r.datosPrivados
		cuenta.token = r.token
		return r
	} catch (e) {
		console.error('procesarInfoUsuario', e)
		throw 'No se pudo procesarInfoUsuario'
	}
}

const cuenta = {
	vm: undefined,
	_token: undefined,
	_expConfianza: undefined,
	_usuario: undefined,
	_datosPrivados: undefined,

	llaveroPropio: undefined,


	sinConexion: undefined,
	apiURL,

	async init (vm) {
		const fx = 'microCuentas>init'

		this.vm = vm
		this.token = (usarStores && await cuentaStore.getItem('token')) || null

		const llaveroMio = (usarStores && await llaveroStore.getItem('miLlavero')) || null
		if (llaveroMio) {
			consolo.log(fx, 'Llavero recuperado', llaveroMio)
			miLlavero = new Llavero('local')
			miLlavero.reinstanciar(llaveroMio)
		} else {
			miLlavero = new Llavero('local')
			await miLlavero.init({ crearKeys: 1 })
			consolo.log(fx, 'Llavero creado', miLlavero)
			if (usarStores) await llaveroStore.setItem('miLlavero', miLlavero)
		}

		consolo.log(fx, { token: this._token })
		this.leer()
	},

	get host () {
		return new URL(cuenta.apiURL).host
	},

	get token () { return this._token },

	set token (tkn) {
		this._token = tkn
		this._expConfianza = tkn && tokenDecoder(tkn).iat + (60 * minutosDeConfianza)
		if (usarStores) cuentaStore.setItem('token', tkn)
	},

	get usuario () { return this._usuario },

	set usuario (usr) {
		this._usuario = usr
		if (usarStores) cuentaStore.setItem('usuario', usr)
	},

	get datosPrivados () {
		if ((this._expConfianza * 1000) < Number(new Date())) {
			this._datosPrivados = null
			return null
		}
		return this._datosPrivados
	},

	set datosPrivados (usr) {
		this._datosPrivados = usr
	},

	async ping () {
		const fx = 'microCuentas>ping'
		try {
			consolo.log(fx)
			const r = await solicitar.call(this, {
				url: `${cuenta.apiURL}/llavero`,
				method: 'get'
			}, e => { this.sinConexion = true })
			consolo.log(fx, 'r', r)
			this.sinConexion = !(r && r.ok)
			if (!r) return

			const { llaveroID, llaves } = r
			if (!llaveroID) throw 'Falta llaveroID'
			const llavero = new Llavero(llaveroID)
			await llavero.prepararDestinatario(llaves)
			llaveroMicroCuentas = llavero
			if (usarStores) cuentaStore.setItem('llaveroMicrocuentas', llavero)
			return llaveroMicroCuentas
		} catch (e) {
			console.error(fx, e)
		}
	},


	async leer () {
		const fx = 'microCuentas>leer'
		try {
			const token = cuenta.token
			if (!token) {
				console.log(fx, 'abortado por no haber token')
				cuenta.salir()
				return
			}
			console.log(fx)
			const r = await solicitar.call(this, {
				url: `${cuenta.apiURL}/leer`,
				method: 'get',
				headers: { Authorization: `Bearer ${token}` }
			})
			return await procesarInfoUsuario(r)
		} catch (e) {
			console.error(fx, e)
		}
	},

	async ingresar (email, pass) {
		const fx = 'microCuentas>ingresar'
		try {
			consolo.log(fx, { email, pass })

			if (!miLlavero) throw 'Falta miLlavero'
			if (!llaveroMicroCuentas) llaveroMicroCuentas = await cuenta.ping()

			const llaves = await miLlavero.exportarLlavesPublicas()
			const encriptado = await llaveroMicroCuentas.encriptar(JSON.stringify({ email, pass }))
			if (!encriptado || cuenta.vm._.isEmpty(encriptado)) {
				console.error('Encriptado vacío', encriptado)
				return
			}
			const r = await solicitar.call(this, {
				url: `${cuenta.apiURL}/ingresar`,
				data: {
					encriptado,
					llaves
				},
				method: 'post'
			})
			return await procesarInfoUsuario(r)
		} catch (e) {
			console.error(fx, e)
		}
	},

	async reautenticar (pass) {
		const fx = 'microCuentas>reautenticar'
		try {
			const token = cuenta.token
			if (!token) {
				console.log(fx, 'abortado por no haber token')
				cuenta.salir()
				return
			}
			consolo.log(fx, { pass })
			const r = await solicitar.call(this, {
				url: `${cuenta.apiURL}/reautenticar`,
				data: { pass },
				method: 'post'
			})
			return await procesarInfoUsuario(r)
		} catch (e) {
			console.error(fx, e)
		}
	},

	async salir () {
		cuenta.usuario = null
		cuenta.token = null
		await cuentaStore.clear()
		cuenta.ping()
		return true
	},

	async ingresarConToken (token) {
		const fx = 'microCuentas>ingresarConToken'
		try {
			consolo.log(fx, { token })
			const r = await solicitar.call(this, {
				url: `${cuenta.apiURL}/ingresarConToken`,
				data: { token },
				method: 'post'
			})
			return await procesarInfoUsuario(r)
		} catch (e) {
			console.error(fx, e)
		}
	},

	async crearCuenta ({ nombre, apellido, email, pass }) {
		const fx = 'microCuentas>crearCuenta'
		try {
			consolo.log(fx, { nombre, apellido, email, pass })


			if (!miLlavero) throw 'Falta miLlavero'
			if (!llaveroMicroCuentas) llaveroMicroCuentas = await cuenta.ping()

			const llaves = await miLlavero.exportarLlavesPublicas()
			const encriptado = await llaveroMicroCuentas.encriptar(JSON.stringify({ nombre, apellido, email, pass }))
			if (!encriptado || cuenta.vm._.isEmpty(encriptado)) {
				console.error('Encriptado vacío', encriptado)
				return
			}
			const r = await solicitar.call(this, {
				url: `${cuenta.apiURL}/crear`,
				data: { encriptado, llaves },
				method: 'post'
			})
			consolo.log(`${fx} r`, r)
			cuenta.usuario = r.usuario || false
			if (r.token) {
				cuenta.token = r.token
				await cuenta.leer()
			}
			return r
		} catch (e) {
			console.error(fx, e)
		}
	},

	cambiarPass: {
		async conPass (pass, passNuevo) {
			const fx = 'microCuentas>cambiarPass>conPass'
			try {
				const usuarioID = cuenta.usuario._id
				consolo.log(fx)
				const r = await solicitar.call(this, {
					url: `${cuenta.apiURL}/pass`,
					method: 'post',
					data: { usuarioID, pass, passNuevo }
				})
				consolo.log(`${fx} r`, r)
				return r
			} catch (e) {
				console.error(fx, e)
			}
		},
		async pedirCodigo (email, passNuevo) {
			const fx = 'microCuentas>cambiarPass>pedirCodigo'
			try {
				consolo.log(fx)
				const r = await solicitar.call(this, {
					url: `${cuenta.apiURL}/pass/codigo`,
					method: 'post',
					data: { email, passNuevo }
				})
				consolo.log(`${fx} r`, r)
				return r
			} catch (e) {
				console.error(fx, e)
			}
		},
		async conCodigo (email, codigo) {
			const fx = 'microCuentas>cambiarPass>conCodigo'
			try {
				consolo.log(fx)
				const r = await solicitar.call(this, {
					url: `${cuenta.apiURL}/pass/codigo`,
					method: 'put',
					data: { email, codigo }
				})
				consolo.log(`${fx} r`, r)
				return r
			} catch (e) {
				console.error(fx, e)
			}
		},
		async pedirToken (email, passNuevo) {
			const fx = 'microCuentas>cambiarPass>pedirToken'
			try {
				consolo.log(fx)
				const r = await solicitar.call(this, {
					url: `${cuenta.apiURL}/pass/token`,
					method: 'post',
					data: { email, passNuevo }
				})
				consolo.log(`${fx} r`, r)
				return r
			} catch (e) {
				console.error(fx, e)
			}
		}
	},

	async obtenerCargaFirmadaAvatar () {
		const fx = 'microCuentas>obtenerCargaFirmadaAvatar'
		try {
			consolo.log(fx)
			const token = cuenta.token
			if (!token) throw 'Usuario no conectado'
			const r = await solicitar.call(this, {
				url: `${cuenta.apiURL}/avatar/url`,
				method: 'get',
				headers: { Authorization: `Bearer ${token}` }
			})
			consolo.log(`${fx} r`, r)
			return r.url
		} catch (e) {
			console.error(fx, e)
		}
	},

	async guardarUrlAvatar (url) {
		const fx = 'microCuentas>guardarUrlAvatar'
		try {
			consolo.log(fx, url)
			const token = cuenta.token
			if (!token) throw 'Usuario no conectado'
			if (!url) throw 'falta url del avatar'
			const r = await solicitar.call(this, {
				url: `${cuenta.apiURL}/avatar/url`,
				method: 'put',
				data: { url },
				headers: { Authorization: `Bearer ${token}` }
			})
			consolo.log(`${fx} r`, r)
			this.usuario = r.usuario
			return r
		} catch (e) {
			console.error(fx, e)
		}
	},

	// Validacion de correo

	async enviarValidacionEmail () {
		const fx = 'microCuentas>enviarValidacionEmail'
		try {
			consolo.log(fx)
			const r = await solicitar.call(this, {
				url: `${cuenta.apiURL}/email`,
				method: 'post'
			})
			consolo.log(`${fx} r`, r)
			return r
		} catch (e) {
			console.error(fx, e)
		}
	}
}


async function solicitar (request, errorHandler) {
	// const fx = 'solicitar'
	const _ = cuenta.vm._

	// console.log(fx, request)
	// console.log('Preparacion de headers para firma', firma)
	// console.log('Preparacion de headers para encriptacion', encriptacion)

	const defaultHeaders = { Accept: 'application/json' }

	const ops = _.merge({ headers: defaultHeaders }, request)

	// const {firma, encriptacion} = miLlavero && await miLlavero.exportarLlavesPublicas()
	// if (firma && encriptacion) {
	// 	ops.headers.firma = firma.publica
	// 	ops.headers.encriptacion = encriptacion.publica
	// }

	// console.log(fx, 'ops', ops)

	const data = await axios(ops).then(r => {
		// console.log('r', r)
		if (this.sinConexion === undefined || this.sinConexion) this.sinConexion = false
		return r.data
	}).catch(errorHandler || capturadorErrorSolicitud)

	if (!data) {
		console.error('Sin respuesta')
		return data
	}
	if (data.desconectar) cuenta.salir()
	if (!data.ok && _.get(data, 'error.titulo')) {
		// Mostrar mensaje de error ya preconfigurado
		cuenta.vm.$notificar(_.get(data, 'error.titulo'), _.get(data, 'error.descripcion'), _.get(data, 'error.tipoNotificacion', 'warning'))
	}
	if (_.get(data, 'notificar.titulo')) {
		// Mostrar mensaje ya preconfigurado
		cuenta.vm.$notificar(_.get(data, 'notificar.titulo'), _.get(data, 'notificar.descripcion'), _.get(data, 'notificar.tipo', 'warning'))
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
		cuenta.ping()
	} else {
		console.log('Error inesperado (capturadorErrorSolicitud)', error.message)
	}
	consolo.log(error.config)
}



Vue.util.defineReactive(cuenta, 'token', cuenta.token)
Vue.util.defineReactive(cuenta, 'usuario', cuenta.usuario)
Vue.util.defineReactive(cuenta, 'datosPrivados', cuenta.datosPrivados)
Vue.util.defineReactive(cuenta, 'sinConexion', cuenta.sinConexion)

export default function ({ app }, inject) {
	inject('cuenta', cuenta)

	if (!app.mixins) app.mixins = []
	app.mixins.push({
		mounted () {
			consolo.log('criptoCuenta MOUNTED')
			cuenta.init(this)
		}
	})

	if (!Vue.__cuentas__) {
		Vue.__cuentas__ = true
		Object.defineProperty(Vue.prototype, '$usuario', { get () { return cuenta.usuario } })
		Object.defineProperty(Vue.prototype, '$cuentaSinConexion', { get () { return cuenta.sinConexion } })
	}
}