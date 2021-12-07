<template lang="pug">
.rootParticipa
	.contenido
		.titulo Verificación de datos
		.texto Revisa que tus datos hayan sido registrados correctamente, y corrigelos en caso de ser necesario.
		.formulario
			a-form-model.suscribirse(
				ref="formulario",
				:model="formulario",
				:rules="rules"
			)
				a-form-model-item(has-feedback, label="Nombre", prop="nombre")
					a-input.input(
						v-model="formulario.nombre",
						type="nombre",
						placeholder="Gabriel"
					)
				a-form-model-item(has-feedback, label="Apellido", prop="apellido")
					a-input.input(
						v-model="formulario.apellido",
						type="apellido",
						placeholder="Boric"
					)
				a-form-model-item(has-feedback, label="Rut", prop="rut")
					a-input.input(v-model="formulario.rut", type="rut", placeholder="Rut")
				a-form-model-item(has-feedback, label="Correo", prop="email")
					a-input.input(
						v-model="formulario.email",
						type="email",
						placeholder="Email"
					)

				a-form-model-item(has-feedback, label="Teléfono", prop="telefono")
					a-input.input(
						v-model="formulario.telefono",
						type="tel",
						placeholder="+56 x xxxx xxxx"
					)

				.texto Dónde deseas participar como apoderado de mesa?
				a-form-model-item(has-feedback, label="Región", prop="region")
					a-select.input(
						v-model="formulario.region",
						@change="handleChange",
						placeholder="Región"
					)
						a-select-option(
							v-for="region in regiones",
							:key="region.numero",
							:value="region.nombre"
						) {{ region.nombre }}

				a-form-model-item(
					v-if="regionseleccionada",
					has-feedback="",
					label="Comuna",
					prop="comuna"
				)
					a-select.input(
						v-model="formulario.comuna",
						placeholder="Comuna",
						@change="handleComuna"
					)
						a-select-option(
							v-for="comuna in comunas",
							:key="comuna.codigo",
							:value="comuna.nombre"
						) {{ comuna.nombre }}

				a-form-model-item(
					v-if="comunaSeleccionada",
					has-feedback,
					label="Local de Votación de Preferencia",
					prop="local"
				)
					a-input.input(
						v-model="formulario.local",
						type="local",
						placeholder="Local de votación"
					)

				.contenedorBoton
					a-button(type="primary", @click="submitForm('formulario')")
						| VALIDAR DATOS
</template>

<script>
import isEmail from 'validator/lib/isEmail'
import { phone } from 'phone'
import { validate, format, clean } from 'rut.js'
import _ from 'lodash'
import regionesComunas from '../data/regionesComunas'

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
			if (_.isEmpty(value)) {
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
				nombre: undefined,
				apellido: undefined,
				rut: undefined,
				email: undefined,
				telefono: undefined,
				comuna: undefined,
				region: undefined,
				local: undefined
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
				wrapperCol: { span: 14 }
			},
			visible: false,
			tyc: false,
			regionseleccionada: null,
			comunaSeleccionada: null,
			procesado: null,
			labelCol: { span: 10 }
		}
	},
	computed: {
		regiones () {
			return regionesComunas.regionesComunas
		},
		comunas () {
			return this.regiones.find(
				element => element.nombre === this.regionseleccionada
			).comunas
		}
	},
	methods: {
		// este metodo debe enviar lainformacion personal a criptocuentas y el resto del formulario al back
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
		handleChange (value) {
			console.log(`Selectedd: ${value}`)
			this.regionseleccionada = value
			console.log('seleccion', this.regionseleccionada)
		},
		handleComuna (value) {
			console.log(`Selected: ${value}`)
			this.comunaSeleccionada = value
			console.log('seleccion', this.comunaSeleccionada)
		},
		async suscribirse () {
			// const { nombre, email, telefono, comuna } = this
			// const data = { nombre, email, telefono, comuna }

			this.visible = true
			const config = {}
			const respuesta = await this.$axios
				.post(`${process.env.apiURL}/apoderados`, this.formulario, config)
				.then(r => r.data)
				.catch(e => console.error('fallo suscribirse', e))
			console.log('Respuesta', respuesta)
			if (!respuesta) {
				this.visible = false
			} else {
				this.procesado = true
				this.formulario = {
					nombre: undefined,
					email: undefined,
					telefono: undefined,
					comuna: undefined,
					region: undefined
				}
			}
			console.log('suscrito', this.visible)
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
@import '~/estilos/utils'
@import '~/estilos/paleta'

.contenido
	display: flex
	flex-flow: column nowrap
	padding: 1em
	.titulo
		font-size: 1.5rem
		color: $azul1

	.formulario
		.contenedorBoton
			display: flex
			width: 100%
			justify-content: center
</style>
