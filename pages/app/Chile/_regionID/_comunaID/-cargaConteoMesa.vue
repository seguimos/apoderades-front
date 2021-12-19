<template lang="pug">
.rootConteo(v-if="local")
	slot
		a-button(@click="mostrarCargador = true") Cargar cierre de mesa
	a-modal(v-model="mostrarCargador" centered)
		div(slot="title")
			.local {{local.nombre}}
			h2.titulo.my05rem Mesa {{mesa.nombre}}
			.subtitulo Conteo de votos 

			.warning(v-if="aceptaIngresarNuevoCierre") Estas editando los #[br]resultados de esta mesa
		.conteoDeVotos
			a-form-model(
				ref="formulario",
				:model="formulario"
				:rules="validaCierre")

				a-form-model-item.linea(prop="Boric")
					.flex.aic
						.etiqueta G. Boric
						.f11.flex.aic.jcsa.ml1em
							a-input-number.input(size="large" :default='0' :min="0" v-model="formulario.Boric")
							a-button(size="large" type="danger" icon="minus" @click="restar('Boric')")
							a-button(size="large" type='primary' icon="plus" @click="sumar('Boric')")

				a-form-model-item.linea(prop="Kast")
					.flex.aic
						.etiqueta J.A. Kast
						.f11.flex.aic.jcsa.ml1em
							a-input-number.input(size="large" :default='0' :min="0" v-model="formulario.Kast")
							a-button(size="large" type="danger" icon="minus" @click="restar('Kast')")
							a-button(size="large" type='primary' icon="plus" @click="sumar('Kast')")

				a-form-model-item.linea(prop="blancos")
					.flex.aic
						.etiqueta Blancos
						.f11.flex.aic.jcsa.ml1em
							a-input-number.input(size="large" :default='0' :min="0" v-model="formulario.blancos")
							a-button(size="large" type="danger" icon="minus" @click="restar('blancos')")
							a-button(size="large" type='primary' icon="plus" @click="sumar('blancos')")

				a-form-model-item.linea(prop="nulos")
					.flex.aic
						.etiqueta Nulos
						.f11.flex.aic.jcsa.ml1em
							a-input-number.input(size="large" :default='0' :min="0" v-model="formulario.nulos")
							a-button(size="large" type="danger" icon="minus" @click="restar('nulos')")
							a-button(size="large" type='primary' icon="plus" @click="sumar('nulos')")

				a-form-model-item.linea.mt1rem(prop="actaURL")
					//- a-input.input(type='text' v-model="formulario.actaURL")
					.actaCierre.mt1rem
						CargaImagenS3.zonaCarga.mt-xs(:altura="900" :anchura="600"
							ref="cargadorImagen"
							:archivo="`actasDeCierre/region-${region}/local-${local.nombre}/local-${formulario.id}.	jpg`"
							value="PMprensa"
							:firmarCarga="firmarCargaActa"
							:modificandoAvatar="modificandoAvatar"
							@subido="guardarUrl($event)")
							.interior(slot-scope="{ value, cargar }")
								a-button.cambioImagen.ha.py05em.px1em(size="large" @click="cargar" :disabled="bloquearBoton")
									.flex.ffcn.jcc.aic.tac(v-if="!bloquearBoton") 
										.icono.fz2em 📷
										.texto Cargar acta de cierre
									.flex.ffcn.jcc.aic.tac(v-else)
										.icono.fz2em 📄
										.texto Acta cargada correctamente

		.footer.p1em(slot="footer")
			a-button.w100(size="large" @click="enviarFormulario") Enviar cierre de mesa


	a-modal.modal(:visible="abrirModal" :confirm-loading="confirmLoading" @ok="handleOk" @cancel="handleCancel")
		.footer(slot='footer')
			div
				a-button.w100(type='primary' @click='handleCancel') CERRAR
			br
			div
				a-button.w100(type='danger' ghost @click='siQuieroEditar') EDITAR DE TODOS MODOS

		.contenidoModal
			.titulo La mesa que consultas tiene {{ yaSeCerroLen }} cierre/s.
			.contenedorCajaCierre
				.contenedorMesas
					.mesa(v-for="mesa in yaSeCerro")
						.titulo Mesa {{ mesa.mesa }}
							.contenedorGrupo
								.grupomesa(v-for="(conteo, index) in mesa.conteo")
									.conteo
										.lado
											.votos Boric 
												.contador {{ conteo.votos.Boric }}
											.votos Kast 
												.contador {{ conteo.votos.Kast }}
										.lado
											.votos nulos 
												.contador {{ conteo.votos.nulos }}
											.votos blancos
												.contador {{ conteo.votos.blancos }}
									.acta Acta de Cierre: #[a.nVotos(:href="conteo.votos.actaURL" 	target="_blank") Ver acta]
									.fecha Fecha: {{ conteo.fecha}}
			.titulo.warning Si quieres continuar e ingresar otro cierre a esta mesa da click en EDITAR

