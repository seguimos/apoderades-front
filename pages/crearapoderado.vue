<template lang="pug">
.rootParticipa
	.contenido
		.titulo Crear un nuevo apoderado

		.formulario
			a-form-model.suscribirse(
				ref="formulario",
				:model="formulario",
				:rules="rules"
			)
				a-form-model-item(has-feedback, prop="rut")
					a-input.input(v-model="formulario.rut", type="rut", placeholder="Rut")
					a-button(@click="buscalo()") Buscar si existe

				.contenedorsSecundario(v-if="rutEncontrado")
					a-form-model-item(has-feedback, prop="nombre")
						a-input.input(
							v-model="formulario.nombre",
							type="nombre",
							placeholder="Nombre"
						)
					a-form-model-item(has-feedback, prop="apellido")
						a-input.input(
							v-model="formulario.apellido",
							type="apellido",
							placeholder="Apellido"
						)

					a-form-model-item(has-feedback, prop="email")
						a-input.input(
							v-model="formulario.email",
							type="email",
							placeholder="Email"
						)

					a-form-model-item(has-feedback, prop="telefono")
						a-input.input(
							v-model="formulario.telefono",
							type="tel",
							placeholder="+56 x xxxx xxxx"
						)

					a-form-model-item(has-feedback, prop="region")
						a-select.input(
							v-model="formulario.region",
							@change="handleChange",
							placeholder="Región"
						)
							a-select-option(
								v-for="region in regiones",
								:key="region.label",
								:value="region.label"
							) {{ region.label }}

					a-form-model-item(
						v-if="regionseleccionada",
						has-feedback="",
						prop="comuna"
					)
						a-select.input(
							v-model="formulario.comuna",
							placeholder="Comuna",
							@change="handleComuna"
						)
							a-select-option(
								v-for="comuna in comunas",
								:key="comuna.label",
								:value="comuna.label"
							) {{ comuna.label }}

					a-form-model-item
						a-select.input(v-model="formulario.rol", placeholder="Rol")
							a-select-option(:value="1") Comando
							a-select-option(:value="2") Coordinador
							a-select-option(:value="3") Apoderado General
							a-select-option(:value="4") Apoderado de mesa

					a-form-model-item(has-feedback, prop="territorioAsignado")
						a-input.input(
							v-model="formulario.territorioAsignado",
							type="territorioAsignado",
							placeholder="territorio asignado "
						)
					a-form-model-item(has-feedback, prop="localAsignado")
						a-input.input(
							v-model="formulario.localAsignado",
							type="mesa",
							placeholder="Asignar Local"
						)

					a-form-model-item.pre ¿Estás disponible para otros locales cercanos? #[span]
						a-switch(v-model="formulario.disponibleParaOtrosLocales")
					//- a-form-model-item(has-feedback prop='militancia')
					//- 	a-input(v-model='formulario.milita' type='checkbox').input
					//- 	div eres militante?
					a-form-model-item
						a-button(type="primary", @click="submitForm('formulario')")
						| CREAR USUARIO
		//- .contenedorBoton
			a.boton.votoExtranjero(
				type="primary",
				target="_blank",
				href="https://docs.google.com/forms/d/e/1FAIpQLSe3bTgWo9CWLZGSQcYMSW625ssbK6TmL0WcuO49cx48rqY24Q/viewform"
			)
				| Voto en el extranjero
</template>

<script>
import isEmail from 'validator/lib/isEmail'
import { phone } from 'phone'
import { validate, format, clean } from 'rut.js'
import regionesComunas from '../regiones/regioneschile'

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
				nombre: undefined,
				apellido: undefined,
				rut: undefined,
				email: undefined,
				telefono: undefined,
				comuna: undefined,
				region: undefined,
				distrito: undefined,
				territorioAsignado: undefined,
				localAsignado: undefined,
				rol: undefined,
				buscarRut: undefined
			},
			rules: {
				nombre: [{ validator: validaNombre, trigger: 'change' }],
				apellido: [{ validator: validaNombre, trigger: 'change' }],
				email: [{ validator: validaEmail, trigger: 'change' }],
				telefono: [{ validator: validaTelefono, trigger: 'change' }],
				region: [{ validator: validaRegion }],
				comuna: [{ validator: validaComuna, trigger: 'change' }],
				rut: [{ validator: validaRut, trigger: 'change' }],
				validaRut: [{ validator: validaRut, trigger: 'change' }]
			},
			layout: {
				labelCol: { span: 4 },
				wrapperCol: { span: 14 }
			},
			rutEncontrado: null,
			visible: false,
			buscarRut: undefined,
			regionseleccionada: null,
			comunaSeleccionada: null,
			procesado: null
			// regiones: this.re
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
			const com = this._.filter(re, ['value', this.regionseleccionada])
			const comunas = com[0].children
			if (this.regionseleccionada) {
				// console.log(this.regionseleccionada)
				// console.log('comunas', comunas)
				// console.log('formulario', this.formulario)
			}
			return comunas
		},
		distrito () {
			const comunaSeleccionada = this.comunaSeleccionada
			if (this.comunaSeleccionada) {
				const com = this.comunas
				const comuna = this._.filter(com, ['value', comunaSeleccionada])
				const distrito = comuna[0].distrito
				// console.log('distrito', distrito)
				this.defineDistrito(distrito)
				return distrito
			}
			return null
		}
	},
	methods: {
		// en esta funcion se debe realizar una solicitud a Criptocuentas para obtener los datos personales
		buscalo () {
			console.log('buscalo', this.formulario.rut)
			this.rutEncontrado = !this.rutEncontrado
		},

		// Esta funcion debe eviar los datos personales a criptocuentas, recibibir ID y enviar el resto del formulario + el id al back
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
		defineDistrito (d) {
			this.formulario.distrito = d
		},
		handleChange (value) {
			console.log(`Selectedd: ${value}`)
			this.regionseleccionada = value
			console.log('seleccion', this.regionseleccionada)
		},
		handleComuna (value) {
			console.log(`Selected: ${value}`)
			this.comunaSeleccionada = value
			console.log('distri', this.distrito)
		},
		async suscribirse () {
			// const { nombre, email, telefono, comuna } = this
			// const data = { nombre, email, telefono, comuna }

			this.visible = true
			const config = {}
			const respuesta = await this.$axios
				.post(
					`${process.env.apiURL}/validardatosapoderado`,
					this.formulario,
					config
				)
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
					region: undefined,
					distrito: undefined,
					milita: null
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
@import '@style/utils'
@import '@style/paleta'

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
