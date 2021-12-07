import consolo from '@mainlib/consolo'

export default ({ app }, inject) => {
	inject('consolo', consolo)
}

export { consolo }
