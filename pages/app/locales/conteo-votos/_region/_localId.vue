<template lang="pug">
.rootConteo
	.contenido
		.conteoDeVotos
			.titulo Conteo de votos
			a-form-model.suscribirse(
				ref="formulario",
				:model="formulario",
				:rules="validaCierre"
			)
				.grupo 
					.tipo Selecciona una mesa:
					a-form-model-item(has-feedback, prop="mesaid")
						a-select.select(placeholder="Selecciona una mesa" @select="seleccionarMesa")
							a-select-option(v-for="mesa in local.mesas" :key="mesa.id" :value="mesa.id") {{ mesa.	mesa}}
				.grupo2(v-if="formulario.mesaid")
					.grupo
						.tipo Gabriel Boric:
						a-form-model-item(has-feedback, prop="boric")
							a-input-number.input(placeholder='N° Votos Boric', type='number' v-model="formulario.Boric")
					.grupo
						.tipo Jose Antonio Kast:
						a-form-model-item(has-feedback, prop="kast")
							a-input-number.input(placeholder='N° Votos Kast', type='number' v-model="formulario.Kast")
					.grupo
						.tipo Blancos:
						a-form-model-item(has-feedback, prop="blancos")
							a-input-number.input(placeholder='N° Blancos', type='number' v-model="formulario.blancos")
					.grupo
						.tipo Nulos:
						a-form-model-item(has-feedback, prop="nulos")
							a-input-number.input(placeholder='N° Nulos', type='number' v-model="formulario.nulos")
					.grupo
						a-form-model-item(has-feedback, prop="actaURL")
							//- a-input.input(type='text' v-model="formulario.actaURL")
							.actaCierre
								cargaImagenS3.zonaCarga.mt-xs(:altura="900" :anchura="600"
								ref="cargadorImagen"
								:archivo="`actasDeCierre/region-${region}/local-${local.nombre}/local-${formulario.id}.	jpg`"
								value="PMprensa"
								:firmarCarga="firmarCarga"
								:modificandoAvatar="modificandoAvatar"
								@subido="guardarUrl($event)")
								.interior(slot-scope="{ value, cargar }")
									a-button.cambioImagen(@click="cargar" :disabled="bloquearBoton" title="")
										div(v-if="!bloquearBoton") Cargar acta de cierre
										div(v-else) Acta cargada correctamente

					.contenedorBoton
						.boton(@click="enviarFormulario") Enviar cierre de mesa
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
				Boric: null,
				Kast: null,
				blancos: null,
				nulos: null,
				actaURL: null
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
		validaCierre () {
			console.log("validaCierre")
			return { 
				mesaid: [{ type: "number", message: 'mesa inválido', trigger: 'blur', required: true }],
				Boric: [{ type: "number", message: 'Voto inválido', min: 0, trigger: 'blur', required: true }],
				Kast: [{ type: "number", message: 'Voto inválido', min: 0, trigger: 'blur', required: true }],
				blancos: [{ type: "number", message: 'Voto inválido', min: 0, trigger: 'blur', required: true }],
				nulos: [{ type: "number", message: 'Voto inválido', min: 0, trigger: 'blur', required: true }],
				actaURL: [{ type: "url", message: 'Debes subir un acta de cierre', trigger: 'blur', required: true }],
			}
		}
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
		guardarUrl (url) {
			this.formulario.actaURL = url
			this.bloquearBoton = true
			this.$refs.cargadorImagen.$emit('guardado')
			console.log('guardarUrl', this.formulario.actaURL)
		},
		enviarFormulario () {
			console.log("enviarFormulario", this.formulario)
			this.$refs.formulario.validate(async valid => {
				console.log('valid', valid)

				if (!valid) {
					console.log('no pasó validacion')
					return false
				}
				const region = this.$route.params.region
				const localID = this.$route.params.localId
				const conteo = this.formulario
				const votos = {
					Boric: Number(conteo.Boric),
					Kast: Number(conteo.Kast),
					blancos: Number(conteo.blancos),
					nulos: Number(conteo.nulos),
					actaURL: conteo.actaURL
				}
				console.log(region, localID, votos)
				const enviado = await this.$cuentaBack.guardarVotos(region, localID, votos, this.formulario.mesaid)
				console.log('enviado', enviado)
			})

			
		}
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
		.contenedorBoton
			display: flex
			justify-content: center
			.boton
				background-color: #fff
				color: rgba(0, 0, 0, .5)
				border: 1px solid rgba(0, 0, 0, .5)
</style>
