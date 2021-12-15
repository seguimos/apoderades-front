<template lang="pug">
.checkPorRut

	a-form-model(ref="rutForm" :model="rutForm" :rules="reglasFormRut")
		a-form-model-item(prop="rut" label="Ingresa RUT del apoderado")
			a-input.input(ref="inputRut" v-model="rutForm.rut" type="rut" allow-clear @keyup.enter="checkRut")
		a-form-model-item
			a-button.w100.casiBpStyle.verde(type="primary" @click="checkRutOBuscarOtro"
				:loading="revisandoRut") 
				| {{rutBuscado? 'BUSCAR OTRO' : revisandoRut? 'BUSCANDO' : 'BUSCAR'}}

</template>
<script>
import { Validado } from "@lib/validador"
export default {
	data () {
		return {
			// Rut
			rutForm: { rut: undefined },
			usuarioID: undefined,
			apoderadeNombre: undefined,
			rutBuscado: undefined,
			apoderadeDatos: undefined,
			revisandoRut: false
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
				rut: [{ required: true, message: '*', whitespace: false }, { validator: rutValidador, trigger: "blur" }] 
			}
		},
	},
	methods: {
		checkRut() {
			this.$refs.rutForm.validate(async valid => {
				if (!valid) return false;
				const rut = this.rutForm.rut
				this.revisandoRut = true
				const r = await this.$cuentaBack.buscarXRut(Validado.rut(rut) );
				console.log("checkRut r", r);
				this.$refs.rutForm.resetFields()
				this.revisandoRut = false
				if (r.usuarioID) this.$emit('inscrite', {...r, rut})
				else this.$emit('noInscrite', rut)
			});
		},
		checkRutOBuscarOtro () {
			if (this.rutForm.rut === this.rutBuscado) {
				this.rutForm.rut = undefined
				this.$refs.inputRut.focus()
			} else this.checkRut()
		}
	}
}
</script>
<style lang="sass" scoped>
// .checkPorRut
</style>
