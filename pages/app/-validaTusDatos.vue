<template lang="pug">
.root(v-if="formulario")
	h1 Valida tus datos de inscripcion

	a-form-model.enviarFormulario(
		ref="formulario",
		:model="formulario",
		:rules="rules",
		:label-col="{ span: 4 }",
		:wrapper-col="{ span: 16 }"
	)
		a-form-model-item(has-feedback, prop="rut", label="RUT")
			a-input.input(
				v-model="formulario.rut",
				type="rut",
				placeholder="10.000.000-0"
			)

		a-form-model-item(has-feedback, prop="nombre", label="Nombres")
			a-input.input(
				v-model="formulario.nombre",
				type="nombre",
				placeholder="Gabriel"
			)
		a-form-model-item(has-feedback, prop="apellido", label="Apellidos")
			a-input.input(
				v-model="formulario.apellido",
				type="apellido",
				placeholder="Boric Font"
			)

		a-form-model-item(has-feedback, prop="email", label="Correo")
			a-input.input(
				v-model="formulario.email",
				type="email",
				placeholder="gabriel@lesapoderades.cl"
			)

		a-form-model-item(has-feedback, prop="telefono", label="Teléfono")
			a-input.input(
				v-model="formulario.telefono",
				type="tel",
				placeholder="+56 x xxxx xxxx"
			)

		a-form-model-item(has-feedback, prop="region", label="Región")
			a-select.input(
				v-model="formulario.region",
				@change="handleRegion",
				placeholder="Región"
			)
				a-select-option(
					v-for="region in regiones",
					:key="region.label",
					:value="region.reg"
				) {{ region.label }}

		a-form-model-item(
			v-if="regionseleccionada",
			has-feedback,
			prop="comuna",
			label="Comuna"
		)
			a-select.input(
				placeholder="Comuna",
				@change="handleComuna",
				@select="buscarLocales"
			)
				a-select-option(
					v-for="comuna in comunas",
					:key="comuna.codigo",
					:value="comuna.codigo"
				) {{ comuna.label }}

		a-form-model-item(
			v-if="comunaSeleccionada",
			has-feedback,
			prop="local",
			label="Local"
		)
			a-select.input(
				show-search="",
				v-model="formulario.localID",
				type="local",
				placeholder="Local de Votación",
				@change="handleLocal"
			)
				a-select-option(
					v-for="local in locales",
					:key="local._id",
					:value="local._id"
				) {{ local.nombre }}

		//- a-form-model-item(
		//- 	label="¿Estás disponible para otros locales cercanos?",
		//- 	:label-col="{ span: 18 }",
		//- 	:wrapper-col="{ span: 2 }"
		//- )
		//- 	a-switch(v-model="formulario.disponibleParaOtrosLocales")
		a-form-model-item.contenedorbtn(:wrapper-col="{ span: 14, offset: 2 }")
			a-button.suscribirme(type="primary", @click="submitForm('formulario')")
				| VALIDAR DATOS

	a-modal.modal(
		v-model="visible",
		title="Muchas gracias !!",
		centered,
		@ok="handleOk",
		:footer="null"
	)
		.procesando(v-if="!procesado")
			a-spin(size="large")
		.procusandoCompleto(v-if="procesado")
			p Pronto recibiras noticias
</template>

<script>
import isEmail from 'validator/lib/isEmail'
import { phone } from 'phone'
import { validate, format, clean } from 'rut.js'
import {regionesYSusComunas} from '@lib/regioneschile'

