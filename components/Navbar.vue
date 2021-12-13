<template lang="pug">
.navbar
	nuxt-link.logo-container(
		to="/",
		alt="Inicio",
		title="Inicio"
	)
		.logo
			.logo-after
				.iconoAprueboDignidad

	a-menu.menuPrincipal(mode="horizontal")

		a-sub-menu(v-if="$usuario")
			n-link.submenu-title-wrapper(slot="title" to="/app/miPerfil")
				a-icon(type="user")
				span.texto Mi perfil
		a-sub-menu(v-else)
			n-link.submenu-title-wrapper(slot="title" to="/app")
				a-icon(type="team")
				span.texto Iniciar Sesion


		a-sub-menu(v-if="$usuario")
			n-link.submenu-title-wrapper(slot="title" to="/app/apoderades/")
				a-icon(type="team")
				span.texto Apoderados
			//span.submenu-title-wrapper(slot="title")
				a-icon(type="team")
				| Apoderados
			//a-menu-item(key="buscar-apoderades")
				n-link.link(to="/app/apoderades/buscar") Buscar apoderados
			//a-menu-item(key="inscribir-apoderades")
				n-link.link(to="/app/apoderades/inscribir") Inscribir apoderados

		a-sub-menu(v-if="$usuario")
			span.submenu-title-wrapper(slot="title")
				a-icon(type="compass")
				span.texto Locales
			a-menu-item(key="resumen-territorial")
				n-link.link(to="/app/locales") Resumen Territorial
			a-menu-item(key="asignar-apoderades")
				n-link.link(to="/app/locales/asignar") Asignar Apoderades

</template>

<script>
export default {
	data () {
		return {}
	},
	methods: {}
}
</script>
<style lang="sass" scoped>
@import '@style/utils'
@import '@style/paleta'

$alturaMenu: 5em
.navbar
	position: sticky
	top: 0
	width: 100%
	z-index: 1000
	align-items: center
	color: $colorHeader
	background-color: $fondoHeader
	box-shadow: 0 -3em 0 $fondoHeader
	// padding: 0.5em 1.5em
	// height: 100px
	display: flex
	flex-flow: column nowrap
	justify-content: center
	align-items: center
	//> *
		border: 1px solid black
		> *
			border: 1px solid yellow
			> *
				border: 1px solid red

	.menuPrincipal
		a
			color: white
			// opacity: .6
			&.nuxt-link-active
				color: white
				// opacity: 1
		+movil
			.submenu-title-wrapper::v-deep
				display: flex
				flex-flow: column nowrap
				padding: 0.5em 0
				i
					margin: 0 0 .5rem
					line-height: 0
					svg
						$lado: 1.4em
						width: $lado
						height: $lado
				.texto
					line-height: 1.4
					+fwl
					font-size: .7rem

				


	.logo-container
		padding: .5em 0
		.logo
			color: #ffffff
			background-color: currentColor
			mask-image: url('/logos/logo.svg')
			mask-size: contain
			mask-repeat: no-repeat
			mask-position: center
			height: 0.3965em
			font-size: 8em

			.logo-after
				height: 100%
				opacity: 1
				transition: opacity .5s ease
				overflow: hidden
				.iconoAprueboDignidad
					+bgcon
					background-image: url('/logos/apruebo dignidad icono.svg')
					$lado: 3.8em
					height: $lado
					width: $lado
					position: relative
					top: 400%
					left: 50%
					transform: translateX(-50%, -50%)
					animation: rotar 30s linear infinite
					@keyframes rotar
						0%
							transform: translate(-50%, -50%) rotateZ(0deg)
						50%
							transform: translate(-50%, -50%) rotateZ(180deg)
						100%
							transform: translate(-50%, -50%) rotateZ(360deg)
			//&:hover
				.logo-after
					opacity: 1

.header-menu
	color: #fff !important
.ant-menu
	background: none
	color: #ffffff
	border: none

	.ant-menu-item-disabled, .ant-menu-submenu-disabled
		color: #dddddd
</style>
