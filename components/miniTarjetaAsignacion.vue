<template lang="pug">
.miniTarjetaAsignacion.asignacion(v-if="asignacion")
	.rol(v-if="asignacion.capa === 'regional'") Coordinador Regional
	.rol(v-else-if="asignacion.capa === 'comunal'") Coordinador Comunal
	.rol(v-else-if="asignacion.capa === 'general'") Apoderado General
	.rol(v-else-if="asignacion.capa === 'mesa'") Apoderado Mesa
	strong(v-else) 
		.icono(style="font-size: 4em; margin-bottom: 1rem;") 🤨
		strong '!>!?!??!'
		.texto Esto parece ser un error
	miniTarjetaLocal(:local="territorioAsignado")
</template>
<script>
export default {
	props: {
		territorioAsignado: {
			type: Object,
			required: true
		}
	},
	computed: {
		asignacion () {
			return this.$cuentaBack.territorioAasignacion(this.territorioAsignado)
		}
	}
}
</script>
<style lang="sass" scoped>
@import '@style/vars'

.rol
	color: black
	+fwb

</style>
