<template lang="pug">
.carpetaCuenta
	//.noconectado
		div
			cuenta
	.noconectado(v-if="!$usuario")
		div
			cuenta
	.conectado(v-else)
		.menuLateral
			n-link.link(to='/cuenta') Tu cuenta
			n-link.link(to='/cuenta/datos') Tu información
			n-link.link(to='/cuenta/seguridad') Seguridad
			n-link.link(to='/cuenta/privacidad' disabled) Privacidad
		.contenido
			n-child

</template>
<script>
import cuenta from '~/components/cuenta'
export default {
	components: { cuenta },
	data () {
		return {}
	},
	methods: {
	}
}
</script>
<style lang="sass" scoped>
@import "@style/vars"

.carpetaCuenta
	height: 100%
	display: flex
	flex-flow: column nowrap

	.noconectado,
	.conectado
		flex: auto 1 0
	.noconectado
		display: flex
		justify-content: center
		align-items: center
		text-align: center
		.ant-btn
			margin-top: 2em

	.conectado
		display: flex
		padding: 2em
		width: 900px
		max-width: 100%
		margin: 0 auto
		.menuLateral
			flex: auto 0 0
			margin-right: 5em
		.contenido
			flex: auto 1 1


		.menuLateral
			.link
				display: block
				padding: .5em 0


</style>
