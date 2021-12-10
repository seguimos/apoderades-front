<template lang="pug">
.main
	.header
		Navbar
	div
		a-row
			a-col( :xs="{ span: 24, offset: 0}", :sm="{span: 18, offset: 3}", :md="{span: 16, offset: 4}", :lg="{span: 10, offset: 7}")
				Nuxt
</template>

<script>
export default {
	mounted () {
		if (process.env.dev) window.vm = this
	}
}
</script>

<style lang="sass">
@import '@style/colores'
@import '@style/paleta'

.main
	min-height: 100vh
	// overflow-y: auto
	position: relative
	// border: 3px solid green
	display: flex
	flex-flow: column nowrap
	.header
		flex: auto 0 0
	.cuerpo
		flex: auto 1 0
		overflow-x: hidden
	.footer
		flex: auto 0 0

a-col
	margin: 20px
</style>
