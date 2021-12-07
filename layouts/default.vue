<template lang="pug">
.main
	.header
		Navbar
	Nuxt
</template>

<script>
export default {
	mounted () {
		this.recargarusuario()
		// this.recargarvisitante()
	},
	methods: {
		async recargarusuario () {
			const usuario = await this.$storage.getItem('usuario')
			const token = await this.$storage.getItem('token')
			this.$store.commit('usuarioLogeado', { usuario, token })
			console.log('recarga usuario', usuario, token)
		}
		// async recargarvisitante () {
		// 	const visitorId = await this.$storage.getItem('visitorId')
		// 	this.$store.commit('visitorId', visitorId)
		// 	// this.$store.setItem('usuarioLogeado', visitorId)
		// }
	}
}
</script>

<style lang="sass">
@import '@style/colores'
@import '@style/paleta'

.main
	min-height: 100vh
	// overflow-y: auto
	position: relative
	// border: 3px solid green
	display: flex
	flex-flow: column nowrap
	.header
		flex: auto 0 0
	.cuerpo
		flex: auto 1 0
		overflow-x: hidden
	.footer
		flex: auto 0 0
</style>
