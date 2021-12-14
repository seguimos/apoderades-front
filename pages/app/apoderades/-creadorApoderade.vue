<template lang="pug">
.creadorApoderade
	a-form-model(ref='personalesForm' :model='personalesForm' :rules='reglasFormDatosPersonales' )

		a-form-model-item(has-feedback prop='nombre' label='Nombres')
			a-input.input(v-model='personalesForm.nombre' type='nombre' placeholder='Gabriel')

		a-form-model-item(has-feedback prop='apellido' label='Apellidos')
			a-input.input(v-model='personalesForm.apellido' type='apellido' placeholder='Boric Font')

		a-form-model-item(has-feedback prop='email' label='Correo')
			a-input.input(v-model='personalesForm.email' type='email' placeholder='gabriel@lesapoderades.cl')

		a-form-model-item(has-feedback prop='telefono' label='Teléfono')
			a-input.input(v-model='personalesForm.telefono' type='tel' placeholder='+56 x xxxx xxxx')

		a-form-model-item
			a-button.w100.casiBpStyle.verde(type='primary' @click='guardarDatosPersonales' :loading='guardandoDatos') Inscribir
</template>
<script>
import { Validado } from "@lib/validador"
export default {
	props: {
		rut: {
			type: String,
			required: true
		}
	},
	data () {
		return {
			// Datos personales
			personalesForm: {
				nombre: undefined,
				apellido: undefined,
				email: undefined,
				telefono: undefined
			},
			guardandoDatos: undefined
		}
	},
	computed: {
		reglasFormDatosPersonales () {
			const telefonoValidador = (rule, value, callback) => {
				if (!value) return callback(new Error("Ingresa el teléfono"));
				if (value.length < 8) return callback(new Error("Ingresa un teléfono valido"));
				const validado = Validado.telefono(value)
				if (!validado) return callback(new Error("Ingresa un teléfono valido"));
				return callback();
			};
			return {
				nombre: [{ required: true, message: '*', whitespace: true }],
				apellido: [{ required: true, message: '*', whitespace: true }],

				email: [{ type: 'email', message: 'Email inválido' }, { required: true, message: 'Ingresa email' }],
				telefono: [{ required: true, message: '*', whitespace: true }, { validator: telefonoValidador, trigger: "change" }] 
			}
		},
	},
	methods: {
		guardarDatosPersonales () {
			this.guardandoDatos = true
			this.$refs.personalesForm.validate(async valid => {
				if (!valid) {
					console.error('Formulario no pasó validación')
					return
				}
				const rut = this.rut
				const { nombre, apellido, email, telefono } = this.personalesForm
				const r = await this.$cuentaBack.soloCrearApoderade({ nombre, apellido, email, telefono, rut })

				this.guardandoDatos = false
				console.log('guardarDatosPersonales', r)
				const {usuarioID} = r
				this.$emit('incripcionRealizada', {...r, usuarioID})
			})
		},	
	}
}
</script>
<style lang="sass" scoped></style>
