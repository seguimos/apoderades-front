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

	a-menu(mode="horizontal")

		a-sub-menu(v-if="$usuario")
			n-link.submenu-title-wrapper(slot="title" to="/app/miPerfil")
				a-icon(type="user")
				| Mi perfil
		a-sub-menu(v-else)
			n-link.submenu-title-wrapper(slot="title" to="/app")
				a-icon(type="team")
				| Iniciar Sesion


		a-sub-menu(v-if="$usuario")
			n-link.submenu-title-wrapper(slot="title" to="/app/apoderades/")
				a-icon(type="team")
				| Apoderados
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
				| Locales
			a-menu-item(key="resumen-territorial")
				n-link.link(to="/app/locales") Resumen Territorial
			a-menu-item(key="asignar-apoderades")
				n-link.link(to="/app/locales/asignar") Asignar Apoderades

		a-sub-menu
			span.submenu-title-wrapper(slot="title")
				a-icon(type="link")
				| Enlaces útiles
			a-menu-item-group(title="Servel")
				a-menu-item(key="datos-votacion")
					a(href="https://consulta.servel.cl") Datos Votación
				a-menu-item(key="resultados")
					a(href="https://resultados.servel.cl") Resultados
				a-menu-item(key="reglamento")
					a(href="https://servel.cl/wp-content/uploads/2021/11/DICTA_NORMAS_E_INSTRUCCIONES_QUE_INDICA_PARA_ELECCION_PRESIDENCIAL_EN_SEGUNDA_VOTACION_-_ACUERDO_24_NOV.pdf") Normas Oficiales
			a-menu-item-group(title="Comando")
				a-menu-item(key="tg-canal")
					a(href="https://t.me/s/apoderades") Canal Apoderados

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
	padding: 0.5em 1.5em
	height: 100px

	.logo-container
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
				opacity: 0
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
			&:hover
				.logo-after
					opacity: 1

.header-menu
	color: #fff!important

.ant-menu
	background: none
	color: #ffffff
	border: none

	.ant-menu-item-disabled, .ant-menu-submenu-disabled
		color: #dddddd
</style>
