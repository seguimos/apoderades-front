<template lang="pug">
.main
	nav-bar
	a-page-header(
		style="border-bottom: 1px solid rgb(100, 200, 200)",
		title="Iniciar Sesión",
		sub-title="",
		@back="() => $router.go(-1)"
	)
	a-row(style="padding: 50px 50px")
		a-col(:lg="{span:6, offset:8}" :sm="{span: 12}")
			Nuxt
</template>

<script>
import NavBar from '../components/Navbar.vue'

export default {
	components: {
		NavBar
	}
}
</script>

<style>

</style>
