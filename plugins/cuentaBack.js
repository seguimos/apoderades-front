import axios from 'axios'
import Vue from 'vue'
import localforage from 'localforage'

import consolo from '@lib/consolo'
import emisorEventos from '@lib/emisorEventos'
import { _ } from './lodash'

const dev = process.env.dev

const cuentaBackStore = localforage.createInstance({ name: 'cuentaBackBackStore' })

const usarStores = false

const cuentaBack = {
	// Proporciona metodos on, off, emit, para emisión y escucha de eventos
	...emisorEventos,

	vm: undefined,
	_apoderade: undefined,

	sinConexion: undefined,
	backURL: null,

	async init (vm) {
		// const fx = 'cuentaBack>init'
		this.vm = vm

		this.backURL = process.env.dev ? process.env.backURL : process.env.backURL.replace('HOST', window.location.host)
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
			// consolo.log(fx)
			const r = await solicitar({
				method: 'get',
				url: `${cuentaBack.backURL}/apoderade`
			})
			this.leyendoDatos = false

			if (!r || !r.ok) {
				console.error(fx, 'fail', r)
				return
			}
			// consolo.log(fx, 'r', r)
			const { apoderade } = r
			if (apoderade.territorioPreferencia) {
				const t = apoderade.territorioPreferencia
				if (t.region && t.localId) cuentaBack.localPorID(t.region, t.localId)
			}
			if (!_.isEmpty(apoderade.territoriosAsignados)) {
				_.forEach(apoderade.territoriosAsignados, t => {
					if (t.region && t.localId) cuentaBack.localPorID(t.region, t.localId)
				})
				apoderade.asignaciones = _.map(apoderade.territoriosAsignados, t => cuentaBack.territorioAasignacion(t))
			}
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
			// consolo.log(fx)
			const r = await solicitar({
				method: 'get',
				url: `${cuentaBack.backURL}/apoderade/territorios`
			})
			if (!r || !r.ok) throw ['No se pudo cargar territorios del usuario', r]
			// cuentaBack.vm.$message.success('Locales cargados')
			this.territorios = r.territorio // ?? TODO: por revisar
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

	async crearApoderade ({ nombre, apellido, email, telefono, rut }) {
		const fx = 'cuentaBack>crearApoderade'
		try {
			// Primero obtener autorización del back
			const r = await solicitar({
				method: 'get',
				url: `${cuentaBack.backURL}/autorizarCreacion`
			})
			if (!r || !r.ok) throw ['fail autorizando creación de usuario (back)', r]
			const { autorizacion } = r

			// Crear usuario en microservicio de cuentas
			const c = await cuentaBack.cuenta.crearCuenta(autorizacion, { nombre, apellido, email, telefono, rut })
			if (!c || !c.ok) throw ['fail creando usuario en microcuentas', c]
			consolo.log(fx, 'microcuentas/crearCuenta', c)
			const { usuarioID, tokenIngresoEncriptado } = c

			// Ya se tiene el usuarioID, ahora a hacer lo que se tenga q hacer con eso y los demas datos en el back.
			const registroEnBack = await solicitar({
				method: 'post',
				url: `${cuentaBack.backURL}/apoderades`,
				data: {
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

	async soloCrearApoderade ({ nombre, apellido, email, telefono, rut }) {
		const fx = 'cuentaBack>soloCrearApoderade'
		try {
			// Primero obtener autorización del back
			const r = await solicitar({
				method: 'get',
				url: `${cuentaBack.backURL}/autorizarCreacion`
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
				url: `${cuentaBack.backURL}/apoderades`,
				data: {
					nombre,
					email,
					usuarioID,
					url: `${new URL(window.location.href).origin}/ingresoConToken?token=`,
					tokenIngresoEncriptado
				}
			})
			if (!registroEnBack || !registroEnBack.ok) throw ['fail creando usuario en back', registroEnBack]
			cuentaBack.vm.$message.success('Registro realizado, se enviará correo al inscrito')
			return {ok: 1, usuarioID, nombre, apellido}
		} catch (e) {
			if (!(e instanceof Error) && _.isArray(e)) console.error(fx, ...e)
			else console.error(fx, e)
			cuentaBack.vm.$message.error('Algo falló')
			return {ok: 0}
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
				url: `${cuentaBack.backURL}/apoderades/apoderade/${apoderadeID}`
			})
			this.leyendoDatos = false
			consolo.log(fx, 'r', r)
			const apoderade = r.apoderade
			apoderade.asignaciones = _.map(apoderade.territoriosAsignados, terr => cuentaBack.territorioAasignacion(terr))
			cuentaBack.vm.$store.commit('apoderade', apoderade)
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
				url: `${cuentaBack.backURL}/autorizarBusquedaPorRut`
			})
			if (!r || !r.ok) throw ['No se pudo autorizar Busqueda PorRut', r]

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

	intentaContactar: null,
	async obtenerDatosDeContacto ({regionID, comunaID, localID, usuarioID}) {
		const fx = 'cuentaBack>obtenerDatosDeContacto'
		try {
			console.log(fx, JSON.stringify({regionID, comunaID, localID, usuarioID}))
			// Primero obtener autorización del back
			const territorio = cuentaBack.territorioIDsATerritorio({regionID, comunaID, localID})
			const r = await solicitar({
				method: 'post',
				// TODO: establecer una URL en el back para obtener autorizacion
				url: `${cuentaBack.backURL}/autorizarLecturaDatosDeContacto`,
				data: {usuarioID, ...territorio}
			})
			if (!r || !r.ok) throw ['No se pudo autorizar obtenerDatosDeContacto', r]

			const { autorizacion } = r
			const s = await cuentaBack.cuenta.datosPersonalesOtrosUsuarios(autorizacion)
			consolo.log(fx, 'DATOS', s)
			if (!s || !s.ok) throw ['No se pudo obtenerDatosDeContacto', r]
			// TODO: hacer cosas con los datos
			const usuario = s.usuarios && s.usuarios[0]
			consolo.log(fx, 'USUARIO', usuario)
			const apoderade = cuentaBack.vm.$store.state.apoderades[usuario.usuarioID]
			cuentaBack.intentaContactar = _.assignIn(usuario, apoderade)
			return s
		} catch (e) {
			if (!(e instanceof Error) && _.isArray(e)) console.error(fx, ...e)
			else console.error(fx, e)
			cuentaBack.vm.$message.error('Algo falló')
		}
	},

	async asignarTerritorio ({ usuarioID, regionID, comunaID, localID, esApoGeneral}) {
		const fx = 'cuentaBack>asignarTerritorio'
		try {
			consolo.log(fx)
			const data = { region: regionID }
			if (comunaID) data.comunaCodigo = comunaID
			if (localID) {
				data.localId = localID
				data.esApoderadoGeneral = esApoGeneral
			}
			const r = await solicitar({
				method: 'post',
				url: `${cuentaBack.backURL}/apoderades/${usuarioID}/territorio`,
				data
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
	
	async desasignarTerritorio ({ usuarioID, regionID, comunaID, localID }) {
		const fx = 'cuentaBack>desasignarTerritorio'
		try {
			console.log(fx)
			const r = await solicitar({
				method: 'delete',
				url: `${cuentaBack.backURL}/apoderades/${usuarioID}/territorio`,
				data: { region: regionID, comunaCodigo: comunaID, localId: localID }
			})
			if (!r || !r.ok) throw ['No se pudo desasignar territorio', r]
			cuentaBack.vm.$message.success('Se desasignó territorio')
			console.log(fx, 'r', r)
			await cuentaBack.obtenerApoderade(usuarioID)
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
				url: `${cuentaBack.backURL}/apoderades/region`,
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
				url: `${cuentaBack.backURL}/apoderades/comuna/${comunaID}`
			})
			if (!r || !r.ok) throw r
			return r
		} catch (e) {
			console.error(fx, e)
		}
	},

	preferenciaSaltada: null,
	async guardarLocalDeVotacion ({ regionID, comunaID, localID }) {
		const fx = 'cuentaBack>guardarLocalDeVotacion'
		try {
			const s = await solicitar({
				method: 'post',
				url: `${cuentaBack.backURL}/apoderade/territoriopreferencia`,
				data: { territorioPreferencia: { region: regionID, comunaCodigo: comunaID, localId: localID } }
			})
			if (!s || !s.ok) throw ['fail editando autovalidando datos', s]
			await cuentaBack.leerMisDatos()
			return s
		} catch (e) {
			if (!(e instanceof Error) && _.isArray(e)) console.error(fx, ...e)
			else console.error(fx, e)
			cuentaBack.vm.$message.error('Algo falló')
		}
	},

	async localesXRegion (regionID) {
		const fx = 'cuentaBack>localesXRegion'
		try {
			consolo.log(fx, regionID || 'ABORTADO')
			if (!regionID) return 

			const r = await solicitar({
				method: 'get',
				url: `${cuentaBack.backURL}/locales/${regionID}`
			})
			if (!r || !r.ok) throw ['No se pudo cargar locales de la región', r]
			cuentaBack.vm.$message.success('Locales cargados')
			consolo.log(fx, 'r', r)

			const locales = _.reduce(r.locales, (locs, local) => {
				local.localID = local._id
				locs[local._id] = local
				delete locs[local._id]._id
				return locs
			}, {})
			console.log(fx, 'locales', locales)
			cuentaBack.vm.$store.commit('locales', locales)

			return r
		} catch (e) {
			if (!(e instanceof Error) && _.isArray(e)) console.error(fx, ...e)
			else console.error(fx, e)
			cuentaBack.vm.$message.error('Algo falló')
		}
	},
	async localesXComuna ({ regionID, comunaID }) {
		const fx = 'cuentaBack>localesXComuna'
		try {
			consolo.log(fx, { regionID, comunaID })
			const r = await solicitar({
				method: 'get',
				url: `${cuentaBack.backURL}/locales/${regionID}/comunas/${comunaID}/`
			})
			if (!r || !r.ok) throw ['No se pudo cargar locales de comuna', r]
			cuentaBack.vm.$message.success('Locales cargados')
			consolo.log(fx, 'r', r)

			const locales = _.reduce(r.locales, (locs, local) => {
				local.localID = local._id
				locs[local._id] = local
				delete locs[local._id]._id
				return locs
			}, {})
			console.log(fx, 'locales', locales)
			cuentaBack.vm.$store.commit('locales', locales)

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
			consolo.log(fx, {regionID, localID})
			const r = await solicitar({
				method: 'get',
				url: `${cuentaBack.backURL}/locales/${regionID}/locales/${localID}`
			})
			if (!r || !r.ok) throw [`No se pudo cargar local con id ${localID}`, r]
			// if (dev) cuentaBack.vm.$message.success('Local cargado')
			// consolo.log(fx, 'r', r)
			let local = r.local
			if (r.autorizacion) {
				const obtencionDatosPersonales = await cuentaBack.cuenta.datosPersonalesOtrosUsuarios(r.autorizacion)
				const {usuarios} = obtencionDatosPersonales
				// Unir datos de apoderade y usuario
				// const todesLesApoderades = Object.assign({})
				// console.log('local.apoderades', JSON.parse(JSON.stringify(local.apoderades)))
				// console.log('usuarios', JSON.parse(JSON.stringify(usuarios)))
				// console.log('r.apoderadesDisponibles', JSON.parse(JSON.stringify(r.apoderadesDisponibles)))
				// JSON.parse(JSON.stringify())
				const apoderades = _.map(r.apoderadesDisponibles, apoderade => {
					// console.log('apoderade.usuarioID', apoderade.usuarioID)
					const usuario = _.find(usuarios, u => u.usuarioID === apoderade.usuarioID) || {}
					apoderade.asignaciones = _.map(apoderade.territoriosAsignados, terr => cuentaBack.territorioAasignacion(terr))
					// console.log('apoderade', apoderade)
					// console.log('usuario', usuario)
					const unificado = Object.assign({}, usuario || {}, apoderade)
					// console.log('unificado', unificado)
					return unificado
				})
				const apoderadeIDs = _.map(apoderades, a => a.usuarioID)
				console.log('[localPorID] apoderades usuarioID s', _.map(apoderades, a => a.usuarioID))
				// console.log('[localPorID] apoderades', )

				cuentaBack.vm.$store.commit('apoderades', Object.assign({}, _.map(apoderades, a => a)))
				local = _.assignIn(local, { get todesLesApoderades () { return _.pick(cuentaBack.vm.$store.state.apoderades, apoderadeIDs) } })
			}
			cuentaBack.vm.$store.commit('local', local)

			return r
		} catch (e) {
			if (!(e instanceof Error) && _.isArray(e)) console.error(fx, ...e)
			else console.error(fx, e)
			if (dev) cuentaBack.vm.$message.error('Algo falló')
		}
	},


	async obtenerLocal ({ region, localId }) {
		const fx = 'cuentaBack>obtenerLocal'
		try {
			consolo.log(fx)
			const r = await solicitar({
				method: 'get',
				url: `${cuentaBack.backURL}/locales/${region}/locales/${localId}`
			})
			if (!r || !r.ok) throw ['No se pudo cargar local', r]
			// cuentaBack.vm.$message.success('Local cargado')
			consolo.log(fx, 'r', r)
			return r
		} catch (e) {
			if (!(e instanceof Error) && _.isArray(e)) console.error(fx, ...e)
			else console.error(fx, e)
			cuentaBack.vm.$message.error('Algo falló')
		}
	},

	territorioAasignacion (territorioAsignado) {
		const chile = cuentaBack.vm.$chile
		const asig = {
			region: territorioAsignado.region && chile.regionPorID(territorioAsignado.region),
			regionID: territorioAsignado.region,
			comuna: territorioAsignado.comunaCodigo && chile.comunaPorID(territorioAsignado.comunaCodigo),
			comunaID: territorioAsignado.comunaCodigo,
			local: territorioAsignado.localId && chile.localPorID(territorioAsignado.localId),
			localID: territorioAsignado.localId,
			general: territorioAsignado.esApoderadoGeneral
		}
		asig.capa = asig.general ? 'general' : asig.local?  'mesa' : asig.comuna? 'comunal' : asig.region? 'regional' : '!>!?!??!'
		return asig
	},

	asignacionATerritorio (asignacion) {
		const territorio = {
			region: asignacion.regionID,
			comunaCodigo: asignacion.comunaID,
			localId: asignacion.localID,
			esApoderadoGeneral: asignacion.general
		}
		return territorio
	},

	territorioIDsATerritorio (territorioIDs) {
		return {
			region: territorioIDs.regionID,
			comunaCodigo: territorioIDs.comunaID,
			localId: territorioIDs.localID
		}
	},

	reinstanciarAsignacion (asignacion) {
		const chile = cuentaBack.vm.$chile
		const asig = {
			region: asignacion.regionID && chile.regionPorID(asignacion.regionID),
			regionID: asignacion.regionID,
			comuna: asignacion.comunaID && chile.comunaPorID(asignacion.comunaID),
			comunaID: asignacion.comunaID,
			local: asignacion.localID && chile.localPorID(asignacion.localID),
			localID: asignacion.localID,
			general: asignacion.esApoderadoGeneral
		}
		asig.capa = asig.general ? 'general' : asig.local?  'mesa' : asig.comuna? 'comunal' : asig.region? 'regional' : '!>!?!??!'
		return asig
	},
	
	async firmarCarga () {
		const url = await solicitar({
			method: 'get',
			url: `${cuentaBack.backURL}/signedUrl`
		})
			.then(r => r.urlFirmada)
			.catch(e => console.error('fallo respuesta', e))
		console.log('firmarCarga', url)

		return url
	},
	
	async firmarCargaActa ({regionID, comunaID, localID, mesaID}) {
		const fx = 'firmarCargaActa'
		try {
			const r = await solicitar({
				method: 'post',
				url: `${cuentaBack.backURL}/actas/${regionID}/${comunaID}/${localID}/${mesaID}`,
				data: {}
			})
			if (!r || !r.ok) throw r
			// cuentaBack.vm.$message.success('Local cargado')
			consolo.log(fx, 'r', r)

			return r.url
		} catch (e) {
			console.error(fx, e)
			return e
		}
	},

	async guardarVotos ({regionID, comunaID, localID, mesaID, votos, reescritura = false}) {
		const fx = 'guardarVotos'
		try {
			const r = await solicitar({
				method: 'post',
				url: `${cuentaBack.backURL}/conteos/${regionID}/${comunaID}/${localID}/${mesaID}`,
				data: { votos, reescritura }
			})
			if (!r || !r.ok) throw r
			// cuentaBack.vm.$message.success('Local cargado')
			consolo.log(fx, 'r', r)

			return r
		} catch (e) {
			console.error(fx, e)
			return e
		}
	},

	async elegirConteoParaMesa ({regionID, comunaID, localID, mesaID, conteoID}) {
		const fx = 'guardarVotos'
		try {
			const r = await solicitar({
				method: 'post',
				url: `${cuentaBack.backURL}/conteoSeleccionado/${regionID}/${comunaID}/${localID}/${mesaID}`,
				data: { conteoID }
			})
			if (!r || !r.ok) throw r
			// cuentaBack.vm.$message.success('Local cargado')
			consolo.log(fx, 'r', r)

			return r
		} catch (e) {
			console.error(fx, e)
			return e
		}
	},

	async habilitarApoderade ({regionID, comunaID, localID, usuarioID}) {
		const fx = 'habilitarApoderade'
		try {
			const r = await solicitar({
				method: 'post',
				url: `${cuentaBack.backURL}/habilitarApoderade/${regionID}/${comunaID}/${localID}`,
				data: { usuarioID }
			})
			if (!r || !r.ok) throw r
			// cuentaBack.vm.$message.success('Local cargado')
			consolo.log(fx, 'r', r)

			return r
		} catch (e) {
			console.error(fx, e)
			return e
		}
	},

	async cerrarLocal ({regionID, comunaID, localID}) {
		const fx = 'cerrarLocal'
		try {
			const r = await solicitar({
				method: 'post',
				url: `${cuentaBack.backURL}/cierreLocal/${regionID}/${comunaID}/${localID}`,
			})
			if (!r || !r.ok) throw r
			// cuentaBack.vm.$message.success('Local cargado')
			consolo.log(fx, 'r', r)

			return r
		} catch (e) {
			console.error(fx, e)
			return e
		}
	}

}














async function solicitar (request, errorHandler) {
	const tokenAutofirmado = await cuentaBack.cuenta.mantenerTokenAutorizado()
	if (!tokenAutofirmado) {
		throw 'Falta tokenAutofirmado'
	}
	const defaultHeaders = {
		Accept: 'application/json',
		'Content-Type': 'application/json',
		Authorization: `Bearer ${cuentaBack.cuenta.token}`,
		'Token-Autofirmado': tokenAutofirmado
	}
	const ops = _.assignIn({ headers: defaultHeaders }, request)

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
Vue.util.defineReactive(cuentaBack, 'preferenciaSaltada', cuentaBack.preferenciaSaltada)
Vue.util.defineReactive(cuentaBack, 'intentaContactar', cuentaBack.intentaContactar)
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
				// consolo.log('cuentaBack MOUNTED')
				cuentaBack.init(vm)
			})
		}
	})
}
