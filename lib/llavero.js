'use strict'
import _ from 'lodash'

import chalk from './chalk'
import consolo from './consolo'
import cripto from './cripto'

class Llavero {
	constructor (nombre) {
		this.nombre = nombre
		this._llavesFirma = {}
		this._llavesEncriptacion = {}
	}

	reinstanciar ({ _llavesFirma, _llavesEncriptacion }) {
		this._llavesFirma = _llavesFirma
		this._llavesEncriptacion = _llavesEncriptacion
	}

	static revisarLlaves (llaves) {
		if (!_.isObject(llaves)) throw 'llaves debe ser objeto'
		if (!_.isObject(llaves.firma)) throw 'llaves.firma debe ser objeto'
		if (_.isEmpty(llaves.firma.publica)) throw 'Falta llave publica de firma'
		if (!_.isObject(llaves.encriptacion)) throw 'llaves.encriptacion debe ser objeto'
		if (_.isEmpty(llaves.encriptacion.publica)) throw 'Falta llave publica de encriptacion'
		return true
	}

	async prepararEmisor (llaves) {
		const fx = `Llavero:${this.nombre}.prepararEmisor`
		try {
			Llavero.revisarLlaves(llaves)
			if (_.isEmpty(llaves.firma.privada)) throw 'Falta llave privada de firma'
			if (_.isEmpty(llaves.encriptacion.privada)) throw 'Falta llave privada de encriptacion'
			const importado = await this.importar(llaves)
			return importado
		} catch (e) {
			consolo.error(fx, e)
			throw e
		}
	}

	async prepararDestinatario (llaves) {
		const fx = `Llavero:${this.nombre}.prepararDestinatario`
		try {
			// console.log(fx, llaves)
			delete llaves.firma.privada
			delete llaves.encriptacion.privada
			Llavero.revisarLlaves(llaves)
			const importado = await this.importar(llaves)
			return importado
		} catch (e) {
			consolo.error(fx, e)
			throw e
		}
	}

	async init (opciones = {}) {
		const nombre = this.nombre
		const fx = `${nombre}(Llavero).init`
		try {
			consolo.log(fx, { nombre, opciones })
			if (nombre === 'nuevo' || opciones === true || opciones.crearFirmas || opciones.crearKeys) {
				this._llavesFirma = await cripto.crearKeysFirmas()
				this._llavesEncriptacion = await cripto.crearKeysEncriptacion()
			}
			return true
		} catch (e) {
			consolo.error(fx, e)
			throw e
		}
	}

	// Importación

	async importar ({ firma, encriptacion }) {
		const fx = `Llavero:${this.nombre}.importar`
		// consolo.log(fx, { firma, encriptacion })

		try {
			if (firma && !_.isEmpty(firma)) {
				const firmaAImportar = {}
				if (firma.publica) firmaAImportar.publica = await cripto.importar.firma.publica(firma.publica)
				if (firma.privada) firmaAImportar.privada = await cripto.importar.firma.privada(firma.privada)
				this._llavesFirma = firmaAImportar
			}
			if (encriptacion && !_.isEmpty(encriptacion)) {
				const llavesEncriptacionAImportar = {}
				if (encriptacion.publica) llavesEncriptacionAImportar.publica = await cripto.importar.encriptacion.publica(encriptacion.publica)
				if (encriptacion.privada) llavesEncriptacionAImportar.privada = await cripto.importar.encriptacion.privada(encriptacion.privada)
				this._llavesEncriptacion = llavesEncriptacionAImportar
			}
			// Revisar resultado
			consolo.log(chalk.bgGreen.black(fx))
			return true
		} catch (e) {
			consolo.error(chalk.bgRed.black(fx), e)
			consolo.error('firma.publica', firma.publica)
			consolo.error('firma.privada', firma.privada)
			consolo.error('encriptacion.publica', encriptacion.publica)
			consolo.error('encriptacion.privada', encriptacion.privada)
			throw e
		}
	}

