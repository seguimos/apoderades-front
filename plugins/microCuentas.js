import axios from 'axios'
import Vue from 'vue'
import localforage from 'localforage'
import tokenDecoder from 'jwt-decode'

import consolo from '@lib/consolo'
import Llavero from '@lib/llavero'
import emisorEventos from '@lib/emisorEventos'

import { _ } from './lodash'



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
		// Decriptar datos personales
		const desencriptado = await miLlavero.desencriptar(r.datosPrivados)

		const datosPrivados = JSON.parse(desencriptado)
		const decodificado = tokenDecoder(r.token)
		miLlavero.renombrar(decodificado.sub)
		cuenta.usuario = {
			id: decodificado.sub,
			nombre: decodificado.nombre,
			...datosPrivados
		}
		cuenta.decodificado = decodificado
		cuenta.datosPrivados = r.datosPrivados
		cuenta.token = r.token
		if (r.token) {
			const listo = await cuenta.mantenerTokenAutorizado(r.token)
			console.log(listo)
			cuenta.vm.$nextTick(() => { cuenta.emit('cambioToken', r.token) })
		} else {
			const drama = 'No hay token de microservicio de cuentas!'
			console.error(drama)
			throw drama
		}
		// cuenta.vm.$nextTick(() => { cuenta.mantenerTokenAutorizado() })
		return r
	} catch (e) {
		console.error('procesarInfoUsuario', e)
		throw 'No se pudo procesarInfoUsuario'
	}
}

