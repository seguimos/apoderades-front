<template lang="pug">
.root(v-if="regionID && comunaID && localID")
	.wrapperEncabezado
		.anchoComun
			a-breadcrumb(:routes='rutas')
				template(slot='itemRender' slot-scope='{route, params, routes, paths}')
					n-link(:to="`/${paths.join('/')}`") {{route.breadcrumbName}}

			a-page-header.headerPagina(
				:title="local.nombre"
				sub-title="Local de votación")

				.estadisticas.flex.aic.jcsb(v-if="local.estadisticas")
					a-statistic(decimalSeparator="," groupSeparator="." title="Mesas" :value="local.estadisticas.mesas")
					a-statistic(decimalSeparator="," groupSeparator="." title="Apoderados" :value="local.estadisticas.apoderades")



	.local.anchoComun

		h2 Apoderadas/os
		.zonaApoderades
			h3 Han sido destinados a este local

			.filtros.mt1em
				a-input(v-if="!_.isEmpty(apoderadesAsignados)" v-model="busquedaAsignados" allow-clear placeholder='Nombre o apellido')

			.apoderades
				.tac(v-if="_.isEmpty(apoderadesAsignados)")
					| --- Vacío ---
				.tac(v-else-if="_.isEmpty(apoderadesAsignadosFiltrados)" @click="busquedaAsignados = ''")
					| --- Sin resultados ---
				
				.apoderade(v-else v-for="(apoderade, usuarioID) in apoderadesAsignadosFiltrados" :class="{ extendide: apoderadeExtendide === usuarioID }" :key="`apo-${usuarioID}`")
					.contenido
						.zonaAvatar.f00
							.avatar(@click="switchDelColapso(usuarioID)"
								:class="{ esApoGeneral: apoderade.esApoGeneral}") {{_.get(apoderade, ['nombre', 0])}}
						.zonaInfo.f11
							.esApoderadoGeneral(v-if="_.some(apoderade.asignaciones, a => a.capa === 'general' && a.localID === localID)") Apoderado general
							span.nombre {{apoderade.nombre}} {{apoderade.apellido}}
						.zonaAcciones.f00
							a-button(@click="switchDelColapso(usuarioID)"
								shape="circle" 
								:icon="apoderadeExtendide === usuarioID ? 'up' : 'more'")


					transition.elColapso
						.colapsable(v-if="apoderadeExtendide === usuarioID")
							
							.asignaciones
								.fwb Participa como:
								br
								.asignacion(v-for="terr in apoderade.territoriosAsignados")
									miniTarjetaAsignacion(:territorioAsignado="terr" :usuarioID="usuarioID" mostrarDesasignar sinDireccion sinIcono @asignacionEliminada="cargarLocal")

							.acciones(v-if="puedeDesignarYHabilitarApoderadoMesa")
								.accion
									a-button.boton.w100(type="dashed" @click="$cuentaBack.obtenerDatosDeContacto({regionID, comunaID, localID, usuarioID})") Contactar 💬



			h3 Votan aquí y no son apoderados en otro local

			.filtros.mt1em
				a-input(v-if="!_.isEmpty(apoderadesDisponibles)" v-model="busquedaDisponibles" allow-clear placeholder='Nombre o apellido')

			.apoderades
				.tac(v-if="_.isEmpty(apoderadesDisponibles)")
					| --- Vacío ---
				.tac(v-else-if="_.isEmpty(apoderadesDisponiblesFiltrados)" @click="busquedaAsignados = ''")
					| --- Sin resultados ---
				
				.apoderade(v-else v-for="(apoderade, usuarioID) in apoderadesDisponiblesFiltrados" :class="{ extendide: apoderadeExtendide === usuarioID }" :key="`apo-${usuarioID}`")
					.contenido
						.zonaAvatar.f00
							.avatar(@click="switchDelColapso(usuarioID)") {{_.get(apoderade, ['nombre', 0])}}
						.zonaInfo.f11
							.cercania(v-if="apoderade.territorioPreferencia.localId === localID") Vota en el local
							.cercania(v-else-if="apoderade.territorioPreferencia.comunaCodigo === comunaID") Vota en la comuna
							.cercania(v-else-if="apoderade.territorioPreferencia.region === regionID") Vota en la región
							span.nombre {{apoderade.nombre}} {{apoderade.apellido}}
						.zonaAcciones.f00
							a-button(@click="switchDelColapso(usuarioID)"
								shape="circle" 
								:icon="apoderadeExtendide === usuarioID ? 'up' : 'more'")

					transition.elColapso
						.colapsable(v-if="apoderadeExtendide === usuarioID")
						
							.acciones
								a-popconfirm.accion(v-if="puedeDesignarApoderadoGeneral" title="Designar apoderado general?" ok-text="Si, A. General" okType="info" cancelType="primary" cancel-text="No" placement="topRight" @confirm="designarApoderadeGeneral(usuarioID)")
									a-button.boton.w100(type="info") Designar Apoderado General
									div(slot="content")
								//div.accion
									a-button.boton.w100(v-if="puedeDesignarApoderadoGeneral"
										type="info" @click="$message.warning('Pronto')") Designar Apoderado General
								div.accion(v-if="puedeDesignarYHabilitarApoderadoMesa")
									a-button.boton.w100(type="primary" @click="designarApoderadeMesa(usuarioID)") Designar Apoderado de mesa

								.accion(v-if="puedeDesignarYHabilitarApoderadoMesa")
									a-button.boton.w100(type="dashed" @click="$cuentaBack.obtenerDatosDeContacto({regionID, comunaID, localID, usuarioID})") Contactar 💬
			
			
		h2 Mesas

		.zonaMesas
			//.WIP(v-if="!$dev")
				.icono 🌱
				.texto Pronto disponible
			.resumenMesasLocal
				.resumenMesas

					.item 
						.valor {{mesas.length}}
						.texto Mesas

					.item
						.valor {{_.filter(mesas, m => m.tieneConteo).length}}
						.texto Mesas con conteo
				
				.info.flex.ffcn.aic.jcc.tac.my1em
					div(v-if="$ahora.isBefore($fechaApertura)") Esperando apertura de mesas
						div
							b {{$fechaApertura.from($ahora)}}

					div(v-if="$ahora.isBefore($fechaCierre)") Cierre de mesas estará disponible
						div
							b {{$fechaCierre.from($ahora)}}
							
					div.fwb(v-else) Cierre de mesas ya disponible

				.acciones
					a-button(type="primary") Finalizar jornada electoral



			.ejemplos.mesas.mt1em

				.mesa(v-for="mesa in [{mesaID: 'eje000100', mesa: 'Ej100', nombre: 'Ej100'}, {mesaID: 'eje000101', mesa: 'Ej101', nombre: 'Ej101'}, {mesaID: 'eje000102', mesa: 'Ej102', nombre: 'Ej102'}]"
					:class="{ extendida: mesaExtendida === mesa.mesaID }" :key="`mesa-${mesa.mesaID}`")
					.contenido.flex.jcsb.aic
						.info
							b.nombre Ejemplo03
						.estados
							.estado Tiene conteo

						.botones

							a-button(type="primary"
								@click="switchDelColapsoDeMesa(mesa.mesaID)"
								shape="circle" 
								:icon="mesaExtendida === mesa.mesaID ? 'up' : 'down'")

					transition.elColapso
						.colapsable(v-if="mesaExtendida === mesa.mesaID")
							CargadorConteoMesa(:mesa="mesa" :local="local")






			//.mesas.anchoComun
				.mesa(v-for="mesa in mesas")
					.encabezado.flex.jcsb.aic
						.info
							.nombre {{mesa.nombre}}
						.estados
							.estado(v-if="$ahora.isBefore($fechaApertura)")
							.estado(v-else-if="$ahora.isBefore($fechaCierre)") En espera de hora de cierre
							.estado(v-else-if="mesa.tieneConteo") Tiene conteo
							.estado(v-else-if="$ahora.isBefore($fechaCierre)") En espera de hora de cierre

						//.botones
							a-button.db(disabled) Cierre
							a-button.db(disabled) Cerrada
							a-button.db(type="primary") Cerrar mesa {{mesa.nombre}}

						.botones
							a-button.db(v-if="$ahora.isBefore($fechaCierre)" disabled) Cerrar mesa {{mesa.nombre}}
							a-button.db(v-else-if="!_.isEmpty(mesa.conteos)" disabled) {{mesa.nombre}} Cerrada
							a-button.db(v-if="$ahora.isBefore($fechaCierre)" type="primary") Cerrar mesa {{mesa.nombre}}


	.my1em
		br
	.my1em
		br
	.my1em
		br
