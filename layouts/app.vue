<template lang="pug">
a-config-provider(:locale="esEs")
	Nuxt
</template>

<script>
import esEs from 'ant-design-vue/lib/locale-provider/es_ES'
export default {
	data () {
		return {
			esEs
		}
	},
	mounted () {
		if (process.env.dev) window.vm = this
	}
}
</script>