const cuenta = {
	cuentasURL: null,
	// Proporciona metodos on, off, emit, para emisión y escucha de eventos
	...emisorEventos,

	vm: undefined,
	_token: undefined,
	_expConfianza: undefined,
	_usuario: undefined,
	decodificado: undefined,

	_datosPrivados: undefined,

	llaveroPropio: undefined,


	sinConexion: undefined,

	async init (vm) {
		const fx = 'microCuentas>init'

		this.vm = vm
		this.token = (usarStores && await cuentaStore.getItem('token')) || null
		this.cuentasURL = process.env.dev ? process.env.cuentasURL : process.env.cuentasURL.replace('HOST', `capi.${window.location.host}`)

		const llaveroMio = (usarStores && await llaveroStore.getItem('miLlavero')) || null
		if (llaveroMio) {
			consolo.log(fx, 'Llavero recuperado', llaveroMio)
			miLlavero = new Llavero()
			miLlavero.reinstanciar(llaveroMio)
		} else {
			miLlavero = new Llavero()
			await miLlavero.init({ crearKeys: 1 })
			consolo.log(fx, 'Llavero creado', miLlavero)
			if (usarStores) await llaveroStore.setItem('miLlavero', miLlavero)
		}

		consolo.log(fx, { token: this._token })
		this.leer()
	},

	get host () {
		return new URL(cuenta.cuentasURL).host
	},

	get token () { return this._token },
	get miLlavero () { return miLlavero },

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

	tokenAutofirmado: null,
	autofirmando: null,
	async mantenerTokenAutorizado (token) {
		const fx = 'microCuentas>mantenerTokenAutorizado'
		try {
			token = token || cuenta.token
			if (!token) {
				this.autofirmando = false
				console.log(`%c ${fx} detenido`, 'color: #666;')
			}
			if (!this.autofirmando) {
				this.autofirmando = true
				console.log(`%c ${fx} iniciado`, 'color: green;')
			}
			// console.log(`%c ${fx} decodificado`, 'color: coral;', cuenta.decodificado)
			// console.log(`%c ${fx} jti`, 'color: coral;', cuenta.decodificado.jti)
			const cuerpoToken = { jtiCuentas: cuenta.decodificado.jti }
			const moment = cuenta.vm.$moment
			cuerpoToken.exp = moment().add(2, 'm').unix()
			this.tokenAutofirmado = await miLlavero.firmarToken(cuerpoToken)
			const proxMinuto = moment().seconds(0).add(1, 'minute')
			setTimeout(function () { cuenta.mantenerTokenAutorizado() }, proxMinuto.diff(moment()))
			return true
		} catch (e) {
			console.error(fx, e)
		}
	},

	async ping () {
		const fx = 'microCuentas>ping'
		try {
			consolo.log(fx)
			const r = await solicitar.call(this, {
				url: `${cuenta.cuentasURL}/llavero`,
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
				url: `${cuenta.cuentasURL}/leer`,
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
			if (!encriptado || _.isEmpty(encriptado)) {
				console.error('Encriptado vacío', encriptado)
				return
			}
			const r = await solicitar.call(this, {
				url: `${cuenta.cuentasURL}/ingresar`,
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
				url: `${cuenta.cuentasURL}/reautenticar`,
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
		if (cuenta.vm.$cuentaBack) cuenta.vm.$cuentaBack.salir()
		await cuentaStore.clear()
		cuenta.ping()
		return true
	},

	async ingresarConToken (token) {
		const fx = 'microCuentas>ingresarConToken'
		try {
			consolo.log(fx, { token })
			const r = await solicitar.call(this, {
				url: `${cuenta.cuentasURL}/ingresarConToken`,
				data: { token },
				method: 'post'
			})
			return await procesarInfoUsuario(r)
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
					url: `${cuenta.cuentasURL}/pass`,
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
					url: `${cuenta.cuentasURL}/pass/codigo`,
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
					url: `${cuenta.cuentasURL}/pass/codigo`,
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
					url: `${cuenta.cuentasURL}/pass/token`,
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
				url: `${cuenta.cuentasURL}/avatar/url`,
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
				url: `${cuenta.cuentasURL}/avatar/url`,
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
				url: `${cuenta.cuentasURL}/email`,
				method: 'post'
			})
			consolo.log(`${fx} r`, r)
			return r
		} catch (e) {
			console.error(fx, e)
		}
	},

	// Inscripciones y ediciones por usuarios con autorización del back

	async crearCuenta (autorizacion, { nombre, apellido, email, telefono, rut, rol }) {
		const fx = 'microCuentas>crearCuenta'
		const _ = cuenta.vm._
		try {
			const token = cuenta.token
			if (!token) {
				console.log(fx, 'abortado por no haber token')
				cuenta.salir()
				return
			}
			if (!miLlavero) throw 'Falta miLlavero'
			if (!llaveroMicroCuentas) llaveroMicroCuentas = await cuenta.ping()

			// Desencriptar secretoFront
			const tokenDecodificado = tokenDecoder(autorizacion)
			const secretoDecriptado = await miLlavero.desencriptar(tokenDecodificado.secretoFront)

			const serializado = JSON.stringify(_.pickBy({ nombre, apellido, email, telefono, rut, rol }, v => v && !_.isEmpty(v)))
			consolo.log(fx, 'serializado', serializado)
			const encriptado = await llaveroMicroCuentas.encriptar(serializado)
			if (!encriptado || _.isEmpty(encriptado)) {
				console.error('Encriptado vacío', encriptado)
				return
			}
			const r = await solicitar.call(this, {
				url: `${cuenta.cuentasURL}/crearPorOtroUsuario`,
				data: { encriptado, secretoDecriptado, autorizacion },
				headers: { Authorization: `Bearer ${token}` },
				method: 'post'
			})
			consolo.log(`${fx} r`, r)
			// const ejemplo = {
			// 	ok: 1,
			// 	usuarioID: 'fd42f2i3',
			// 	tokenIngresoEncriptado: 'secretopalback'
			// }
			return r
		} catch (e) {
			console.error(fx, e)
		}
	},

	async editarCuenta (autorizacion, { nombre, apellido, email, telefono, rol }) {
		const fx = 'microCuentas>editarCuenta'
		const _ = cuenta.vm._
		try {
			const token = cuenta.token
			if (!token) {
				console.log(fx, 'abortado por no haber token')
				cuenta.salir()
				return
			}

			if (!miLlavero) throw 'Falta miLlavero'
			if (!llaveroMicroCuentas) llaveroMicroCuentas = await cuenta.ping()

			// Desencriptar secretoFront
			const tokenDecodificado = tokenDecoder(autorizacion)
			const secretoDecriptado = await miLlavero.desencriptar(tokenDecodificado.secretoFront)

			const serializado = JSON.stringify(_.pickBy({ nombre, apellido, email, telefono, rol }, v => v && !_.isEmpty(v)))
			consolo.log(fx, 'serializado', serializado)
			// Encriptar datos usuario
			const encriptado = await llaveroMicroCuentas.encriptar(serializado)
			if (!encriptado || _.isEmpty(encriptado)) {
				console.error('Encriptado vacío', encriptado)
				return
			}
			const r = await solicitar.call(this, {
				url: `${cuenta.cuentasURL}/editar`,
				data: { encriptado, secretoDecriptado, autorizacion },
				headers: { Authorization: `Bearer ${token}` },
				method: 'post'
			})
			consolo.log(`${fx} r`, r)
			return r
		} catch (e) {
			console.error(fx, e)
		}
	},

	async buscarRut (autorizacion, rut) {
		const fx = 'microCuentas>buscarRut'
		const _ = cuenta.vm._
		try {
			if (!cuenta.token) {
				console.log(fx, 'abortado por no haber token')
				cuenta.salir()
				return
			}

			if (!miLlavero) throw 'Falta miLlavero'
			if (!llaveroMicroCuentas) llaveroMicroCuentas = await cuenta.ping()

			// Desencriptar secretoFront
			const tokenDecodificado = tokenDecoder(autorizacion)
			const secretoDecriptado = await miLlavero.desencriptar(tokenDecodificado.secretoFront)

			const serializado = JSON.stringify(_.pickBy({ rut }, v => v && !_.isEmpty(v)))
			consolo.log(fx, 'serializado', serializado)
			// Encriptar datos usuario
			const encriptado = await llaveroMicroCuentas.encriptar(serializado)
			if (!encriptado || _.isEmpty(encriptado)) {
				console.error('Encriptado vacío', encriptado)
				return
			}
			const r = await solicitar.call(this, {
				url: `${cuenta.cuentasURL}/buscarXRut`,
				data: { encriptado, secretoDecriptado, autorizacion },
				headers: { Authorization: `Bearer ${cuenta.token}` },
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
	const _ = cuenta.vm._
	const defaultHeaders = { Accept: 'application/json' }
	const ops = _.merge({ headers: defaultHeaders }, request)

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
