<template lang="pug">
.carpetaApoderades
	.miniNavbar
		n-link.link(to="/app/apoderades/buscar") Buscar
		n-link.link(to="/app/apoderades/inscribir") Inscribir
	n-child
</template>
<script>
export default {
	mounted () {
		const ap = this.$cuentaBack.apoderade.rol
		if (ap === 'AM') { // TODO Cambiar a flag de si es apoderado de mesa
			console.log('asdfasdfsdf')
			this.$router.replace('/app/locales')
		}
		// if (this.$route.path === '/app/apoderades') this.$router.replace('/app/apoderades/inscribir')
	}
}
</script>
<style lang="sass" scoped>
@import '@style/utils'
.miniNavbar
	display: flex
	margin-bottom: 1em
	.link
		display: block
		+ .link
			margin-left: 1em
		&.nuxt-link-exact-active
			+bold
</style>