	// Exportación

	async exportar () {
		const fx = `Llavero:${this.nombre}.exportar`
		consolo.log(fx)
		try {
			const exportado = { firma: {}, encriptacion: {} }
			const firma = this._llavesFirma
			if (firma.publica) exportado.firma.publica = await cripto.exportar.firma.publica(firma.publica)
			if (firma.privada) exportado.firma.privada = await cripto.exportar.firma.privada(firma.privada)

			const encriptacion = this._llavesEncriptacion
			if (encriptacion.publica) exportado.encriptacion.publica = await cripto.exportar.encriptacion.publica(encriptacion.publica)
			if (encriptacion.privada) exportado.encriptacion.privada = await cripto.exportar.encriptacion.privada(encriptacion.privada)

			consolo.log(fx, { firma: { publica: !!firma.publica, privada: !!firma.privada }, encriptacion: { publica: !!encriptacion.publica, privada: !!encriptacion.privada } })
			consolo.log(fx, { exportado })
			return exportado
		} catch (e) {
			consolo.error(fx, e)
			throw e
		}
	}

	async exportarLlavesPublicas () {
		const fx = `Llavero:${this.nombre}.exportarLlavesPublicas`
		try {
			const llaves = {
				firma: { publica: await cripto.exportar.firma.publica(this._llavesFirma.publica) },
				encriptacion: { publica: await cripto.exportar.encriptacion.publica(this._llavesEncriptacion.publica) }
			}
			return llaves
		} catch (e) {
			consolo.error(fx, e)
			throw e
		}
	}

	// Operaciones

	async encriptar (mensaje) {
		const fx = `Llavero:${this.nombre}.encriptar`
		try {
			// consolo.log(fx, mensaje)
			const llave = this._llavesEncriptacion.publica
			if (!llave) throw 'Falta llave'
			return await cripto.encriptar(llave, mensaje)
		} catch (e) {
			consolo.error(fx, e)
			throw e
		}
	}

	async desencriptar (encriptado) {
		const fx = `Llavero:${this.nombre}.desencriptar`
		try {
			consolo.log(fx)
			const llave = this._llavesEncriptacion.privada
			return llave && await cripto.desencriptar(llave, encriptado)
		} catch (e) {
			consolo.error(fx, e)
			throw e
		}
	}

	async firmarToken (cuerpo) {
		const fx = `Llavero:${this.nombre}.firmarToken`
		try {
			// consolo.log(fx, cuerpo)
			const llave = this._llavesFirma.privada
			if (!llave) throw 'Falta llave'

			cuerpo.iss = this.nombre
			const token = await cripto.firmarToken(llave, cuerpo, { issuer: this.nombre })
			return token
		} catch (e) {
			consolo.error(fx, e)
			throw e
		}
	}

	async verificarFirmaToken (token) {
		const fx = `Llavero:${this.nombre}.verificarFirmaToken`
		try {
			consolo.log(fx)
			const llave = this._llavesFirma.publica
			return llave && await cripto.verificarFirmaToken(llave, token, { issuer: this.nombre })
		} catch (e) {
			consolo.error(fx, e)
			throw e
		}
	}

	async crearToken (body) {
		const fx = `Llavero:${this.nombre}.crearToken`
		try {
			consolo.log(fx, body)
			const llave = this._llavesFirma.privada
			if (!llave) throw 'Falta llave'
			body.iss = this.nombre
			return await cripto.crearToken(llave, body)
		} catch (e) {
			consolo.error(fx, e)
			throw e
		}
	}

	async verificarToken (token, opciones) {
		const fx = `Llavero:${this.nombre}.verificarToken`
		try {
			const llave = this._llavesFirma.publica
			const ok = llave && await cripto.verificarToken(llave, token, opciones)
			consolo.log(chalk.green(fx))
			return ok
		} catch (e) {
			consolo.error(fx, e)
			throw e
		}
	}
}

export default Llavero
