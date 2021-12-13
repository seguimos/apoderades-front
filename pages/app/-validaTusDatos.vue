<template lang="pug">
.autovalidadorDatosPersonales.anchoMovil
	.cabecera
		b Antes de comenzar, por favor
		h1 Valida tus datos
	.formulario
		a-form-model( ref='personalesForm' :model='personalesForm' :rules='reglasFormDatosPersonales' :disabled="!datosCargados")
			a-form-model-item(has-feedback label='Rut')
				a-input.input(:value='$usuario.rut' placeholder='Rut' disabled)

			a-form-model-item(has-feedback prop='nombre' label='Nombres')
				a-input.input(v-model='personalesForm.nombre' placeholder='Gabriel')

			a-form-model-item(has-feedback prop='apellido' label='Apellidos')
				a-input.input(v-model='personalesForm.apellido' placeholder='Boric Font')

			a-form-model-item(has-feedback prop='email' label='Correo')
				a-input.input(v-model='personalesForm.email' type='email' placeholder='gabriel@lesapoderades.cl')

			a-form-model-item(has-feedback prop='telefono' label='Teléfono')
				a-input.input(v-model='personalesForm.telefono' type='tel' placeholder='+56 x xxxx xxxx')

			a-form-model-item.acciones
				a-button.w100.casiBpStyle.verde(type='primary' @click='guardarDatosPersonales' :loading='guardandoDatos') Confirmar mis datos
				a-button.w100.casiBpStyle(type="dashed" @click='$cuenta.salir' :loading='guardandoDatos') Salir
</template>
<script>
import { Validado } from "@lib/validador"
export default {
	data () {
		return {
			// Datos personales
			datosCargados: undefined,
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
	mounted () {
		if (this.$cuenta.datosPrivados) this.decriptarDatosPersonales()
		else this.datosCargados = true
	},
	methods: {
		async decriptarDatosPersonales () {
			const datosPersonales = await this.$cuenta.decriptarDatosPersonales()
			const { nombre, apellido, email, telefono } = datosPersonales
			this.personalesForm = { nombre, apellido, email, telefono }
			this.datosCargados = true
		},
		guardarDatosPersonales () {
			this.guardandoDatos = true
			this.$refs.personalesForm.validate(async valid => {
				if (!valid) {
					console.error('Formulario no pasó validación')
					return
				}
				const { nombre, apellido, email, telefono } = this.personalesForm

				const r = await this.$cuenta.editar({
					nombre,
					apellido,
					email,
					telefono
				})
				this.guardandoDatos = false
				console.log('guardarDatosPersonales', r)
				if (!r || !r.ok) this.$message.error('Ups! Hubo un error.')
				this.$message.success('Datos guardados')
			})
		},	
	}
}
</script>
<style lang="sass" scoped>
.autovalidadorDatosPersonales
	h1
		margin: 0 0 1rem	
	// &::v-deep

</style>
