<template lang="pug">
.rootLogin
	.interior

		.cargando(v-if="$usuario === undefined")
			a-icon(type="loading")
			p Cargando

		.noConectado(v-else-if="!$usuario")
			SesionIngreso

		.conectado(v-else-if="$usuario")
			.usuario
				.avatar(v-if="$usuario.avatar" :style="`background-image: url(${$usuario.avatar})`")
				.avatar.sin(v-else)
				.nombre {{$usuario.nombre}}
			a.nosoyyo(@click="$cuenta.salir()") No eres tu?
</template>
<script>
export default {
}
</script>
<style lang="sass" scoped>
@import "@style/vars"

.rootLogin
	width: 400px
	max-width: 100%
	height: 80vh
	// height: $alturaPantallaSinMenu
	margin: 0 auto
	display: flex
	justify-content: center
	align-items: center

a.nosoyyo
	color: maroon
	font-style: italic
	font-weight: 500
	cursor: pointer

.usuario
	text-align: center
	display: flex
	flex-flow: column nowrap
	justify-content: center
	align-items: center
	margin: 1em 0
	.avatar
		+bgcov
		width: 4em
		height: 4em
		border-radius: 50%
		&.sin
			position: relative
			background-color: #eee
			&::after
				position: absolute
				width: inherit
				height: inherit
				left: 0
				z-index: 1
				content: ''
				+micon
				mask-image: url(/iconos/avatar.svg)
				mask-size: 60% auto
				background-color: #aaa


</style>
