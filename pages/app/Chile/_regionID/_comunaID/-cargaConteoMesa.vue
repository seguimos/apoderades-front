<template lang="pug">
.rootConteo(v-if="local")
	slot(v-bind:abrir="()=>(mostrarCargador = true)" maskClosable="false")
		a-button.w100(@click="()=>(mostrarCargador = true)") Cargar cierre de mesa

	a-modal(v-model="mostrarCargador" centered @cancel="mostrarCargador = false")
		div(slot="title")
			.local {{local.nombre}}
			h2.titulo.my05rem Mesa {{mesa.nombre}}
			.subtitulo Conteo de votos 



		.conteosDeVotos(v-if="hayConteos && !reescritura")
			.conteo.p1em(v-for="(conteo, usuarioID) in mesa.conteos")
				.flex.jcsb.w100
					.votos.f00
						.item
							.nombre Boric
							.valor() {{conteo.votos.Boric}}
						.item
							.nombre Kast
							.valor() {{conteo.votos.Kast}}
						.item
							.nombre blancos
							.valor() {{conteo.votos.blancos}}
						.item
							.nombre nulos
							.valor() {{conteo.votos.nulos}}

				.pt1em.flex.aic.jcsa
					.acta.flex.ffcn.jcc.aic
						.fotoActa(:style="`background-image: url('${conteo.votos.actaURL}')`")
						a.linkFoto.db.mt05rem(:href="conteo.votos.actaURL" target="_blank") 
							a-button.db.pointerNone Ver acta
					.subidor.pl1em(v-for="apoderade in [_.get($store.state.apoderades, [usuarioID])]")
						.apoderade(v-if="apoderade") 
							.texto Conteo cargado por 
							.fwb {{apoderade.nombre}} {{apoderade.apellido}}


		.conteoDeVotos(v-else)
			a-form-model(
				ref="formulario",
				:model="formulario"
				:rules="validaCierre")

				a-form-model-item.linea(prop="Boric")
					.flex.aic
						.etiqueta G. Boric
						.f11.flex.aic.jcsa.ml1em
							a-input-number.input(size="large" :default='0' :min="0" v-model="formulario.Boric")
							a-button.restar(size="large" type="danger" icon="minus" @click="restar('Boric')")
							a-button.sumar(size="large" type='primary' icon="plus" @click="sumar('Boric')")

				a-form-model-item.linea(prop="Kast")
					.flex.aic
						.etiqueta J.A. Kast
						.f11.flex.aic.jcsa.ml1em
							a-input-number.input(size="large" :default='0' :min="0" v-model="formulario.Kast")
							a-button.restar(size="large" type="danger" icon="minus" @click="restar('Kast')")
							a-button.sumar(size="large" type='primary' icon="plus" @click="sumar('Kast')")

				a-form-model-item.linea(prop="blancos")
					.flex.aic
						.etiqueta Blancos
						.f11.flex.aic.jcsa.ml1em
							a-input-number.input(size="large" :default='0' :min="0" v-model="formulario.blancos")
							a-button.restar(size="large" type="danger" icon="minus" @click="restar('blancos')")
							a-button.sumar(size="large" type='primary' icon="plus" @click="sumar('blancos')")

				a-form-model-item.linea(prop="nulos")
					.flex.aic
						.etiqueta Nulos
						.f11.flex.aic.jcsa.ml1em
							a-input-number.input(size="large" :default='0' :min="0" v-model="formulario.nulos")
							a-button.restar(size="large" type="danger" icon="minus" @click="restar('nulos')")
							a-button.sumar(size="large" type='primary' icon="plus" @click="sumar('nulos')")

				a-form-model-item.linea.mt1rem(prop="actaURL")
					//- a-input.input(type='text' v-model="formulario.actaURL")
					.actaCierre.mt1rem
						CargaImagenS3.zonaCarga.mt-xs(:altura="900" :anchura="600"
							:modificandoAvatar="obteniendoURLFirmada"
							ref="cargadorImagen"
							value="PMprensa"
							:firmarCarga="firmarCargaActa"
							@subido="guardarUrl($event)")
							.interior(slot-scope="{ value, cargar }")
								a-button.cambioImagen.ha.py05em.px1em(:ghost="!!formulario.actaURL" :class="{verde: formulario.actaURL}" size="large" @click="cargar")
									.flex.ffcn.jcc.aic.tac(v-if="!formulario.actaURL") 
										.icono.fz2em 📷
										.texto Cargar acta de cierre
									.flex.ffcn.jcc.aic.tac(v-else)
										.icono.fz2em 📄
										.texto Acta cargada correctamente

		.footer(slot="footer")
			div(v-if="hayConteos && !reescritura")
				a-button.w100.db.ha.p05em(type="danger" ghost size="large" @click="reescritura = true") 
					.fwn Hay un error y 
					.fwb quiero subir otro conteo

			div(v-else-if="hayConteos")
				a-button.w100.db.ha.p05em(type="danger" size="large" @click="enviarFormulario") 
					.fwn Enviar otro cierre de mesa 
					.fwb de todos modos

			div(v-else)
				a-button.w100.db(type="primary" size="large" @click="enviarFormulario") Enviar cierre de mesa

			a-button.w100.db.mt1em(type=danger @click="mostrarCargador = false") Salir


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

			obteniendoURLFirmada: null,
			urlFirmada: null,

			reescritura: false
		}
	},
	
	computed: {
		regionID () { return this.local.regionID },
		localID () { return this.local.localID },
		validaCierre () {
			console.log("validaCierre")
			return { 
				Boric: [{ type: "number", message: 'Voto inválido', min: 0, trigger: 'change', required: true }],
				Kast: [{ type: "number", message: 'Voto inválido', min: 0, trigger: 'change', required: true }],
				blancos: [{ type: "number", message: 'Voto inválido', min: 0, trigger: 'change', required: true }],
				nulos: [{ type: "number", message: 'Voto inválido', min: 0, trigger: 'change', required: true }],
				actaURL: [{ type: "url", message: 'Debes subir un acta de cierre', trigger: 'change', required: true }],
			}
		},
		hayConteos () {
			return !this._.isEmpty(this.mesa.conteos)
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
			this.obteniendoURLFirmada = true
			const url = await this.$cuentaBack.firmarCargaActa({regionID, comunaID, localID, mesaID})
			this.urlFirmada = url
			console.log('urlFirmada', url)

			this.obteniendoURLFirmada = false
			return url
		},

		guardarUrl (url) {
			console.log('guardarUrl', url)
			url = url.replace('s3.amazonaws.com/', '')
			console.log('guardarUrl', url)
			this.formulario.actaURL = url
			this.$refs.cargadorImagen.$emit('guardado')
			this.$refs.formulario.validate()
		},
		enviarFormulario () {
			const reescritura = !!this.reescritura
			console.log("enviarFormulario", this.formulario)
			this.$refs.formulario.validate(async valid => {
				console.log('valid', valid)

				if (!valid) {
					console.log('no pasó validacion')
					return false
				}

				const { regionID, comunaID, localID } = this.local
				const mesaID = this.mesa.mesaID
				const votos = this.formulario
				const datos = {regionID, comunaID, localID, mesaID, votos}
				if (reescritura) datos.reescritura = reescritura
				
				const enviado = await this.$cuentaBack.guardarVotos(datos)

				if (enviado.ok === 0) {
					if (enviado.error === 'ya tiene conteo') {
						this.$emit('yaTieneConteo')
						return
					}
					return
				} 
				this.$message.success('Conteo guardado')
				this.$emit('conteoGuardado')
				this.mostrarCargador = false
			})	
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
			.ant-form-explain
				text-align: center
				margin-top: 0.2em
				margin-bottom: 0.5em
			.etiqueta
				flex: 100px 0 0
				text-align: right
				margin-right: 1rem
				font-size: 1.4em
				+fwb
			.ant-btn
				&.sumar
					background-color: $azul1
					border-color: darken($azul1, 5%)
				&.restar
					background-color: $azul2
					border-color: darken($azul2, 5%)
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



.ant-modal-root::v-deep
	.conteosDeVotos

		.conteo
			+ .conteo
				margin-top: 1em
			.votos
				display: flex
				align-items: center
				.item
					margin-left: 1em
					&:first
						margin-left: 0
					.nombre	
						+fwb
						text-transform: uppercase
					.valor
						text-align: center
			.acta
				.fotoActa
					+bgcov
					width: .66667em
					height: 1em
					font-size: 3em
					background-color: #eee
				.linkFoto
					margin-left: 1em





</style>