</template>
<script>
export default {
	props: {
		local: {
			required: true,
			type: Object
		},
		mesa: {
			required: true,
			type: Object
		}
	},
	data () {
		return {
			mostrarCargador: null,

			layout: {
				labelCol: { span: 3 },
				wrapperCol: { span: 4 },
			},
		
			formulario: {
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
				Boric: [{ type: "number", message: 'Voto inválido', min: 0, trigger: 'change', required: true }],
				Kast: [{ type: "number", message: 'Voto inválido', min: 0, trigger: 'change', required: true }],
				blancos: [{ type: "number", message: 'Voto inválido', min: 0, trigger: 'change', required: true }],
				nulos: [{ type: "number", message: 'Voto inválido', min: 0, trigger: 'change', required: true }],
				actaURL: [{ type: "url", message: 'Debes subir un acta de cierre', trigger: 'change', required: true }],
			}
		}
	},
	methods: {
		sumar (receptor) {
			if (!('Boric Kast blancos nulos'.split(' ')).includes(receptor)) return
			const actual = this.formulario[receptor] || 0
			const nuevo = actual + 1
			this.formulario[receptor] = nuevo
		},
		restar (receptor) {
			if (!('Boric Kast blancos nulos'.split(' ')).includes(receptor)) return
			const actual = this.formulario[receptor] || 0
			const nuevo = ((actual - 1) >= 0) ? (actual - 1) : 0
			this.formulario[receptor] = nuevo
		},
		async firmarCargaActa () {
			const { regionID, comunaID, localID } = this.local
			const mesaID = this.mesa.mesaID
			const url = await this.$cuentaBack.firmarCargaActa({regionID, comunaID, localID, mesaID})
			console.log('urlFirmada', url)

			this.modificandoAvatar = false
			return url
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
@import '@style/vars'
.rootConteo
	.contenido
		display: flex
		width: 100%
		flex-flow: column nowrap
		align-items: center
		
		.contenedorBoton
			display: flex
			justify-content: center
			.boton
				background-color: #fff
				color: rgba(0, 0, 0, .5)
				border: 1px solid rgba(0, 0, 0, .5)

.ant-modal-root::v-deep
	.conteoDeVotos
		.linea
			// border: 1px solid green
			.etiqueta
				flex: 100px 0 0
				text-align: right
				margin-right: 1rem
				font-size: 1.4em
				
				+fwb	
			.input
				width: 70px
				// border: 1px solid red
				input
					text-align: center
					font-size: 1.4em
					color: black
		.actaCierre
			// border: 1px solid cyan
			display: flex
			justify-content: center
			.cambioImagen



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
		.contenedorMesas
			display: flex
			flex-flow: row wrap
			width: 100%
			.mesa
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
					justify-content: center
				.grupomesa
					border: 1px solid rgba(0, 0, 0, .5)
					border-radius: 10px
					padding: .3em
					margin: 1em
					width: 250px
					.conteo
						display: flex
						flex-flow: column nowrap
						align-items: center
						// width: 200px
						padding: 0 1em
						.lado
							display: flex
							flex-flow: row nowrap
							justify-content: space-evenly
							width: 100%
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

		.contenedorBoton
			display: flex
			padding-bottom: 1em
			.boton
				text-align: center
				background-color: #fff
				color: rgba(0, 0, 0, 0.5)
				border: 1px solid rgba(0, 0, 0, 0.5)

</style>
