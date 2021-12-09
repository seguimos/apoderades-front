const EmisorEventosObjeto = {
	_events: [],
	on (nombreEvento, funcionAEjecutar) {
		if (!this._events[nombreEvento]) this._events[nombreEvento] = []
		this._events[nombreEvento].push(funcionAEjecutar)
	},

	off (nombreEvento, funcionAQuitar) {
		if (!this._events[nombreEvento]) {
			console.warn(`Evento "${nombreEvento}" no existe.`)
			return
		}
		this._events[nombreEvento] = this._events[nombreEvento].filter(funcionAEjecutar => funcionAEjecutar !== funcionAQuitar)
	},

	emit (nombreEvento, datosEventos) {
		if (!this._events[nombreEvento]) {
			console.warn(`No se puede emitir evento "${nombreEvento}", no existe.`)
			return
		}
		this._events[nombreEvento].forEach(callback => { callback(datosEventos) })
	}
}

export default EmisorEventosObjeto
