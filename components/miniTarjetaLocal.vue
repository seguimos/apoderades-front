<template lang="pug">
.miniTarjetaLocal(v-if="localDeVotacion" :class="localDeVotacion.capa")
	.acciones
		.icono 🗳
	.info
		//- .territorio
			//- .region {{_.get(localDeVotacion, ['region','nombreCompleto'])}}
			//- a-divider(type="vertical")
			.comuna {{_.get(localDeVotacion, ['comuna','nombre'])}}
		.local 
			.nombre {{_.get(localDeVotacion, ['local','nombre'])}}
			.direccion {{_.get(localDeVotacion, ['local', 'direccion'])}}
</template>
<script>
export default {
	props: {
		local: {
			type: Object,
			default: null
		}
	},
	computed: {
		localDeVotacion () {
			return this.local
		}
	}
}
</script>
<style lang="sass" scoped>
@import '@style/vars'

.miniTarjetaLocal
	display: flex
	flex-flow: column nowrap
	justify-content: center
	align-items: center
	text-align: center
	line-height: 1
	.acciones
		flex: auto 0 0
		.icono
			font-size: 3em
			padding: 0 .8rem
			// margin-right: 1rem
	.info
		flex: auto 1 1
		line-height: 1.4

	&.mesa,
	&.general
		.region,
		.comuna
			// +fwb
			opacity: .65
		.local
			.nombre
				color: black
				+fwb
				margin: 0.25rem 0
			.direccion
				color: #333
				font-weight: lighter

</style>
