import Vue from 'vue'
import Moment from 'moment-timezone'
import { extendMoment } from 'moment-range'
import 'moment/locale/es'
import 'moment/locale/en-gb'
import 'moment/locale/pt-br'
const moment = extendMoment(Moment)

moment.locale('es')

moment.mostrarRangoFechas = (inicio, fin) => {
	if (!inicio || !fin) throw 'Fail mostrarRangoFechas, falta inicio y/o fin'
	inicio = moment(inicio)
	fin = moment(fin)
	const ahora = moment()

	if (inicio.isSame(fin, 'day')) {
		return `${inicio.format('DD MMM')}`
	}
	if (inicio.isSame(fin, 'month')) {
		if (ahora.isSame(fin, 'year')) return `${inicio.format('DD')} - ${fin.format('DD MMM')}`
		return `${inicio.format('DD')} - ${fin.format('DD MMM YYYY')}`
	}
	if (inicio.isSame(fin, 'year')) {
		if (ahora.isSame(fin, 'year')) return `${inicio.format('DD MMM')} - ${fin.format('DD MMM')}`
		return `${inicio.format('DD MMM')} - ${fin.format('DD MMM YYYY')}`
	}
	return `${inicio.isSame(ahora, 'year') ? inicio.format('DD MMM') : inicio.format('DD MMM YYYY')} - ${fin.isSame(ahora, 'year') ? fin.format('DD MMM') : fin.format('DD MMM YYYY')}`
}

moment.mostrarFecha = fecha => {
	if (!fecha) throw 'Fail mostrarFecha, falta fecha'
	fecha = moment(fecha)
	const hoy = reloj.hoy

	if (fecha.isSame(hoy, 'day')) {
		return fecha.format('H:mm a')
	}
	if (fecha.isSame(hoy, 'month')) {
		return fecha.format('dddd D, H:mm a')
	}
	if (fecha.isSame(hoy, 'year')) {
		return fecha.format('dddd D MMMM, H:mm a')
	}
	return fecha.format('dddd D MMMM YYYY, H:mm a')
}

Vue.prototype.$moment = moment


// RELOJ

const fechaApertura = moment('2021-12-19T07:00:00-03:00')
const fechaCierre = moment('2021-12-19T18:00:00-03:00')
const reloj = {
	ahora: moment(),
	hoy: moment().startOf('day'),
	timezone: moment.tz.guess(),
	fechaCierre,
	fechaApertura,
	tiempoParaCierre: moment(fechaCierre).fromNow()
}

function actualizar () {
	reloj.ahora = moment()
	if (!reloj.hoy.isSame(reloj.ahora, 'day')) reloj.hoy = reloj.ahora.startOf('day')
	const proxMinuto = moment().seconds(0).add(1, 'minute')

	reloj.tiempoParaCierre = moment(fechaCierre).isBefore(reloj.ahora) ? 0 : moment(fechaCierre).fromNow()
	setTimeout(function () { actualizar() }, proxMinuto.diff(reloj.ahora))
}
if (process.client) actualizar()

Vue.util.defineReactive(reloj, 'ahora', reloj.ahora)
Vue.util.defineReactive(reloj, 'fechaCierre', reloj.fechaCierre)
Vue.util.defineReactive(reloj, 'tiempoParaCierre', reloj.tiempoParaCierre)
Vue.util.defineReactive(reloj, 'hoy', reloj.hoy)
Vue.util.defineReactive(reloj, 'timezone', reloj.timezone)
// Vue.prototype.$ahora = reloj.ahora

export {
	moment,
	reloj
}

export default function () {
	if (!Vue.__reloj__) {
		Vue.__reloj__ = true
		Object.defineProperty(Vue.prototype, '$fechaCierre', { get () { return reloj.fechaCierre } })
		Object.defineProperty(Vue.prototype, '$fechaApertura', { get () { return reloj.fechaApertura } })
		Object.defineProperty(Vue.prototype, '$ahora', { get () { return reloj.ahora } })
		Object.defineProperty(Vue.prototype, '$tiempoParaCierre', { get () { return reloj.tiempoParaCierre } })
		Object.defineProperty(Vue.prototype, '$hoy', { get () { return reloj.hoy } })
		Object.defineProperty(Vue.prototype, '$timezone', { get () { return reloj.timezone } })
	}
}
