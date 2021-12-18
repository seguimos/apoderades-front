<template lang="pug">
.root(v-if="regionID && comunaID && localID")
	a-breadcrumb(:routes='rutas')
		template(slot='itemRender' slot-scope='{route, params, routes, paths}')
			n-link(:to="`/${paths.join('/')}`") {{route.breadcrumbName}}

	a-page-header.headerPagina(
		:title="local.nombre"
		sub-title="Local de votación")



	.local
		//- b Local
		//div {{local}}

		.zonaApoderades
			h3 Apoderados asignados
			.apoderades
				
				.apoderade(v-for="(apoderade, usuarioID) in apoderadesAsignados" :class="{ extendide: apoderadeExtendide === usuarioID }" )
					.contenido(@click="switchDelColapso(usuarioID)")
						.zonaAvatar
							.avatar(:class="{ esApoGeneral: apoderade.esApoGeneral}") {{_.get(apoderade, ['nombre', 0])}}
						.zonaInfo
							.esApoderadoGeneral(v-if="_.some(apoderade.asignaciones, a => a.capa === 'general' && a.localID === localID)") Apoderado general
							span.nombre {{apoderade.nombre}} {{apoderade.apellido}}
					transition.elColapso
						.colapsable(v-if="apoderadeExtendide === usuarioID")
							.zonaAvatar
								.avatar
							.asignaciones
								
								.asignacion(v-for="terr in apoderade.territoriosAsignados")
									miniTarjetaAsignacion(:territorioAsignado="terr" :usuarioID="usuarioID" mostrarDesasignar sinDireccion sinIcono @asignacionEliminada="cargarLocal")
										
			h3 Apoderados Disponibles
			.apoderades
				
				.apoderade(v-for="(apoderade, usuarioID) in apoderadesDisponibles" :class="{ extendide: apoderadeExtendide === usuarioID }" )
					.contenido(@click="switchDelColapso(usuarioID)")
						.zonaAvatar
							.avatar() {{_.get(apoderade, ['nombre', 0])}}
						.zonaInfo
							.cercania(v-if="apoderade.territorioPreferencia.localID === localID") Vota en el local
							.cercania(v-else-if="apoderade.territorioPreferencia.comunaCodigo === comunaID") Vota en la comuna
							.cercania(v-else-if="apoderade.territorioPreferencia.region === regionID") Vota en la región
							span.nombre {{apoderade.nombre}} {{apoderade.apellido}}
					transition.elColapso
						.colapsable(v-if="apoderadeExtendide === usuarioID")
							//.zonaAvatar
								.avatar
							.asignaciones.acciones
								div.accion
									a-button.boton.w100(type="dashed" @click="$message.warning('Pronto')" disabled) Asignar como A. General (Pronto)
								div.accion
									a-button.boton.w100(type="dashed" @click="$message.warning('Pronto')" disabled) Asignar como A. de mesa (Pronto)
								



			//h4 Apoderados apoderadesQueVotanAqui
			//.apoderades
				.apoderade(v-for="apoderade in apoderadesQueVotanAqui")
					.contenido
						.zonaAvatar
							.avatar() {{_.get(apoderade, ['nombre', 0])}}
						.zonaInfo
							.esApoderadoGeneral(v-if="apoderade.territorioPreferencia.localID === localID") Apoderado general
							span.nombre {{apoderade.nombre}} {{apoderade.apellido}}
					.colapsado

		br
		br
		br
		br
		br
		.zonaMesas
			h3 Mesas
			.WIP
				.icono 🦌🌾🌳 🚴🏽🌻🌳🚴🏽🐧
				.texto Pronto disponible
			.mesas(v-if="$dev")
				.mesa(v-for="(mesa, mesaID) in local.mesas")
					b {{mesa.mesa}}


