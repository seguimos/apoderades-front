import consolo from '@mainlib/consolo'

// El consolo es como la consola, pero solo funciona (log, info, error, etc) en desarrollo

export default ({ app }, inject) => {
	inject('consolo', consolo)
}

export { consolo }
