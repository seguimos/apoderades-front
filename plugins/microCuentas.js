import axios from 'axios'
import Vue from 'vue'
import localforage from 'localforage'
import tokenDecoder from 'jwt-decode'

import consolo from '@lib/consolo'
import Llavero from '@lib/llavero'
import emisorEventos from '@lib/emisorEventos'

import { _ } from './lodash'
import { moment } from './fechas'

const cuentaStore = localforage.createInstance({ name: 'criptoCuentaStore' })
const llaveroStore = localforage.createInstance({ name: 'llaveroStore' })

const usarStores = true

const minutosDeConfianza = process.env.dev ? 7 * 24 * 60 : 5

let miLlavero
let llaveroMicroCuentas

async function procesarInfoUsuario (r) {
	try {
		console.log('procesarInfoUsuario', r)
		if (!r || !r.ok) return r
		if (r.datosPrivados) {
			// Datos personales
			cuenta.datosPrivados = r.datosPrivados
		}

		if (r.token) {
			const decodificado = tokenDecoder(r.token)
			cuenta.decodificado = decodificado
			miLlavero.renombrar(decodificado.sub)
			if (usarStores) await llaveroStore.setItem('miLlavero', miLlavero)

			const shallowDecodificado = Object.assign({}, decodificado)
			shallowDecodificado.id = decodificado.sub
			delete shallowDecodificado.llaves
			delete shallowDecodificado.sub
			await new Promise(resolve => cuenta.vm.$nextTick(() => { resolve() }))
			cuenta.usuario = shallowDecodificado
			cuenta.token = r.token
			await new Promise(resolve => cuenta.vm.$nextTick(() => { resolve() }))

			cuenta.vm.$nextTick(() => {
				cuenta.emit('cambioToken', r.token)
			})
		}
		// cuenta.vm.$nextTick(() => { cuenta.mantenerTokenAutorizado() })
		return r
	} catch (e) {
		console.error('procesarInfoUsuario', e)
		throw 'No se pudo procesarInfoUsuario'
	}
}

