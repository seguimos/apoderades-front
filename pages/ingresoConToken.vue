<template lang="pug">
.paginaIngresoConToken
</template>
<script>
export default {
	data () {
		return {}
	},
	computed: {
		token () {
			return this.$route.query.token
		}
	},
	mounted () {
		// Verificar si está ingresando
		// if (this.token)
	},
	methods: {
		async ingresarConToken () {
			if (!this.token) return
			console.log('ingresando con token')
			const ingresoConToken = await this.$cuentaBack.ingresarConToken(this.token)
			if (ingresoConToken.ok) this.$router.replace('/app')
		}
	}
}
</script>
<style lang="sass" scoped>
@import "@style/vars"

.carpetaCuenta
	height: 100%
	display: flex
	flex-flow: column nowrap

	.noconectado,
	.conectado
		flex: auto 1 0
	.noconectado
		display: flex
		justify-content: center
		align-items: center
		text-align: center
		.ant-btn
			margin-top: 2em

	.conectado
		display: flex
		padding: 2em
		width: 900px
		max-width: 100%
		margin: 0 auto
		.menuLateral
			flex: auto 0 0
			margin-right: 5em
		.contenido
			flex: auto 1 1

		.menuLateral
			.link
				display: block
				padding: .5em 0
</style>
