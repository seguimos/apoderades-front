<template lang="pug">
a-config-provider(:locale='esEs')
	.main
		Navbar.barraSuperior(esHeader)
		.conexiones(v-if='$cuenta.sinConexion') Servicio de cuentas sin conexion ⚠️
		.conexiones(v-if='$cuentaBack.sinConexion') Backend sin conexion ⚠️
		//div
			a-row
				a-col( :xs="{ span: 24, offset: 0}", :sm="{span: 18, offset: 3}", :md="{span: 16, offset: 4}", :lg="{span: 10, offset: 7}")
		Nuxt.ElContenido
		Navbar.barraInferior(esFooter)
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

<style lang="sass">
@import '@style/utils'
@import '@style/colores'
@import '@style/paleta'

.main
	min-height: 100vh
	position: relative
	display: flex
	flex-flow: column nowrap
	.barraSuperior
		flex: auto 0 0
		position: sticky
		top: 0
		width: 100%
		z-index: 1000
	.conexiones
		position: fixed
		font-size: 1.4rem
		top: 5em
		color: rgba(255, 0, 0, 1)
	.ElContenido
		position: relative
		z-index: 1
		flex: auto 1 0
	.barraInferior
		flex: auto 0 0
		position: sticky
		bottom: 0
		width: 100%
		z-index: 999
		+compu
			display: none
</style>
