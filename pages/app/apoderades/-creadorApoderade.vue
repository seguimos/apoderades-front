<template lang="pug">
.creadorApoderade
	div(v-if="!rut") 
		b Primero busca por rut
		a-button(@click="$emit('buscarRut')")
	a-form-model(v-else ref="personalesForm" :model="personalesForm" :rules="reglasFormDatosPersonales")
		a-form-model-item(has-feedback prop="nombre" label="Nombres")
			a-input.input(v-model="personalesForm.nombre" type="nombre" placeholder="Gabriel")

		a-form-model-item(has-feedback prop="apellido" label="Apellidos")
			a-input.input(v-model="personalesForm.apellido" type="apellido" placeholder="Boric Font")

		a-form-model-item(has-feedback prop="email" label="Correo")
			a-input.input(v-model="personalesForm.email" type="email" placeholder="gabriel@lesapoderades.cl")

		a-form-model-item(has-feedback prop="telefono" label="Teléfono")
			a-input.input(v-model="personalesForm.telefono" type="tel" placeholder="+56 x xxxx xxxx")

		a-form-model-item
			a-button.w100.bpStyle.verde(type="primary" @click="guardarDatosPersonales") Guardar datos personales
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
		}
	},
	computed: {

		reglasFormDatosPersonales () {
			const telefonoValidador = (rule, value, callback) => {
				if (!value) return callback(new Error("Ingresa el telefono"));
				if (value.length < 8) return callback(new Error("Ingresa un telefono valido"));
				const validado = Validado.telefono(value)
				if (!validado) return callback(new Error("Ingresa un rut valido"));
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

		guardarDatosPersonales () {},
	}
}
</script>
<style lang="sass" scoped></style>
