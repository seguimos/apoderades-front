<template lang="pug">
.root
	h1 Inscripción apoderado

	a-form-model.suscribirse(
		ref="formulario",
		:model="formulario",
		:rules="rules",
		:label-col="{ span: 4 }",
		:wrapper-col="{ span: 16 }"
	)
		a-form-model-item(has-feedback, prop="rut" label="RUT")
			a-input.input(
				v-model="formulario.rut",
				type="nombre",
				placeholder="10.000.000-0"
			)

		a-form-model-item(has-feedback, prop="nombre" label="Nombres")
			a-input.input(
				v-model="formulario.nombre",
				type="nombre",
				placeholder="Gabriel"
			)
		a-form-model-item(has-feedback, prop="apellido" label="Apellidos")
			a-input.input(
				v-model="formulario.apellido",
				type="apellido",
				placeholder="Boric Font"
			)

		a-form-model-item(has-feedback, prop="email" label="Correo")
			a-input.input(
				v-model="formulario.email",
				type="email",
				placeholder="gabriel@lesapoderades.cl"
			)

		a-form-model-item(has-feedback, prop="telefono" label="Teléfono")
			a-input.input(
				v-model="formulario.telefono",
				type="tel",
				placeholder="+56 x xxxx xxxx"
			)

		//a-form-model-item(has-feedback, label="Rol")
			a-select.input(v-model="formulario.rol" placeholder="Elige un Rol...")
				a-select-option(value="COM") Comando
				a-select-option(value="COO") Coordinador
				a-select-option(value="AG") Apoderado General
				a-select-option(value="AM") Apoderado de mesa

		a-form-model-item(
			v-if="formulario.rol",
			has-feedback,
			prop="region",
			label="Región"
		)
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
				v-model="formulario.comuna",
				placeholder="Comuna",
				@change="handleComuna",
				@select="buscarLocales"
			)
				a-select-option(
					v-for="comuna in comunas",
					:key="comuna.label",
					:value="comuna.codigo"
				) {{ comuna.label }}

		a-form-model-item(v-if="locales" has-feedback, prop="local" label="Local")
			a-select.input(
				show-search="",
				v-model="formulario.local",
				type="local",
				placeholder="Local de Votación",
				@change="handleLocal"
			)
				a-select-option(
					v-for="local in locales",
					:key="local._id",
					:value="local.nombre"
				) {{ local.nombre }}

		a-form-model-item
			a-button.w100.bpStyle.verde(type="primary" @click="submitForm('formulario')") VALIDAR DATOS
</template>

<script>
import isEmail from 'validator/lib/isEmail'
import { phone } from 'phone'
import { validate, format, clean } from 'rut.js'
import regionesComunas from '../../../regiones/regioneschile'

export default {
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
		return {
			formulario: {
				nombre: 'ramon',
				apellido: 'ramas',
				rut: '102222222',
				email: 'hhg@gmail.com',
				telefono: '+56982061888',

				// rol: undefined,

				comunaCodigo: undefined,
				region: undefined,
				distrito: undefined,
				territorioAsignado: undefined,
				localAsignado: undefined
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
			visible: false,
			tyc: false,
			regionseleccionada: null,
			comunaSeleccionada: null,
			procesado: null,
			locales: null
		}
	},
	computed: {
		regiones () {
			const re = regionesComunas.regionesComunas
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
	methods: {
		async buscarLocales (value) {
			console.log('this.formulario', this.formulario)
			const locales = await this.$cuentaBack.localesXComuna({
				region: this.formulario.region,
				comunaCodigo: value
			})
			console.log('buscarLocales', locales)
			this.locales = locales.locales
		},
		submitForm (formName) {
			// console.log(this.formulario)
			this.$refs[formName].validate(valid => {
				if (valid) {
					this.suscribirse()
					// this.$gtm.push({ event: 'Registro_mailing', nombre: 'Registro en Mailchimp', estado: 'completo' })
				} else {
					console.log('error submit!!')
					return false
				}
			})
		},

		handleRegion (value) {
			console.log(`Selectedd: ${value}`)
			this.regionseleccionada = value
			this.formulario.region = value
			console.log('seleccion', this.regionseleccionada)
		},
		handleComuna (value) {
			console.log(`Selected: ${value}`)
			this.comunaSeleccionada = value
			this.formulario.comunaCodigo = value
			console.log('distri', this.distrito)
		},
		handleLocal (value) {
			console.log(`Selected: ${value}`)
			this.local = value
			this.formulario.localAsignado = value
		},
		async suscribirse () {
			console.log('formulari crear Usuario', this.formulario)
			const apoderade = this._.pick(this.formulario, 'nombre apellido email telefono rut region comunaCodigo localAsignado'.split(' '))
			const creado = await this.$cuentaBack.crearApoderade(apoderade)
			console.log(creado)
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
.suscribirme
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
