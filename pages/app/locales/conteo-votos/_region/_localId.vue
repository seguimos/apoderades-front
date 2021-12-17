<template lang="pug">
.rootConteo
	.contenido
		.conteoDeVotos
			.titulo Conteo de votos
			.warning(v-if="aceptaIngresarNuevoCierre") Estas editando los #[br]resultados de esta mesa
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
					.grupo.grupoActa
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
	a-modal.modal(:visible="abrirModal" :confirm-loading="confirmLoading" @ok="handleOk" @cancel="handleCancel")
		.footer(slot='footer')
			div
				a-button.w100(type='primary' @click='handleCancel') CERRAR
			br
			div
				a-button.w100(type='danger' ghost @click='siQuieroEditar') EDITAR DE TODOS MODOS
		.contenidoModal(v-if="mesaRecibida")
			.titulo La mesa que consultas tiene {{ mesaRecibidaLen }} cierre/s.
			.contenedorCajaCierre 
				.cajaCierre(v-for="conteo in mesaRecibida")
					.grupomesa.conteo
						.titulo Votos mesa
						.votos Gabriel Boric: #[span.nVotos {{ conteo.votos.Boric }}]
						.votos Jose Kast: #[span.nVotos {{ conteo.votos.Kast }}]
						.votos nulos: #[span.nVotos {{ conteo.votos.nulos }}]
						.votos blancos: #[span.nVotos {{ conteo.votos.blancos }}]
						.votos Acta de Cierre: #[a.nVotos(:href="conteo.votos.actaURL" target="_blank") Ver acta]
						.votos Fecha: {{ conteo.fecha}}
			.titulo.warning Si los resultados estan bien, por favor no subas otro cierre, si de todas maneras quieres continuar da click en EDITAR
			//.contenedorBoton
				.boton(@click="siQuieroEditar") QUIERO EDITAR EL CIERRE
		.contenidoModal(v-else)
			.titulo La mesa que consultas tiene {{ yaSeCerroLen }} cierre/s.
			.contenedorCajaCierre
				.cajaCierre(v-for="conteos in yaSeCerro")
					.grupomesa.conteo(v-for="cont in conteos.conteo")
						.titulo Votos mesa {{conteos.mesa}}
						.contendorVotos
							.votos.vot Gabriel Boric: #[span.nVotos {{ cont.votos.Boric }}]
							.votos.vot Jose Kast: #[span.nVotos {{ cont.votos.Kast }}]
							.votos.vot nulos: #[span.nVotos {{ cont.votos.nulos }}]
							.votos.vot blancos: #[span.nVotos {{ cont.votos.blancos }}]
						.votos Acta de Cierre: #[a.nVotos(:href="cont.votos.actaURL" target="_blank") Ver acta]
						.votos Fecha: #[span.nVotos {{ cont.fecha}}]
			.titulo.warning Si quieres continuar e ingresar otro cierre da click en EDITAR
			//.contenedorBoton
				.boton(@click="siQuieroEditar") QUIERO EDITAR EL CIERRE



	a-modal
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
		
			formulario: {
				mesaid: null,
				Boric: null,
				Kast: null,
				blancos: null,
				nulos: null,
				actaURL: null
			},

			mesaRecibida: null,
			votosMesa: null,
			aceptaIngresarNuevoCierre: null,
			mensajeError: null,
			confirmLoading: null,

			verActa: null,
			abrirModal: false,
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
		yaSeCerroLen () {
			return this.yaSeCerro.length
		},
		mesaRecibidaLen () {
			return this.mesaRecibida.length
		},
		yaSeCerro () {
			const seleccionada = this.formulario.mesaid
			const cerrada = this._.filter(this.local.mesasCerradas, {'id': seleccionada})
			const simple = this._.map(cerrada, c => {
				c.conteo = Object.values(c.conteo)
			})
			console.log('cierres', simple)

			if (cerrada === []) return
			return cerrada
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
		seleccionarMesa (mesaID) {
			this.formulario.mesaid  = mesaID

			const cerrada = this.yaSeCerro
			console.log('cerrada', cerrada)

			console.log('if del selecciona')
			if (!cerrada || this._.isEmpty(cerrada)) return null
			else {
				this.abrirModal = true
			}


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

			this.local.mesasCerradas = this._.filter(this.local.mesas, 'conteo')

			this.local.apoderados = response.local.apoderades.map(apo => ({
				...apo,
				nombre: `usuarioID: ${apo.usuarioID}`
			}))
		},
		guardarUrl (url) {
			this.formulario.actaURL = url
			this.bloquearBoton = true
			this.$refs.cargadorImagen.$emit('guardado')
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
				const enviado = await this.$cuentaBack.guardarVotos(region, localID, votos, this.formulario.mesaid, this.aceptaIngresarNuevoCierre)

				if (enviado.ok === 0) {
					this.mensajeError = this._.get(enviado, "yaContado.mensaje")
					const mesaRecibida = this._.get(enviado, "yaContado.mesaSeleccionada")
					this.mesaRecibida = Object.values(mesaRecibida)
					console.log('this.mesaRecibida', this.mesaRecibida)
					this.votosMesa = this._.get(this.mesaRecibida, "votos")

					this.abrirModal = true
				}
				else {
					this.aceptaIngresarNuevoCierre = null
				}
			})	
		},
		siQuieroEditar () {
			this.aceptaIngresarNuevoCierre = true
			this.handleOk()
		},
		handleOk (e) {
			this.confirmLoading = true;
			setTimeout(() => {
				this.abrirModal = false;
				this.confirmLoading = false;
			}, 300);
		},
		handleCancel (e) {
			this.abrirModal = false;
			this.aceptaIngresarNuevoCierre = false
			this.formulario.mesaid = undefined
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
			.warning
				color: rgba(255, 0, 0, .8)
				font-size: 1.1rem
				font-style: italic
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

.modal
	.contenidoModal
		display: flex
		flex-flow: column nowrap
		align-items: center
		width: 100%
		padding: 1em
		.titulo
			text-align: center
			font-size: 1.2rem
			padding-bottom: 1em
		.warning
			color: rgba(186, 0, 0, 1)
		.contenedorCajaCierre
			display: flex
			flex-flow: row wrap
			width: 100%
			justify-content: center
			padding-bottom: 2em
			.cajaCierre
				border: 1px solid rgba(0, 0, 0, 0.5)
				border-radius: 10px
				padding: 1em
				.grupomesa
					display: flex
					flex-flow: column nowrap
					align-items: center
				.contendorVotos
					width: 80%
					padding-bottom: 1em 
				.votos
					font-size: 1rem
					display: flex
					justify-content: space-between
					width: 100%
				.nVotos
					font-size: 1.1rem
					font-weight: 700

		.contenedorBoton
			display: flex
			padding-bottom: 1em
			.boton
				text-align: center
				background-color: #fff
				color: rgba(0, 0, 0, 0.5)
				border: 1px solid rgba(0, 0, 0, 0.5)

</style>
