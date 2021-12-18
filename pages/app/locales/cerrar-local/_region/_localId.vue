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
			table.contenedorMesas(v-if="local.mesasCerradas")
				tr.mesa(v-for="(mesa, i) in local.mesasCerradas" v-if='mesa')
					tr.titulo Mesa {{ mesa.mesa }}
					tr.contenedorGrupo
						th.grupomesa
							td.item Apod
							td.item Boric
							td.item Kast
							td.item Nulos
							td.item Blancos
							td.item Acta
							td.item Confirm

						tr.grupomesa(v-for="(conteo, index) in mesa.conteo")
							td.item {{ index }}
							td.item {{ conteo.votos.Boric }} 
							td.item {{ conteo.votos.Kast }}
							td.item {{ conteo.votos.nulos }}
							td.item {{ conteo.votos.blancos }}
							td.item #[a.acta(:href="conteo.votos.actaURL" 	target="_blank") Ver acta]

							.item(@click="confirmarCierre({ conteo, index, mesaID: mesa.id })") Confirmar



		
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
		confirmarCierre ({ conteo, index, mesaID }) {
			console.log('confirmarCierre', {  conteo, index, mesaID })
			
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
			// display: flex
			// flex-flow: row wrap
			width: 100%
			.mesa
				border: 1px solid rgba(0, 0, 0, .5)
				border-radius: 10px
				margin: 1em
				padding: .3em
				.titulo
					font-size: 1.1rem
					font-weight: 700
					font-style: italic
					padding-left: .5em
				//.contenedorGrupo
					display: flex
					flex-flow: column nowrap
					width: 100%
					.grupomesa
						// border: 1px solid rgba(0, 0, 0, .5)
						// border-radius: 10px
						// padding: .5em
						// margin: 1.3em 0
						display: flex
						flex-flow: row wrap
						width: 100%
						justify-content: space-between
						align-items: center
						position: relative
						.fecha
							position: absolute
							top: -1.4em
							right: 1em
							font-size: 1.1rem
						.item
							padding: .5em
							flex: 14.28% 0 1
							.acta
								font-weight: 700
								font-size: 1rem
								padding-bottom: .5em
						.confirmar
							text-align: center
							color: rgba(186, 0, 0, 1)
							font-size: 1.1rem
				
				

	
</style>
