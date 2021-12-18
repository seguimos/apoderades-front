<template lang="pug">
.navbar(:class="{ esHeader, esFooter }")
	.zonaLogo
		nuxt-link.logo-container(to="/", alt="Inicio", title="Inicio" )
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
			n-link.submenu-title-wrapper(slot="title" to="/app/apoderades")
				a-icon(type="team")
				span.texto Apoderados

		a-sub-menu(v-if="$usuario")
			n-link.submenu-title-wrapper(slot="title" to="/app/locales")
				a-icon(type="book")
				span.texto Por integrar

		a-sub-menu(v-if="$usuario")
			n-link.submenu-title-wrapper(slot="title" to="/app/Chile")
				a-icon(type="book")
				span.texto Locales


		//a-sub-menu(v-if="$usuario")
			span.submenu-title-wrapper(slot="title")
				a-icon(type="compass")
				span.texto Locales
			a-menu-item(key="resumen-territorial")
				n-link.link(to="/app/locales") Resumen Territorial
			a-menu-item(key="asignar-apoderades")
				n-link.link(to="/app/locales/asignar") Designar Apoderades

</template>

<script>
export default {
	props: {
		esHeader: {
			type: Boolean,
			default: false
		},
		esFooter: {
			type: Boolean,
			default: false
		}
	}
}
</script>
<style lang="sass" scoped>
@import '@style/utils'
@import '@style/paleta'

$alturaMenu: 5em
.navbar
	align-items: center
	color: $colorHeader
	background-color: $fondoHeader
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
					margin: 0 0 .3rem
					line-height: 0
					svg
						$lado: 1.4em
						width: $lado
						height: $lado
				.texto
					line-height: 1
					+fwl
					font-size: .7rem

	.zonaLogo
		padding: .5em 0
		display: flex
		justify-content: center

	.logo-container
		.logo
			color: #ffffff
			background-color: currentColor
			mask-image: url('/logos/logo.svg')
			mask-size: contain
			mask-repeat: no-repeat
			mask-position: center
			width: 1em
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
					$lado: 2.8em
					height: $lado
					width: $lado
					position: relative
					top: 310%
					left: 50%
					transform: translateX(-50%, -50%)
					animation: rotar 30s linear infinite
					pointer-events: none
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


.navbar
	&.esHeader
		+movil
			.menuPrincipal
				display: none
	&.esFooter
		.zonaLogo
			display: none
		+compu
			display: none
</style>