export default {
	components: {
		VNodes: {
			functional: true,
			render: (h, ctx) => ctx.props.vnodes
		}
	},
	data () {
		// let checkPending
		const validaTelefono = (rule, value, callback) => {
			if (!value) {
				return callback(new Error('Ingresa tu telefono'))
			}
			if (!phone(value).isValid) {
				console.log('telefono', phone(value))
				callback(new Error('Utiliza formato +56 xxxxxxxxx'))
			} else {
				console.log('telefono ok', phone(value))
				callback()
			}
		}
		const validaNombre = (rule, value, callback) => {
			if (!value) {
				callback(new Error('Ingresa tu nombre'))
			} else {
				callback()
			}
		}
		const validaEmail = (rule, value, callback) => {
			if (!isEmail(value)) {
				callback(new Error('Debes ingresar un E mail valido'))
			} else {
				callback()
			}
		}
		const validaRegion = (rule, value, callback) => {
			if (this._.isEmpty(value)) {
				callback(new Error('Ingresa tu region'))
			} else {
				callback()
			}
		}
		const validaComuna = (rule, value, callback) => {
			if (value === '') {
				callback(new Error('Ingresa tu region'))
			} else {
				callback()
			}
		}
		const validaRut = (rule, value, callback) => {
			if (!value) {
				callback(new Error('Ingresa tu rut'))
			}
			if (value.length < 8) {
				callback(new Error('Ingresa un rut valido'))
			}

			if (value) {
				const limpio = clean(value)
				const rutformateado = format(limpio)
				const validado = validate(rutformateado)
				console.log(validado)
				if (validado) {
					callback()
				}
				if (!validado) {
					callback(new Error('Ingresa un rut valido'))
				}
			} else {
				callback(new Error('ingresa un rut valido'))
			}
		}
		const { nombre, apellido, rut, email, telefono } = this.$usuario
		return {
			formulario: {
				nombre,
				apellido,
				rut,
				email,
				telefono,

				// datos desde back
				comunaCodigo: this._.get(this.$apoderade, [
					'territorioPreferencia',
					'comunaCodigo'
				]),
				region: this._.get(this.$apoderade, [
					'territorioPreferencia',
					'region'
				]),
				disponibleParaOtrosLocales: false,
				localID: this._.get(this.$apoderade, [
					'territorioPreferencia',
					'localId'
				])
			},
			rules: {
				nombre: [{ validator: validaNombre, trigger: 'change' }],
				apellido: [{ validator: validaNombre, trigger: 'change' }],
				email: [{ validator: validaEmail, trigger: 'change' }],
				telefono: [{ validator: validaTelefono, trigger: 'change' }],
				region: [{ validator: validaRegion }],
				comuna: [{ validator: validaComuna, trigger: 'change' }],
				rut: [{ validator: validaRut, trigger: 'change' }]
			},
			layout: {
				labelCol: { span: 4 },
				wrapperCol: { span: 14 }
			},

			locales: [],
			otroLocalVisible: false,
			visible: false,
			tyc: false,
			regionseleccionada: null,
			comunaSeleccionada: null,
			procesado: null
			// regiones: this.re
		}
	},
	computed: {
		regiones () {
			const re = regionesYSusComunas
			// const arrayregiones = this._.map(re, 'label')
			return re
		},
		comunas () {
			const re = this.regiones
			const com = this._.filter(re, ['reg', this.regionseleccionada])
			const comunas = com[0].children
			if (this.regionseleccionada) {
				// console.log(this.regionseleccionada)
				// console.log('comunas', comunas)
				// console.log('formulario', this.formulario)
			}
			return comunas
		}
	},
	// mounted () {
	// 	if (this.$apoderade.fechaValidacionDatos) {
	// 		this.$router.replace('/app/locales/resumenterritorial')
	// 	}
	// },
	methods: {
		rechazalos () {
			if (this.$apoderade.territorioPreferencia) {
				this.$router.replace('/app/locales/resumenterritorial')
			}
		},
		otroLocal () {
			this.otroLocalVisible = true
			console.log('otro!')
		},
		async buscarLocales () {
			console.log('this.formulario', this.formulario)
			const locales = await this.$cuentaBack.localesXComuna({
				region: this.formulario.region,
				comunaCodigo: this.formulario.comunaCodigo
			})
			console.log('buscarLocales', locales)
			this.locales = locales.locales
		},
		submitForm (formName) {
			this.$refs[formName].validate(async valid => {
				if (valid) {
					const territorioPreferencia = {
						region: this.formulario.region,
						comunaCodigo: this.formulario.comunaCodigo,
						localId: this.formulario.localID
					}
					const { nombre, apellido, rut, email, telefono } = this.formulario
					// const disponibleParaOtrosLocales =
					// 	this.formulario.disponibleParaOtrosLocales

					await this.$cuentaBack.autoValidarDatos({
						territorioPreferencia,
						nombre,
						apellido,
						rut,
						email,
						telefono
					})
					// this.$gtm.push({ event: 'Registro_mailing', nombre: 'Registro en Mailchimp', estado: 'completo' })
				} else {
					console.log('error submit!!')
					return false
				}
			})
		},

		handleRegion (value) {
			console.log(`Selectedd: ${value}`)
			this.comunaSeleccionada = null
			this.localID = null
			this.otroLocalVisible = false
			this.regionseleccionada = value
			console.log('seleccion', this.regionseleccionada)
		},
		handleComuna (value) {
			console.log(`Selected: ${value}`)
			this.local = null
			this.otroLocalVisible = false
			this.comunaSeleccionada = value
			console.log('distri', this.distrito)
			this.formulario.comunaCodigo = value
		},
		handleLocal (value) {
			console.log(`Selected: ${value}`)
			this.localID = value
		},
		showModal () {
			this.tyc = true
			// this.$gtm.push({ event: 'gtm.linkClick', hacia: 'terminos y condiciones' })
		},
		handleOk (e) {
			console.log(e)
			this.visible = false
			this.tyc = false
			this.procesado = false
		}
	}
}
</script>

<style lang="sass" scoped>
@import '@style/paleta'
@import '@style/utils'

.root
	margin: 10px 20px

.suscribirme
	width: 250px
	color: $petroleo1
	background-color: $verde3
	border-radius: 3px
	font-weight: 900
	font-size: 1.4em
.contenedorBoton
	text-align: center
	.votoExtranjero
		margin: 0 auto
		font-weight: 900
		font-size: 1.4em
		color: $petroleo1
		padding-top: .25em
		background-color: $verde3
</style>
