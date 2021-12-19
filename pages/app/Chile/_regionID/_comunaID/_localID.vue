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
		a-alert.mb2em.tac(v-if="esApoderadeGeneralDelLocal" type="success" message="Eres apoderada/o general en este local") 
		a-alert.mb2em.tac(v-if="esApoderadeDelLocal && !esApoderadeDelLocalYHabilitade" type="warning" message="Para utilizar ingresar información, tu apoderado general debe habilitarte en esta misma página") 
		a-alert.mb2em.tac(v-else-if="esApoderadeDelLocal" type="success" message="Eres apoderada/o en este local") 
		//- a-alert.mb2em.tac(v-else-if="esApoderadeDelLocal" type="success" message="Eres apoderada/o en este local") 

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
							//- span.nombre {{apoderade.usuarioID}}

						.zonaAcciones.f00.flex.aic

							div(v-if="_.some(apoderade.asignaciones, a => (a.capa === 'general' && a.localID === localID))")

							div.exito.m1em(v-else-if="local.apoderadesHabilitades && local.apoderadesHabilitades.includes(apoderade.usuarioID)") Habilitada/o
							.mr05rem(v-else-if="_.some(apoderade.asignaciones, a => a.capa === 'mesa' && a.localID === localID)")
								a-button(v-if="esApoderadeGeneralDelLocal" @click="habilitarApoderade(usuarioID)" type="primary") Habilitar
								div(v-else) #[b No] habilitada/o

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
			
			
		.zonaResumenMesas
			.p1em
			//.WIP(v-if="!$dev")
				.icono 🌱
				.texto Pronto disponible
			.resumenMesasLocal
				.cerrado(v-if="local.cerrado")
				.info.flex.ffcn.aic.jcc.tac.my1em(v-else-if="$ahora.isBefore($fechaApertura)")
					a-alert.my1em.tac(type="warning")
						div(slot="message") 
							.icono.fz2em.mb05rem 🕖
							div Esperando hora de apertura de mesas
							div
								b {{$fechaApertura.from($ahora)}}
							.p1em
							p A partir de las 17:30 se abrirá el acceso para que los apoderados del local puedan cargar conteos de votos, cargar foto del acta y guardar en la plataforma.
							p Apoderados #[b generales] podrán entonces, una vez revisado el conteo de cada mesa, marcar el local como cerrado. Una vez cerrado no se podrá realizar modificaciones.

				.info.flex.ffcn.aic.jcc.tac.my1em(v-else-if="$ahora.isBefore($fechaCierre)")
					a-alert.my1em.tac(type="warning")
						div(slot="message") 
							.icono.fz2em.mb05rem 🕠
							div Cierre de mesas estará disponible
							div
								b {{$fechaCierre.from($ahora)}}
							.p1em

							p A partir de las 17:30 se abrirá el acceso para que los apoderados del local puedan cargar conteos de votos, cargar foto del acta y guardar en la plataforma.
							p Apoderados #[b generales] podrán entonces, una vez revisado el conteo de cada mesa, marcar el local como cerrado. Una vez cerrado no se podrá realizar modificaciones.

				.info.flex.ffcn.aic.jcc.tac.my1em(v-else)
					a-alert.my1em.tac(type="success")
						div(slot="message")
							.icono.fz2em.mb05rem 🗳
							.fwb.mb05rem Cierre de mesas disponible
							.p1em

							p Los apoderados del local están habilitados para cargar conteos de votos, cargar foto del acta y marcar la mesa cerrada.
							p Apoderados #[b generales] pueden, una vez revisado el conteo de cada mesa, marcar el local como cerrado. Una vez cerrado no se podrá realizar modificaciones.


				.resumenMesas

					.item.f11
						.valor {{mesas.length}}
						.texto Mesas

					.item.f11
						.valor {{_.filter(mesas, m => !_.isEmpty(m.conteos)).length}}
						.texto Mesas con conteo

					.item.f11
						.valor {{_.filter(mesas, m => !_.isEmpty(m.conteoSeleccionado)).length}}
						.texto Con conteo definitivo

				.localCerrado.mt1em(v-if="local.cerrado")
					.p1em
					.tac.flex.jcc.aic
						h1 Local cerrado

					.resultadosLocal.p1em(v-if="resultados")
						h2.my1rem.tac Resultados
						.resumenResultados.mt1em

							.item.f11
								.valor {{resultados.Boric}}
								.texto Boric

							.item.f11
								.valor {{resultados.Kast}}
								.texto Kast

							.item.f11
								.valor {{resultados.nulos}}
								.texto Nulos

							.item.f11
								.valor {{resultados.blancos}}
								.texto Blancos

				.accionesAGeneral.mw100.mt1em.pt1em(v-else-if="esApoderadeGeneralDelLocal")
					.p1em
						h3 Cierre de local
						p Una vez cerrado no se pueden realizar más modificaciones
					div.p1em(v-if="_.filter(mesas, m => !_.isEmpty(m.conteoSeleccionado)).length === mesas.length ")
						a-button.db.w100.verde(size="large" type="primary" @click="intentarCerrarLocal") Cerrar local

					div.p1em(v-else-if="_.filter(mesas, m => !_.isEmpty(m.conteoSeleccionado)).length === mesas.length ")
						i.db.mb05rem.tac Cada mesa debe tener un conteo marcado válido para cerrar local
						a-button.db.w100(size="large" type="info"  @click="intentarCerrarLocal" ) No se puede cerrar local

					div.p1em(v-else-if="_.filter(mesas, m => !_.isEmpty(m.conteos)).length === mesas.length ")
						i.db.mb05rem.tac Cada mesa debe tener un conteo y además elegir uno en cada mesa
						a-button.db.w100(size="large" type="info"  @click="intentarCerrarLocal" ) No se puede cerrar local
						


		.p1em
		.p1em
		.zonaMesas(v-if="!esApoderadeDelLocalYHabilitade")
			a-alert.mb2em.tac(type="warning" message="Solicita a tu apoderada o apoderado general que te habilite para cargar conteos de votos, actar y más") 

		.zonaMesas(v-if="esApoderadeDelLocalYHabilitade")
			h2 Mesas



			.filtros.mt1em
				a-input(v-if="!_.isEmpty(mesas)" v-model="busquedaMesa" allow-clear placeholder='Numero')

			.mesas.mt1em
				.mesa(v-for="mesa in mesasFiltradas"
					:class="{ extendida: mesaExtendida === mesa.mesaID, cerrada: !_.isEmpty(mesa.conteoSeleccionado), conConteo: !_.isEmpty(mesa.conteos) }" :key="`mesa-${mesa.mesaID}`")
					.contenido.flex.jcsb.aic
						.zonaAvatar.f00
							.avatar(@click="switchDelColapsoDeMesa(mesa.mesaID)") {{mesa.nombre}}

						.estados.f11.mx1rem
							.aunNo(v-if="$ahora.isBefore($fechaApertura)") Esperando hora de apertura y luego cierre
							.aunNo(v-else-if="$ahora.isBefore($fechaCierre)") Esperando hora de cierre
							.estado.atencion(v-else-if="_.isEmpty(mesa.conteos)") Aún no se carga conteo
							.estado.atencion(v-else-if="_.isEmpty(mesa.conteoSeleccionado)") 
								div.exito Conteo cargado
								div.atencion Apoderada/o general debe elegir/marcar conteo valido.
							.estado.atencion(v-else-if="Object.keys(mesa.conteos).length > 1") Conflicto por varios conteos
							.estado.exito(v-else) Mesa cerrada

							.conteoSeleccionado(v-if="mesa.conteoSeleccionado")
								.conteo(v-for="conteo in [mesa.conteos[mesa.conteoSeleccionado]]")
									.votos
										.item
											.nombre Bor
											.valor() {{conteo.votos.Boric}}
										.item
											.nombre Kas
											.valor() {{conteo.votos.Kast}}
										.item
											.nombre bla
											.valor() {{conteo.votos.blancos}}
										.item
											.nombre nul
											.valor() {{conteo.votos.nulos}}

						.botones(v-if="!local.cerrado")
							a-button(:disabled="$ahora.isBefore($fechaCierre)"
								@click="switchDelColapsoDeMesa(mesa.mesaID)"
								shape="circle" 
								:type="mesaExtendida === mesa.mesaID ? 'default' : 'info'"
								:icon="mesaExtendida === mesa.mesaID ? 'up' : 'down'")

					transition.elColapso
						.colapsable(v-if="mesaExtendida === mesa.mesaID")

							.apoGeneral(v-if="esApoderadeGeneralDelLocal")
								.conteosDeVotos
									.conteo(v-for="(conteo, usuarioID) in mesa.conteos")
										.flex.jcsb.aic.w100
											.votos.f00
												.item
													.nombre Bor
													.valor() {{conteo.votos.Boric}}
												.item
													.nombre Kas
													.valor() {{conteo.votos.Kast}}
												.item
													.nombre bla
													.valor() {{conteo.votos.blancos}}
												.item
													.nombre nul
													.valor() {{conteo.votos.nulos}}
											.acta.f00
												a.db.fwb.mx1em(:href="conteo.votos.actaURL" target="_blank") Acta
											.accion
												.icono(v-if="mesa.conteoSeleccionado === usuarioID") ✅
												a-button.p05em.df.aic.jcc.tac.verde(v-else type="primary"
													@click="elegirConteoParaMesa(mesa.mesaID, usuarioID)") Elegir



							CargadorConteoMesa(v-if="esApoderadeDelLocal" :mesa="mesa" :local="local" @yaTieneConteo="cargarLocal" @conteoGuardado="cargarLocal")
								div(slot-scope="{ abrir }")
									a-button.w100.my1em(v-if="_.isEmpty(mesa.conteos)" type="primary" @click="abrir") Cargar conteo y cierre de mesa
									a-button.w100.my1em(v-else-if="_.isEmpty(mesa.conteoSeleccionado)" @click="abrir") Cargar otro conteo (Solo si hubo error)



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
		esApoderadeDelLocal () {
			return this._.some(this.$apoderade.asignaciones, a => a.capa === 'general' && a.localID === this.localID) ||
				this._.some(this.$apoderade.asignaciones, a => a.capa === 'mesa' && a.localID === this.localID)
		},
		esApoderadeDelLocalYHabilitade () {
			return this.esApoderadeGeneralDelLocal || (this.local.apoderadesHabilitades && this.local.apoderadesHabilitades.includes(this.$apoderade.usuarioID) &&
				this._.some(this.$apoderade.asignaciones, a => a.capa === 'mesa' && a.localID === this.localID))
		},
		esApoderadeGeneralDelLocal () {
			return this._.some(this.$apoderade.asignaciones, a => a.capa === 'general' && a.localID === this.localID)
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
		mesasFiltradas () {
			const _ = this._
			const busqueda = this.$p(this.busquedaMesa)
			const mesas = this.local.mesas || {}
			const filtradas = _.filter(mesas, mesa => 
				this.$p(mesa.nombre).includes(busqueda)
			)
			return _.orderBy(filtradas, m => m.orden)
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
		},
		resultados () {
			const _ = this._
			const mesas = this.local.mesas || {}
			return _.reduce(mesas, (resultado, mesa, mesaID) => {
				const conteoSeleccionado = mesa.conteoSeleccionado
				const conteoValido = conteoSeleccionado && mesa.conteos && mesa.conteos[conteoSeleccionado]

				if (!conteoValido) return resultado
				const votos = conteoValido.votos
				resultado.Boric = resultado.Boric + (votos.Boric || 0)
				resultado.Kast = resultado.Kast + (votos.Kast || 0)
				resultado.nulos = resultado.nulos + (votos.nulos || 0)
				resultado.blancos = resultado.blancos + (votos.blancos || 0)

				resultado.mesasContadas += 1

				return resultado
			}, {Boric: 0, Kast: 0, nulos: 0, blancos: 0, mesasContadas: 0})
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
			if (this.$ahora.isBefore(this.$fechaCierre)) {
				this.mesaExtendida = false
				return
			}
			if (this.local.cerrado) {
				this.mesaExtendida = false
				return
			}
			if (this.mesaExtendida === mesaID) this.mesaExtendida = false
			else this.mesaExtendida = mesaID
		},
		async intentarCerrarLocal () {
			const fx = 'intentarCerrarLocal'
			try {
				const _ = this._
				await this.cargarLocal()
				const mesas = this.local.mesas
				const algunaSinContar = _.some(mesas, mesa => _.isEmpty(mesa.conteos))
				if (algunaSinContar) {
					const sinContar = _.filter(mesas, mesa => _.isEmpty(mesa.conteos))
					const nombres = _.map(sinContar, mesa => mesa.nombre)
					this.$info({
						title: 'Hay mesas que no han sido cargadas:',
						content: `Mesas: ${nombres.join(', ')}`,
					})
				}
				const algunaSinSeleccionar = _.some(mesas, mesa => _.isEmpty(mesa.conteoSeleccionado))
				if (algunaSinSeleccionar) {
					const sinSeleccionar = _.filter(mesas, mesa => _.isEmpty(mesa.conteoSeleccionado))
					const nombres = _.map(sinSeleccionar, mesa => mesa.nombre)
					this.$info({
						title: 'Hay mesas cuyo conteo no ha sido validado',
						content: `Mesas: ${nombres.join(', ')}`,
					})
				}
				const { regionID, comunaID, localID } = this.local
				const r  = await this.$cuentaBack.cerrarLocal({regionID, comunaID, localID})
				this.$consolo.log(fx, r)
				this.cargarLocal()
			} catch (e) {
				console.error(fx, e)
				this.cargarLocal()
			}
		},
		async elegirConteoParaMesa (mesaID, conteoID) {
			const fx = 'elegirConteoParaMesa'
			try {
				const { regionID, comunaID, localID } = this.local
				const r = await this.$cuentaBack.elegirConteoParaMesa({regionID, comunaID, localID, mesaID, conteoID})
				this.$consolo.log(fx, r)
				this.cargarLocal()
			} catch (e) {
				console.error(fx, e)
			}
		},
		async habilitarApoderade (usuarioID) {
			const fx = 'habilitarApoderade'
			try {
				const { regionID, comunaID, localID } = this.local
				const r = await this.$cuentaBack.habilitarApoderade({regionID, comunaID, localID, usuarioID})
				this.$consolo.log(fx, r)
				this.cargarLocal()
			} catch (e) {
				console.error(fx, e)
			}

		}
	}
}
</script>
<style lang="sass" scoped>
@import '@style/vars'

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

	.resumenResultados
		display: flex
		background-color: white
		padding: 1em
		+radio
		.item
			flex: 5em 1 1
			text-align: center
			.valor
				font-size: 2em


	.zonaResumenMesas
		.resumenMesasLocal
			background-color: #F8f8f8
			+radio
			padding: 1em
			.resumenMesas
				display: flex
				// align-items: center
				justify-content: space-around
				.item
					display: flex
					flex-flow: column nowrap
					// justify-content: center
					align-items: center
					text-align: center
					width: 6em
					.valor
						font-size: 2em
					// .texto
			.acciones
				margin: 2em 0
				display: flex
				justify-content: center

	.zonaResumenMesas,
	.zonaMesas
		.mesas
			// width: 300px
			// max-width: 100%
			// margin: 0 auto
			.mesa
				+radio
				+ .mesa
					margin-top: 2em

				.contenido
					display: flex
					align-items: center
					+radio
					transition: all .3s ease

					.avatar
						background-color: #eee
						font-size: 1.4em
						$lado: 4rem
						width: $lado
						height: $lado
						border-radius: 10rem
						border: 2px solid transparent

						display: flex
						justify-content: center
						align-items: center
						text-align: center
					.atencion
						color: orangered
					.exito
						color: seagreen
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


				&.conConteo
					.avatar
						border: 2px solid seagreen
						color: seagreen
				&.cerrada
					.avatar
						background-color: seagreen
						background-image: none
						color: white


.apoGeneral .conteosDeVotos,
.conteoSeleccionado
	.conteo
		+ .conteo
			margin-top: 1em
		.votos
			display: flex
			align-items: center
			.item
				margin-left: 1em
				&:first-child
					margin-left: 0
				.nombre	
					+fwb
					text-transform: uppercase
				.valor
					text-align: center
		.acta
			display: flex
			align-items: center

</style>
