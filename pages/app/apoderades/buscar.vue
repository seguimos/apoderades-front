<template lang="pug">
.root
	h1 Buscar apoderado

	a-form-model( ref="formulario" :model="formulario" :rules="rules" )

		a-form-model-item(has-feedback prop="rut" label="Ingresa RUT del apoderado" )
			a-input.input(v-model="formulario.rut" type="rut")

		a-form-model-item
			a-button.w100.bpStyle.verde(type="primary" @click="submitForm") BUSCAR


	i Aquí se mostraría info útil del inscrito, como local asignado, etc


</template>

<script>
import { validate, format, clean } from 'rut.js'

export default {
	data () {
		const validaRut = (rule, value, callback) => {
			if (!value) return callback(new Error('Ingresa tu rut'))
			if (value.length < 8) return callback(new Error('Ingresa un rut valido'))

			if (!value) return callback(new Error('ingresa un rut valido'))
			const limpio = clean(value)
			const rutformateado = format(limpio)
			const validado = validate(rutformateado)
			if (!validado) return callback(new Error('Ingresa un rut valido'))
			return callback()
		}
		return {
			formulario: {
				rut: undefined
			},
			rules: {
				rut: [{ validator: validaRut, trigger: 'change' }]
			}
		}
	},
	methods: {
		submitForm () {
			// console.log('submitForm')
			this.$refs.formulario.validate(async valid => {
				if (!valid) {
					console.log('error submit!!')
					return false
				}
				const rut = this.formulario.rut
				await this.$cuentaBack.buscarXRut(rut)
			})
		}
	}
}
</script>
