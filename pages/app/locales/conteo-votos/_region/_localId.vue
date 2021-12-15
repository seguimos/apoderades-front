<template lang="pug">
.rootConteo
	.contenido
		.conteoDeVotos
			.titulo Conteo de votos
			.grupo 
				.tipo Selecciona una mesa:
				a-select.select(placeholder="mesas" @select="seleccionarMesa")
					a-select-option(v-for="mesa in local.mesas" :key="mesa.id" :value="mesa.id") {{ mesa.mesa}}
			.grupo2(v-if="formulario.mesaid")
				.grupo
					.tipo Gabriel Boric:
					a-input.input(placeholder='N° Votos Boric', type='num' v-model="formulario.votos.Boric")
				.grupo
					.tipo Jose Antonio Kast:
					a-input.input(placeholder='N° Votos Kast', type='num' v-model="formulario.votos.Kast")
				.grupo
					.tipo Blancos:
					a-input.input(placeholder='N° Blancos', type='num' v-model="formulario.votos.blancos")
				.grupo
					.tipo Nulos:
					a-input.input(placeholder='N° Nulos', type='num' v-model="formulario.votos.nulos")
				.actaCierre
					cargaImagenS3.zonaCarga.mt-xs(:altura="900" :anchura="600"
					ref="cargadorImagen"
					:archivo="`actasDeCierre/region-${region}/local-${local.nombre}/local-${formulario.id}.jpg`"
					value="PMprensa"
					:firmarCarga="firmarCarga"
					:modificandoAvatar="modificandoAvatar"
					@subido="guardarUrl($event)")
					.interior(slot-scope="{ value, cargar }")
						a-button.cambioImagen(@click="cargar" :disabled="bloquearBoton" title="")
							div(v-if="!bloquearBoton") Cargar acta de cierre
							div(v-else) Acta cargada correctamente
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
			formulario: {
				mesaid: null,
				votos: {
					Boric: null,
					Kast: null,
					blancos: null,
					nulos: null,
				}
			},
			abrirModalReportes: null,
			modificandoAvatar: null
		}
	},
	
	computed: {
		region() {
			return this.$route.params.region
		},
		localId () {
			return this.$route.params.localId
		},
	},
	mounted () {
		this.getLocal()
	},
	methods: {
		seleccionarMesa (v) {
			this.formulario.mesaid  = v
		},
		async firmarCarga () {
			const url = await this.$cuentBack.firmarCarga({region: this.region, nombre: this.local.nombre, mesaid: this.formulario.mesaid})
			console.log('urlFirmada', url)
			// const archivo = `region-${this.region}-local-${this.local.nombre}-mesa-${this.formulario.mesaid}`
			// this.modificandoAvatar = true
			// const url = await axios({
			// 	method: 'get',
			// 	url: `${this.$cuentaBack.backURL}/signedUrl/${archivo}`
			// })
			// 	.then(r => r.data)
			// 	.catch(e => console.error('fallo respuesta', e))

			this.modificandoAvatar = false
			return url
		},

		async getLocal () {
			const region = this.$route.params.region
			const localId = this.$route.params.localId
			const response = await this.$cuentaBack.obtenerLocal({ region, localId })
			this.local.nombre = response.local.nombre
			this.local.apoderadoGeneral = 'Gabriel Boric'
			this.local.mesas = Object.values(response.local.mesas)
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
			.actaCierre
				display: flex
				justify-content: center
				padding: 1em
</style>
