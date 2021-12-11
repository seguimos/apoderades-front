<template lang="pug">
.root
	h1 Buscar apoderado

	.buscarapoderado
		a-form-model.suscribirse(
			ref="formulario",
			:model="formulario",
			:rules="rules"
		)
			a-form-model-item(
				has-feedback,
				prop="rut",
				label="Ingresa RUT del apoderado"
			)
				a-input.input(v-model="formulario.rut", type="rut")

			a-form-model-item.contenedorbtn(:wrapper-col="{ span: 16, offset: 4 }")
				a-button.suscribirme(type="primary", @click="submitForm('formulario')")
					| BUSCAR
</template>

<script>
import { validate, format, clean } from 'rut.js'

export default {
	data () {
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
				rut: undefined
			},
			rules: {
				rut: [{ validator: validaRut, trigger: 'change' }]
			},
			layout: {
				labelCol: { span: 4 },
				wrapperCol: { span: 14 }
			},
			procesado: null
		}
	},
	methods: {
		submitForm (formName) {
			// console.log(this.formulario)
			this.$refs[formName].validate(async valid => {
				if (valid) {
					const rut = this.formulario.rut
					await this.$cuentaBack.buscarXRut(rut)
					// this.$gtm.push({ event: 'Registro_mailing', nombre: 'Registro en Mailchimp', estado: 'completo' })
				} else {
					console.log('error submit!!')
					return false
				}
			})
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
