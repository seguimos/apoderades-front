<template lang="pug">
a-layout.root
	a-layout-header.navbar
		nuxt-link.logo-container(
			to="/",
			alt="Inicio",
			title="Inicio",
			@click.native="tag('nav home')"
		)
			.logo
				.logo-after
					.iconoAprueboDignidad
		a-menu(mode="horizontal")
			a-menu-item.header-menu(key="login", v-if="!$usuario")
				n-link.link(to="/app/login") Iniciar Sesión
			a-sub-menu(v-if="$usuario")
				span.submenu-title-wrapper(slot="title")
					a-icon(type="user")
					| Cuentas
				a-menu-item(v-if="$usuario", key="mi-cuenta")
					n-link.link(to="/cuenta") Mi cuenta
				a-menu-item(v-if="!$usuario", key="mi-cuenta")
					n-link.link(to="/app") Iniciar Sesion
				a-menu-item(key="mis-datos")
					.link(@click="$cuenta.salir") Salir
			a-sub-menu(v-if="$usuario")
				span.submenu-title-wrapper(slot="title")
					a-icon(type="team")
					| Apoderades
				a-menu-item(key="buscar")
					n-link.link(to="/app/apoderades") Buscar apoderado
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
						| Resultados
					a-menu-item(key="reglamento")
						| Reglamento
				a-menu-item-group(title="Comando")
					a-menu-item(key="link-1")
						| Link 1
					a-menu-item(key="link-2")
						| Link 2
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