</template>
<script>
import CargadorConteoMesa from './-cargaConteoMesa.vue'
export default {
	components: { CargadorConteoMesa },
	data () {
		return {
			apoderadeExtendide: null,
			busquedaAsignados: '',
			busquedaDisponibles: '',
			busquedaMesa: '',

			mesaExtendida: null
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
		apoderadesAsignadosFiltrados () {
			const _ = this._
			const busqueda = this.$p(this.busquedaAsignados)
			if (_.isEmpty(busqueda)) return this.apoderadesAsignados
			return _.pickBy(this.apoderadesAsignados, apoderade => 
				this.$p(apoderade.nombre).includes(busqueda) ||
				this.$p(apoderade.apellido).includes(busqueda)
			)
		},
		apoderadesDisponibles () {
			const _ = this._
			if (_.isEmpty(this.apoderades)) return {}
			return _.pickBy(this.apoderades, apoderade => {
				const tieneAlgunaAsignacion = _.some(apoderade.territoriosAsignados || [], terr => {
					return terr.region || terr.localId
				})
				return !tieneAlgunaAsignacion
			})
		},
		apoderadesDisponiblesFiltrados () {
			const _ = this._
			const busqueda = this.$p(this.busquedaDisponibles)
			if (_.isEmpty(busqueda)) return this.apoderadesDisponibles
			return _.pickBy(this.apoderadesDisponibles, apoderade => 
				this.$p(apoderade.nombre).includes(busqueda) ||
				this.$p(apoderade.apellido).includes(busqueda)
			)
		},
		puedeDesignarApoderadoGeneral () {
			return this.$apoderade.tieneAccesoNacional || this._.some(this.$apoderade.asignaciones, a => a.capa === 'regional' && a.regionID === this.regionID) || this._.some(this.$apoderade.asignaciones, a => a.capa === 'comunal' && a.comunaID === this.comunaID)
		},
		puedeDesignarYHabilitarApoderadoMesa () {
			return this.$apoderade.tieneAccesoNacional || 
				this._.some(this.$apoderade.asignaciones, a => a.capa === 'regional' && a.regionID === this.regionID) ||
				this._.some(this.$apoderade.asignaciones, a => a.capa === 'comunal' && a.comunaID === this.comunaID) || 
				this._.some(this.$apoderade.asignaciones, a => a.capa === 'general' && a.localID === this.localID)
		},
		mesas () {
			const _ = this._
			const mesas = this.local.mesas || {}
			return _.orderBy(_.map(mesas, (mesa, mesaID) => {
				mesa.mesaID = mesaID
				mesa.nombre = mesa.mesa
				mesa.orden = _.padStart(mesa.nombre, 6, '0')
				mesa.tieneConteo = !_.isEmpty(mesa.conteos)
				return mesa
			}), m => m.orden)
		},
		mesasCerradas () {
			const _ = this._
			const mesas = this.local.mesas || {}
			return _.orderBy(_.map(mesas, (mesa, mesaID) => {
				mesa.mesaID = mesaID
				mesa.nombre = mesa.mesa
				mesa.orden = _.padStart(mesa.nombre, 6, '0')
				return mesa
			}), m => m.orden)
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
		async designarApoderadeMesa (usuarioID) {
			const fx = 'designarApoderadeMesa'
			const {regionID, comunaID, localID} = this
			const r = await this.$cuentaBack.asignarTerritorio({ usuarioID, regionID, comunaID, localID })
			console.log(fx, 'r', r)
			this.cargarLocal()
		},
		async designarApoderadeGeneral (usuarioID) {
			const fx = 'designarApoderadeGeneral'
			const {regionID, comunaID, localID} = this
			const r = await this.$cuentaBack.asignarTerritorio({ usuarioID, regionID, comunaID, localID, esApoGeneral: true })
			console.log(fx, 'r', r)
			this.cargarLocal()
		},
		switchDelColapsoDeMesa (mesaID) {
			if (this.mesaExtendida === mesaID) this.mesaExtendida = false
			else this.mesaExtendida = mesaID
		},
	}
}
</script>
<style lang="sass" scoped>
@import '@style/vars'
.local
	h2
		margin-bottom: 1rem
	.zonaApoderades
		h3
			margin-bottom: 0.5rem
		.apoderades
			margin-bottom: 2em
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

				.asignaciones
					flex: auto 1 1
					.asignacion
						+ .asignacion
							margin-top: 0.5rem
					//.asignacion
						display: inline-block
						background-color: #aaa
						color: white
						padding: .2em 1em
						border-radius: 6em
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


			.apoderade
				+radio
				+ .apoderade
					margin-top: 1em
				.contenido
					+radio
					transition: all .3s ease
					.zonaAcciones
						transition: all .3s ease
				.colapsable
					width: 100%
					padding: 0 1em
					+radio
					+saliendo
						max-height: 50vh
						overflow: hidden
					+salir
						max-height: 0
						opacity: 0
				&.extendide
					background-color: #ddd
					.contenido
						background-color: #eee
						box-shadow: 0 0 .3em rgba(0,0,0,.3)
						padding: .2em 0
						.zonaAcciones
							padding-right: .5em
					.colapsable
						// background-color: #ddd
						padding: 1em
						.acciones
							width: 100%




	.zonaMesas
		// +radio
		.resumenMesasLocal
			background-color: #F8f8f8
			+radio
			padding: 1em
			.resumenMesas
				display: flex
				align-items: center
				justify-content: space-around
				.item
					display: flex
					flex-flow: column nowrap
					justify-content: center
					align-items: center
					text-align: center
					.valor
						font-size: 3em
					.texto
			.acciones
				margin: 2em 0
				display: flex
				justify-content: center


		.mesas
			// display: flex
			// flex-flow: row wrap
			// justify-content: center


			.mesa
				+radio
				+ .mesa
					margin-top: 1em
				.contenido
					display: flex
					align-items: center
					+radio
					transition: all .3s ease
					.zonaAcciones
						transition: all .3s ease
				.colapsable
					width: 100%
					padding: 0 1em
					+radio
					+saliendo
						max-height: 50vh
						overflow: hidden
					+salir
						max-height: 0
						opacity: 0
				&.extendida
					background-color: #ddd
					.contenido
						background-color: #eee
						box-shadow: 0 0 .3em rgba(0,0,0,.3)
						padding: .5em 1em
						.zonaAcciones
							padding-right: .5em
					.colapsable
						padding: 1em
						.acciones
							width: 100%



			//.mesa
				// flex: 10em 1 0
				// max-width: 12em
				// border: 1px solid #777
				margin: 1em 0
				+radio
				text-align: center
				background-color: transparentize(black, .95)
				.encabezado
					padding: .5em 1em
					// background-color: transparentize(black, .5)
					// color: white
					+radio
					.nombre
						font-size: 1.2em
						+fwb
				.botones
					border: 1px solid #eee
				.conteo
					padding: .5em
					.item
						display: flex
						align-items: center
						.nombre
							text-align: right
							flex: 5em 0 0
						.valor	
							flex: auto 1 1
							text-align: center
				.conteox
					display: flex
					justify-content: center
					align-items: center
</style>
