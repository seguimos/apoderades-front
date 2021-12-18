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

				.mesa(v-for="(mesa, i) in local.mesasCerradas" v-if='mesa')
					.titulo Mesa {{ mesa && mesa.mesa }}

					.tabla(v-if='mesa.conteo' v-for="(conteo, usuarioID) in mesa.conteo")
						.seleccionada(v-if="cierresSeleccionados, usuarioID") incluidooo
						.contenedorGrupo.flex.jcsa
							.item 
								.tipo.fwb Boric
								.valor {{ conteo.votos.Boric }} 
							.item 
								.tipo.fwb Kast
								.valor {{ conteo.votos.Kast }}
							.item 
								.tipo.fwb Nulos
								.valor {{ conteo.votos.nulos }}
							.item 
								.tipo.fwb Blancos
								.valor {{ conteo.votos.blancos }}
							
						.contenedorGrupo.flex.jcsb
							.item 
								//- .tipo  Apod
								.valor {{ usuarioID }}
							.item 
								//- .tipo  Acta
								.valor(@click="verActa(conteo.votos.actaURL)") Ver acta
							.item 
								//- .tipo  Confirm
								.valor(@click="confirmarCierre({ conteo, usuarioID, mesaID: mesa.id })") seleccionar
								//.valor 
									a-radio
						

	a-modal.modal( v-model="visible" @ok="handleOk")
		.contenido(v-if="actaURL")
			img(:src="actaURL")


		
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
				mesasCerradas: [],
			},
			cierresSeleccionados: [],
			abrirModalReportes: null,
			modificandoAvatar: null,
			visible: null,
			actaURL: null
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
			const {local} = response
			local.mesasCerradas = this._.filter(response.local.mesas, m => !this._.isEmpty(m.conteo))

			this.local = local
		},
		confirmarCierre ({ conteo, usuarioID, mesaID }) {
			console.log('confirmarCierre', {  conteo, usuarioID, mesaID })
			this.cierresSeleccionados[mesaID] = usuarioID
		},
		confirmarCierrex ({ conteo, usuarioID, mesaID }) {
			console.log('confirmarCierre', {  conteo, usuarioID, mesaID })
			const seleccionado = { usuarioID, mesaID }
			const cierre = this.cierresSeleccionados
			const incluido = this._.find(cierre, ['mesaID', mesaID])
			if (!incluido || this._.isEmpty(incluido)) {
				console.log('No esta incluido')
				cierre.push(seleccionado)
				return
			}
			if (incluido.mesaID === mesaID && incluido.usuarioID === usuarioID) { console.log('Está incluido', incluido)
			 return}
			else {
				const index = this._.findIndex(cierre, { mesaID })
				console.log('index', index)
				const eliminado = cierre.slice(index + 1)
				const nuevoscierresSeleccionados = eliminado.push(seleccionado)
				this.cierresSeleccionados = nuevoscierresSeleccionados
				
				console.log('eliminado', eliminado)
				console.log('eliminado-cierre', cierre)
			}
			console.log('cierresSeleccionados', this.cierresSeleccionados)
			
		},
		verActa (url) {
			this.actaURL = url
			this.visible = !this.visible
		},
		handleOk (e) {
			console.log(e);
			this.visible = false;
		},

		 
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
			// width: 100%

			.mesa
				border: 1px dotted rgba(0, 0, 0, .5)
				border-radius: 10px
				margin: 1em 0
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
				.tabla
					border-top: 1px solid rgba(0, 0, 0, .4)
					// &:nth-child(1)
					// 	border-top: 3px solid green 
						
				.contenedorGrupo
					// padding: .2em 0

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
				
.modal
	.contenido
		img
			width: 100%
			padding-top: 1em

	
</style>
