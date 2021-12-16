<template lang="pug">
.rootCierre
	.contenido

		
</template>
<script>
export default {

	data () {

		return {

			local: {
				nombre: '',
				mesas: [],
				apoderados: [],
				apoderadoGeneral: ''
			},

			abrirModalReportes: null,
			modificandoAvatar: null
		}
	},
	
	computed: {
		region () {
			return this.$route.params.region
		},
		localId () {
			return this.$route.params.localId
		},
		conteos () {
			const mesas = this.local.mesas
			const cierres = this._.filter(mesas, 'conteo')
			return cierres
		}
	},
	mounted () {
		this.getLocal()
	},
	methods: {

		async getLocal () {
			const region = this.$route.params.region
			const localId = this.$route.params.localId
			const response = await this.$cuentaBack.obtenerLocal({ region, localId })
			this.local.nombre = response.local.nombre
			this.local.apoderadoGeneral = 'Gabriel Boric'
			this.local.mesas = Object.values(response.local.mesas)
			console.log('mesas', this.local.mesas)
			console.log('get local',response.local.mesas)

			this.local.apoderados = response.local.apoderades.map(apo => ({
				...apo,
				nombre: `usuarioID: ${apo.usuarioID}`
			}))
		},
	}
}
</script>
<style lang="sass" scoped>
.rootConteo
	.contenido
		display: flex
		width: 100%
		flex-flow: column nowrap
		align-items: center
		.conteoDeVotos
			max-width: 500px
			.titulo
				color: #767676
				font-size: 1.3rem
			.grupo
				display: flex
				flex-flow: row wrap
				align-items: center
				// justify-content: center
				padding: .5em 0
				.select,
				.input
					max-width: 150px
					min-width: 100px
					// padding: 0 1em
				.tipo
					// padding: 0 1em
					width: 160px
			.grupoActa
				display: flex
				justify-content: center
				width: 100%
				.actaCierre
					display: flex
					justify-content: center
					width: 100%
					padding: 1em
		.contenedorBoton
			display: flex
			justify-content: center
			.boton
				background-color: #fff
				color: rgba(0, 0, 0, .5)
				border: 1px solid rgba(0, 0, 0, .5)
</style>
