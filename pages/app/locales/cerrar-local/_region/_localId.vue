<template lang="pug">
.rootCierre
	.contenido
		.header
			.titulo Cerrar local
			.sub Confirma los cierres de mesa
			.resumen
				.item Mesas local {{ mesasLen }}
				.item Mesas cerradas {{ mesasCerradasLen }}
		.mesasCerradas
			.contenedorMesas(v-if="local.mesasCerradas")
				.mesa(v-for="(mesa, i) in local.mesasCerradas")
					.titulo Mesa {{ mesa.mesa }}
					.contenedorGrupo
						.grupomesa(v-for="(conteo, index) in mesa.conteo")
							.titulo Cierre:  {{ index }}
							.conteo
								.votos Boric 
									.contador {{ conteo.votos.Boric }}
								.votos Kast 
									.contador {{ conteo.votos.Kast }}
								.votos nulos 
									.contador {{ conteo.votos.nulos }}
								.votos blancos
									.contador {{ conteo.votos.blancos }}
							.acta Acta de Cierre: #[a.nVotos(:href="conteo.votos.actaURL" 	target="_blank") Ver acta]
							.fecha Fecha: {{ conteo.fecha}}
							.confirmar(@click="confirmarCierre({ index, mesaID: mesa.id })") Confirmar cierre



		
</template>
<script>
export default {

	data () {

		return {

			local: {
				nombre: '',
				mesas: [],
				apoderados: [],
				apoderadoGeneral: '',
				mesasCerradas: []
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
		mesasLen () {
			return this.local.mesas.length
		},
		mesasCerradasLen () {
			return this.local.mesasCerradas.length
		},
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
			this.local.mesas = response.local.mesas

			this.local.mesasCerradas = this._.filter(response.local.mesas, 'conteo')
			console.log('mesasCerradas', this.local.mesasCerradas)

			this.local.apoderados = response.local.apoderades.map(apo => ({
				...apo,
				nombre: `usuarioID: ${apo.usuarioID}`
			}))
		},
		confirmarCierre ({ index, mesaID }) {
			console.log({  index, mesaID })
		}
		 
	}
}
</script>
<style lang="sass" scoped>
.contenido
	.header
		.titulo
			font-size: 1.5rem
		.sub
			font-size: 1.2rem
	.mesasCerradas
		.contenedorMesas
			display: flex
			flex-flow: row wrap
			width: 100%
			.mesa
				border: 1px solid rgba(0, 0, 0, .5)
				border-radius: 10px
				margin: 1em
				padding: .3em
				.titulo
					font-size: 1rem
					font-style: italic
					padding-left: .5em
				.contenedorGrupo
					display: flex
					flex-flow: row wrap
				.grupomesa
					border: 1px solid rgba(0, 0, 0, .5)
					border-radius: 10px
					padding: .3em
					margin: 1em
					.conteo
						display: flex
						flex-flow: row wrap
						justify-content: space-between
						width: 200px
						padding: 0 1em
						.votos
							margin: .2em .5em
							padding: .5em
							font-size: 1rem
							.contador
								padding: 0 .2em
								text-align: center
								font-size: 1.7rem
					.nVotos 
						font-weight: 700
					.acta
						font-size: 1rem
						padding-bottom: .5em
				

	
</style>
