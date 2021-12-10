<template lang="pug">
.root
	apoderades-validar(v-if="!$back.apoderade.fechaValidacionDatos")
	.buscarApoderade(v-else)
		apoderades-buscar(v-if="!creandoUsuario")
		apoderades-crear(v-else)
</template>
<script>
export default {
	data () {
		return {
			creandoUsuario: false
		}
	},
	mounted () {
		if (!this.$back.apoderade.fechaValidacionDatos) return
		const ap = this.$back.apoderade.rol
		if (ap === 'AM') {
			this.$router.replace('/app/locales')
		} else return true
	}
}
</script>
<style lang="sass" scoped></style>