const cuenta = {
	inicializado: null,
	cuentasURL: null,
	// Proporciona metodos on, off, emit, para emisión y escucha de eventos
	...emisorEventos,

	vm: undefined,
	_token: undefined,
	_expConfianza: undefined,
	_usuario: undefined,
	decodificado: undefined,
	datosPrivados: undefined,
	sinConexion: undefined,

	async init (vm) {
		// const fx = 'microCuentas>init'

		this.vm = vm
		this.token = (usarStores && (await cuentaStore.getItem('token'))) || null
		this.cuentasURL = process.env.dev
			? process.env.cuentasURL
			: process.env.cuentasURL.replace('HOST', window.location.host)

		const llaveroMio =
			(usarStores && (await llaveroStore.getItem('miLlavero'))) || null
		if (llaveroMio) {
			// consolo.log(fx, 'Llavero recuperado', llaveroMio)
			miLlavero = new Llavero()
			miLlavero.reinstanciar(llaveroMio)
		} else {
			miLlavero = new Llavero()
			await miLlavero.init({ crearKeys: 1 })
			// consolo.log(fx, 'Llavero creado', miLlavero)
			if (usarStores) await llaveroStore.setItem('miLlavero', miLlavero)
		}
		// consolo.log(fx, { token: this._token })

		// Emitir evento y marcar inicializado para otros procesos
		cuenta.emit('initListo')
		cuenta.inicializado = true

		cuenta.leer()
	},

	get host () {
		return new URL(cuenta.cuentasURL).host
	},

	get token () {
		return this._token
	},
	get miLlavero () {
		return miLlavero
	},

	set token (tkn) {
		this._token = tkn
		this._expConfianza = tkn && tokenDecoder(tkn).iat + 60 * minutosDeConfianza
		if (usarStores) cuentaStore.setItem('token', tkn)
	},

	get usuario () {
		return this._usuario
	},

	set usuario (usr) {
		this._usuario = usr
		if (usarStores) cuentaStore.setItem('usuario', usr)
	},

	tokenAutofirmado: undefined,
	expTokenAutofirmado: undefined,
	async mantenerTokenAutorizado (token) {
		const fx = 'microCuentas>mantenerTokenAutorizado'
		try {
			token = token || cuenta.token
			if (!token) return
			// consolo.log(`%c ${fx} generando`, 'color: yellow;')
			// consolo.log(`%c ${fx} miLlavero.nombre`, 'color: orangered;', miLlavero.nombre)
			if (!miLlavero.nombre) {
				throw `miLlavero.nombre: ${miLlavero.nombre}`
			}

			// Revisar si hay token cacheado
			if (cuenta.tokenAutofirmado && cuenta.expTokenAutofirmado) {
				if (moment().isBefore(moment(cuenta.expTokenAutofirmado).subtract(10 ,'s'))) return cuenta.tokenAutofirmado
			}

			consolo.log(`%c ${fx} nuevo token autorizado`, 'color: green;', miLlavero.nombre)
			const cuerpoToken = { jtiCuentas: tokenDecoder(token).jti }
			const exp = moment().add(1, 'm')
			cuerpoToken.exp = exp.unix()
			const tokenAutofirmado =  await miLlavero.firmarToken(cuerpoToken)
			this.tokenAutofirmado = tokenAutofirmado
			this.expTokenAutofirmado = exp
			return tokenAutofirmado
		} catch (e) {
			console.error(fx, e)
			cuenta.salir()
		}
	},

	async ping () {
		const fx = 'microCuentas>ping'
		try {
			consolo.log(fx)
			const r = await solicitar.call(
				this,
				{
					url: `${cuenta.cuentasURL}/llavero`,
					method: 'get',
				},
				e => {
					this.sinConexion = true
				}
			)
			// consolo.log(fx, 'r', r)
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
				if (cuenta.usuario !== null) cuenta.usuario = null
				consolo.log(fx, 'abortado por no haber token')
				return
			}
			// consolo.log(fx)
			const r = await solicitar.call(this, {
				url: `${cuenta.cuentasURL}/leer`,
				method: 'get',
				headers: { Authorization: `Bearer ${token}` },
			})
			return await procesarInfoUsuario(r)
		} catch (e) {
			console.error(fx, e)
		}
	},

	async decriptarDatosPersonales () {
		const fx = 'microCuentas>decriptarDatosPersonales'
		try {
			const desencriptado =
				cuenta.datosPrivados &&
				(await miLlavero.desencriptar(cuenta.datosPrivados))
			return desencriptado && JSON.parse(desencriptado)
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
			const encriptado = await llaveroMicroCuentas.encriptar(
				JSON.stringify({ email, pass })
			)
			if (!encriptado || _.isEmpty(encriptado)) {
				console.error('Encriptado vacío', encriptado)
				return
			}
			const r = await solicitar.call(this, {
				url: `${cuenta.cuentasURL}/ingresar`,
				data: {
					encriptado,
					llaves,
				},
				method: 'post',
			})
			return await procesarInfoUsuario(r)
		} catch (e) {
			console.error(fx, e)
		}
	},

	async crearPass (pass) {
		const fx = 'microCuentas>crearPass'
		try {
			consolo.log(fx, { pass })

			if (!miLlavero) throw 'Falta miLlavero'
			if (!llaveroMicroCuentas) llaveroMicroCuentas = await cuenta.ping()

			const llaves = await miLlavero.exportarLlavesPublicas()
			const encriptado = await llaveroMicroCuentas.encriptar(
				JSON.stringify({ pass })
			)
			if (!encriptado || _.isEmpty(encriptado)) {
				console.error('Encriptado vacío', encriptado)
				return
			}
			const r = await solicitar.call(this, {
				url: `${cuenta.cuentasURL}/crearPass`,
				data: {
					encriptado,
					llaves,
				},
				method: 'post',
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
				if (cuenta.usuario !== null) cuenta.usuario = null
				consolo.log(fx, 'abortado por no haber token')
				return
			}
			consolo.log(fx, { pass })
			const r = await solicitar.call(this, {
				url: `${cuenta.cuentasURL}/reautenticar`,
				data: { pass },
				method: 'post',
			})
			return await procesarInfoUsuario(r)
		} catch (e) {
			console.error(fx, e)
		}
	},

	async salir () {
		cuenta.usuario = null
		cuenta.token = null
		cuenta.tokenAutofirmado = null
		cuenta.expTokenAutofirmado = null
		await cuentaStore.clear()
		cuenta.ping()

		if (cuenta.vm.$cuentaBack) cuenta.vm.$cuentaBack.salir()
		// Renovar llavero
		// if (miLlavero) {
		// 	consolo.log('Recreando llavero')
		// 	miLlavero = new Llavero()
		// 	await miLlavero.init({ crearKeys: 1 })
		// 	if (usarStores) await llaveroStore.setItem('miLlavero', miLlavero)
		// }
		return true
	},

	async ingresarConToken (token) {
		const fx = 'microCuentas>ingresarConToken'
		try {
			consolo.log(fx, { token })
			await cuenta.salir()
			const llaves = await miLlavero.exportarLlavesPublicas()
			const r = await solicitar.call(this, {
				url: `${cuenta.cuentasURL}/ingresarConToken`,
				data: { token, llaves },
				method: 'post',
			})
			procesarInfoUsuario(r)
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
					url: `${cuenta.cuentasURL}/pass`,
					method: 'post',
					data: { usuarioID, pass, passNuevo },
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
					data: { email, passNuevo },
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
				const llaves = await miLlavero.exportarLlavesPublicas()
				const r = await solicitar.call(this, {
					url: `${cuenta.cuentasURL}/pass/codigo`,
					method: 'put',
					data: { email, codigo, llaves },
				})
				consolo.log(`${fx} r`, r)
				return await procesarInfoUsuario(r)
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
					data: { email, passNuevo },
				})
				consolo.log(`${fx} r`, r)
				return r
			} catch (e) {
				console.error(fx, e)
			}
		},
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
				headers: { Authorization: `Bearer ${token}` },
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
				headers: { Authorization: `Bearer ${token}` },
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
				method: 'post',
			})
			consolo.log(`${fx} r`, r)
			return r
		} catch (e) {
			console.error(fx, e)
		}
	},

	// Inscripciones y ediciones por usuarios con autorización del back

	async crearCuenta (autorizacion, { nombre, apellido, email, telefono, rut }) {
		const fx = 'microCuentas>crearCuenta'
		const _ = cuenta.vm._
		try {
			const token = cuenta.token
			if (!token) {
				if (cuenta.usuario !== null) cuenta.usuario = null
				consolo.log(fx, 'abortado por no haber token')
				return
			}
			if (!miLlavero) throw 'Falta miLlavero'
			if (!llaveroMicroCuentas) llaveroMicroCuentas = await cuenta.ping()

			// Desencriptar secretoFront
			const tokenDecodificado = tokenDecoder(autorizacion)
			const secretoDecriptado = await miLlavero.desencriptar(
				tokenDecodificado.secretoFront
			)

			const serializado = JSON.stringify(
				_.pickBy(
					{ nombre, apellido, email, telefono, rut },
					v => v && !_.isEmpty(v)
				)
			)
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
				method: 'post',
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

	async editar ({ nombre, apellido, email, telefono }) {
		const fx = 'microCuentas>editarCuenta'
		const _ = cuenta.vm._
		try {
			const token = cuenta.token
			if (!token) {
				if (cuenta.usuario !== null) cuenta.usuario = null
				consolo.log(fx, 'abortado por no haber token')
				return
			}

			if (!miLlavero) throw 'Falta miLlavero'
			if (!llaveroMicroCuentas) llaveroMicroCuentas = await cuenta.ping()

			const serializado = JSON.stringify(
				_.pickBy(
					{ nombre, apellido, email, telefono },
					v => v && !_.isEmpty(v)
				)
			)
			consolo.log(fx, 'serializado', serializado)
			// Encriptar datos usuario
			const encriptado = await llaveroMicroCuentas.encriptar(serializado)
			if (!encriptado || _.isEmpty(encriptado)) {
				console.error('Encriptado vacío', encriptado)
				return
			}
			const r = await solicitar.call(this, {
				url: `${cuenta.cuentasURL}/editar`,
				data: { encriptado },
				headers: { Authorization: `Bearer ${token}` },
				method: 'post',
			})
			consolo.log(`${fx} r`, r)
			return await cuenta.leer()
		} catch (e) {
			console.error(fx, e)
		}
	},

	async editarPorOtro (autorizacion, { nombre, apellido, email, telefono }) {
		const fx = 'microCuentas>editarCuentaPorOtroUsuario'
		const _ = cuenta.vm._
		try {
			const token = cuenta.token
			if (!token) {
				if (cuenta.usuario !== null) cuenta.usuario = null
				consolo.log(fx, 'abortado por no haber token')
				return
			}

			if (!miLlavero) throw 'Falta miLlavero'
			if (!llaveroMicroCuentas) llaveroMicroCuentas = await cuenta.ping()

			// Desencriptar secretoFront
			const tokenDecodificado = tokenDecoder(autorizacion)
			const secretoDecriptado = await miLlavero.desencriptar(
				tokenDecodificado.secretoFront
			)

			const serializado = JSON.stringify(
				_.pickBy(
					{ nombre, apellido, email, telefono },
					v => v && !_.isEmpty(v)
				)
			)
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
				method: 'post',
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
				if (cuenta.usuario !== null) cuenta.usuario = null
				consolo.log(fx, 'abortado por no haber token')
				return
			}

			if (!miLlavero) throw 'Falta miLlavero'
			if (!llaveroMicroCuentas) llaveroMicroCuentas = await cuenta.ping()

			// Desencriptar secretoFront
			const tokenDecodificado = tokenDecoder(autorizacion)
			const secretoDecriptado = await miLlavero.desencriptar(
				tokenDecodificado.secretoFront
			)

			const serializado = JSON.stringify(
				_.pickBy({ rut }, v => v && !_.isEmpty(v))
			)
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
				method: 'post',
			})
			consolo.log(`${fx} r`, r)
			return r
		} catch (e) {
			console.error(fx, e)
		}
	},


	async datosPersonalesOtrosUsuarios (autorizacion) {
		const fx = 'microCuentas>datosPersonalesOtrosUsuarios'
		try {
			// consolo.log(fx, JSON.stringify({autorizacion}))
			if (!cuenta.token) {
				if (cuenta.usuario !== null) cuenta.usuario = null
				consolo.log(fx, 'abortado por no haber token')
				return
			}

			if (!miLlavero) throw 'Falta miLlavero'
			if (!llaveroMicroCuentas) llaveroMicroCuentas = await cuenta.ping()

			// Desencriptar secreto
			const tokenDecodificado = tokenDecoder(autorizacion)
			const secretoDecriptado = await miLlavero.desencriptar(tokenDecodificado.secretoFront)
			// console.log(fx, 'tokenDecodificado', tokenDecodificado)
			if (_.isEmpty(tokenDecodificado.usuarioIDs)) {
				consolo.info(fx, 'saltada por falta de usuariosIDs')
				return { ok: 1, usuarios: []}
			}

			const r = await solicitar.call(this, {
				url: `${cuenta.cuentasURL}/leerOtros`,
				data: { secretoDecriptado, autorizacion },
				headers: { Authorization: `Bearer ${cuenta.token}` },
				method: 'post',
			})
			if (!r || !r.ok) throw r
			const decriptado = await miLlavero.desencriptar(r.encriptado)
			// console.log(fx, 'decriptado', decriptado)
			const objetoDecriptado = JSON.parse(decriptado)
			const {usuarios} = objetoDecriptado
			// console.log(fx, 'usuarios', usuarios)
			return {ok: 1, usuarios}
		} catch (e) {
			console.error(fx, e)
			return e
		}
	},
}

