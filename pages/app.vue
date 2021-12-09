<template lang="pug">
.carpetaCuenta
	//.noconectado
		div
			cuenta
	.noconectado(v-if="!$usuario")
		div
			pre NO CONECTADO
			cuenta
	.conectado(v-else)
		.contenido
			pre CONECTADO
			n-child
</template>
<script>
import cuenta from '~/components/cuenta'
export default {
	components: { cuenta },
	data () {
		return {}
	},
	watch: {
		$usuario (actual) {
			if (actual) this.buscarMisDatos()
		}
	},
	mounted () {
		if (!this.$usuario) return
		this.buscarMisDatos()
		console.log('this.$usuario', JSON.parse(JSON.stringify(this.$usuario)))
	},
	methods: {
		async buscarMisDatos () {
			await this.$back.leerMisDatos()
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
