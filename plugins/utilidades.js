import Vue from 'vue'
import parameterize from '@lib/parameterize'



function capitalizar (string) {
	if (!string) return null
	const str = String(string)
	return str.substring(0, 1).toUpperCase() + str.substring(1)
}

export default function () {
	Vue.prototype.$dev = process.env.dev
	Vue.prototype.$p = parameterize
	Vue.prototype.$c = capitalizar
	// Vue.prototype.$id = MiniID

	// Vue.mixin(mixin)
}
