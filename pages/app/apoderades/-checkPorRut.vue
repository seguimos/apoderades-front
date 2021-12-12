<template lang="pug">
.checkPorRut
	a-form-model(ref="rutForm" :model="rutForm" :rules="reglasFormRut")
		a-form-model-item(has-feedback prop="rut" label="Ingresa RUT del apoderado")
			a-input.input(v-model="rutForm.rut" type="rut" allow-clear)
		a-form-model-item
			a-button.w100.bpStyle.verde(type="primary" @click="checkRut") BUSCAR
</template>
<script>
import { Validado } from "@lib/validador"
export default {
	data () {
		return {
			// Rut
			rutForm: { rut: undefined },
			rutInscrito: undefined,
			usuarioID: 'mhslBh6hHa',
			rutNoInscrito: undefined,
			rutInscritoDatos: undefined,
		}
	},
	computed: {
		reglasFormRut () {
			const rutValidador = (rule, value, callback) => {
				if (!value) return callback(new Error("Ingresa tu rut"));
				if (value.length < 8) return callback(new Error("Ingresa un rut valido"));
				const validado = Validado.rut(value)
				if (!validado) return callback(new Error("Ingresa un rut valido"));
				return callback();
			};
			return { 
				rut: [{ required: true, message: '*', whitespace: false }, { validator: rutValidador, trigger: "change" }] 
			}
		},
	},
	methods: {
		checkRut() {
			this.$refs.rutForm.validate(async valid => {
				if (!valid) return false;
				const rut = this.rutForm.rut
				const r = await this.$cuentaBack.buscarXRut(Validado.rut(rut) );
				if (r.usuarioID) {
					// TODO Mostrar info usuario
					this.usuarioID = r.usuarioID
					this.rutInscrito = rut
				} else {
					// Preparar para inscribir si
					this.rutNoInscrito = rut
				}
				console.log("checkRut r", r);
			});
		},
	}
}
</script>
<style lang="sass" scoped></style>
