<template lang="pug">
.carpetaApp
	.noconectado(v-if="!$usuario")
		div
			cuenta

	// Conectado, pero no se obtuvo datos del back
	.conectadoPeroSinBack(v-else-if="$back.apoderade === false")
		.tac
			b Error
			p No se pudo conectar con el back

	// Conectado, obteniendo datos del back
	.cargando(v-else-if="!$back.apoderade")
		.tac
			a-icon(type="loading")
			p Cargando

	// Conectado, datos del back listos
	.conectado(v-else-if="_.get($back, ['apoderade', 'fechaValidacionDatos'])")
		.contenido
			n-child
	apoderades-validar(v-else)
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
		console.log('this.$usuario', JSON.parse(JSON.stringify(this.$usuario)))
	},
	methods: {
		async buscarMisDatos () {
			const usuarioBack = await this.$back.leerMisDatos()
			if (usuarioBack) {
				const territorio = await this.$back.misTerritorios()
				console.log('buscarMisDatos-territorio', territorio)
			}
		}
	}
}
</script>
<style lang="sass" scoped>
@import "@style/vars"

.carpetaApp
	height: 100%
	// border: 1px solid red
	.noconectado,
	.conectadoPeroSinBack,
	.cargando
		min-height: 80vh
		display: flex
		// flex-flow: column nowrap
		// flex: auto 1 0
		// display: flex
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