</template>
<script>
export default {
	data () {
		return {
			apoderadeExtendide: null
		}
	},
	computed: {
		rutas () { 
			const _ = this._
			return [
				{
					path: `/app/Chile`,
					breadcrumbName: 'Chile',
				},
				{
					path: this.regionID,
					breadcrumbName: _.get(this.region, 'nombre', 'Region?'),
				},
				{
					path: this.comunaID,
					breadcrumbName: _.get(this.comuna, 'nombre', 'Comuna?'),
				}
			] 
		},
		regionID () { return this.$route.params.regionID },
		region () { return this.$chile.regionPorID(this.regionID)},
		comunaID () { return this.$route.params.comunaID },
		comuna () { return this.$chile.comunaPorID(this.comunaID)},
		localID () { return this.$route.params.localID },
		local () { return this.$chile.localPorID(this.localID)},
		apoderades () {
			return this.local.todesLesApoderades
		},
		apoderadesAsignados () {
			const _ = this._
			if (_.isEmpty(this.apoderades)) return {}
			return _.pickBy(this.apoderades, apoderade => 
				_.some(apoderade.territoriosAsignados || [], terr => terr.localId === this.local.localID)
			)
		},
		apoderadesQueVotanAqui () {
			const _ = this._
			if (_.isEmpty(this.apoderades)) return {}
			return _.pickBy(this.apoderades, apoderade => {
				const localVotacion = _.get(apoderade, 'territorioPreferencia.localId')
				return localVotacion && localVotacion === this.local.localID
			})
		},
		apoderadesDisponibles () {
			const _ = this._
			if (_.isEmpty(this.apoderades)) return {}
			return _.pickBy(this.apoderades, apoderade => 
				!_.some(apoderade.territoriosAsignados || [], terr => terr.localId === this.local.localID)
			)
		}
	},
	mounted () {
		// if (this._.isEmpty(this.local)) 
		this.cargarLocal()
	},
	methods: {
		cargarLocal () {
			if (!this.regionID || !this.localID) return
			this.$cuentaBack.localPorID(this.regionID, this.localID)
		},
		switchDelColapso (usuarioID) {
			if (this.apoderadeExtendide === usuarioID) this.apoderadeExtendide = false
			else this.apoderadeExtendide = usuarioID
		},
		puedeAsignarApoderadoGeneral () {
			return this.$apoderade.tieneAccesoNacional || this._.some(this.$apoderade.asignaciones, a => a.capa === 'regional' && a.regionID === this.regionID) || this._.some(this.$apoderade.asignaciones, a => a.capa === 'comunal' && a.comunaID === this.comunaID)
		},
		puedeAsignarYHabilitarApoderadoMesa () {
			return this.$apoderade.tieneAccesoNacional || this._.some(this.$apoderade.asignaciones, a => a.capa === 'regional' && a.regionID === this.regionID) || this._.some(this.$apoderade.asignaciones, a => a.capa === 'comunal' && a.comunaID === this.comunaID) || this._.some(this.$apoderade.asignaciones, a => a.capa === 'general' && a.localID === this.localID)
		}
	}
}
</script>
<style lang="sass" scoped>
@import '@style/vars'
.apoderades
	.apoderade
		.contenido,
		.colapsable
			display: flex
			align-items: center

		.zonaAvatar
			margin-right: 1em
			.avatar
				background-color: #eee
				font-size: 1.4em
				$lado: 2rem
				width: $lado
				height: $lado
				border-radius: 10rem
				border: 2px solid transparent

				display: flex
				justify-content: center
				align-items: center
				text-align: center
			&.esApoGeneral
				border-color: $azul1
		.zonaInfo
			.nombre 
				+fwb

		.colapsable

			.avatar
				visibility: hidden
		//.asignaciones
			.asignacion
				display: inline-block
				background-color: #aaa
				color: white
				padding: .2em 1em
				border-radius: 6em
				+ .asignacion
					margin-top: 0.2rem
				.capa
					display: flex
					align-items: center
					.rangoPreciso
						margin-left: 1em
				&.regional
					background-color: $colorPrincipalA1
				&.comunal
					background-color: $colorPrincipalA2
				&.general
					background-color: $colorPrincipalB2
				&.mesa
					background-color: $colorPrincipalB3


		.colapsable
			width: 100%
			padding: 0 1em
			// border: 1px solid red
			+saliendo
				max-height: 30vh
				overflow: hidden
			+salir
				max-height: 0
				opacity: 0
		&.extendide
			background-color: #eee
			.colapsable
				background-color: #ddd
				padding: 1em
				.acciones
					width: 100%
</style>
