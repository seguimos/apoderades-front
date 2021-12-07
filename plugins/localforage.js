import localforage from 'localforage'

const storage = localforage.createInstance({
	name: 'datos'
})

export default ({ app }, inject) => {
	inject('storage', storage)
}
