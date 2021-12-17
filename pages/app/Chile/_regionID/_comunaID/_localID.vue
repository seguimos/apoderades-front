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
			h3 Apoderados
			.apoderades
				.apoderade(v-for="apoderade in apoderades")
					.contenido
						.zonaAvatar
							.avatar(:class="{ esApoGeneral: apoderade.esApoGeneral}") {{_.get(apoderade, ['nombre', 0])}}
						.zonaInfo
							.esApoderadoGeneral(v-if="apoderade.esApoGeneral") Apoderado general
							span.nombre {{apoderade.nombre}} {{apoderade.apellido}}
					.colapsado


		.zonaMesas
			h3 Mesas
			.WIP
				.icono 🦌🚴🏽🌾🌳 🚴🏼🌻🌳🚴🏽🐧
				.texto Pronto disponible
			.mesas(v-if="$dev")
				.mesa(v-for="(mesa, mesaID) in local.mesas")
					b {{mesa.mesa}}


</template>
<script>
export default {
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
			const _ = this._
			return _.reduce(_.get(this.local, 'apoderades', []), (res, apo) => {
				const esApoGeneral = apo.esApoderadoGeneral
				res[apo.usuarioID] = Object.assign({}, this.$store.state.apoderades[apo.usuarioID], {esApoGeneral})
				return res
			}, {})
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
		}
	}
}
</script>
<style lang="sass" scoped>
.apoderades
	.apoderade
		.contenido
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

					display: flex
					justify-content: center
					align-items: center
					text-align: center
			.zonaInfo
</style>