async function solicitar (request, errorHandler) {
	const _ = cuenta.vm._
	const defaultHeaders = {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	}
	if (cuenta.token) {
		defaultHeaders.Authorization = `Bearer ${cuenta.token}`
		defaultHeaders['Token-Autofirmado'] = await cuenta.mantenerTokenAutorizado()
	}
	const ops = _.assignIn({ headers: defaultHeaders }, request)

	const data = await axios(ops)
		.then(r => {
			// consolo.log('r', r)
			if (cuenta.sinConexion === undefined || cuenta.sinConexion)
			{cuenta.sinConexion = false}
			return r.data
		})
		.catch(errorHandler || capturadorErrorSolicitud)

	if (!data) {
		console.error('Sin respuesta')
		return data
	}
	if (data.desconectar) cuenta.salir()
	if (!data.ok && _.get(data, 'error.titulo')) {
		// Mostrar mensaje de error ya preconfigurado
		cuenta.vm.$notificar(
			_.get(data, 'error.titulo'),
			_.get(data, 'error.descripcion'),
			_.get(data, 'error.tipoNotificacion', 'warning')
		)
	}
	if (_.get(data, 'notificar.titulo')) {
		// Mostrar mensaje ya preconfigurado
		cuenta.vm.$notificar(
			_.get(data, 'notificar.titulo'),
			_.get(data, 'notificar.descripcion'),
			_.get(data, 'notificar.tipo', 'warning')
		)
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
		cuenta.sinConexion = true
		// consolo.log(error.request)
		cuenta.ping()
	} else {
		consolo.log('Error inesperado (capturadorErrorSolicitud)', error.message)
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
			// consolo.log('criptoCuenta MOUNTED')
			cuenta.init(this)
		},
	})

	if (!Vue.__cuentas__) {
		Vue.__cuentas__ = true
		Object.defineProperty(Vue.prototype, '$usuario', {
			get () {
				return cuenta.usuario
			},
		})
		Object.defineProperty(Vue.prototype, '$cuentaSinConexion', {
			get () {
				return cuenta.sinConexion
			},
		})
	}
}
