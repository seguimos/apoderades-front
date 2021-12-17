<template lang="pug">
.appApoderadesIndex

	.wrapperConPasos
		a-steps(progress-dot :current='paso' direction='vertical')

			a-step(title="Búsqueda")
				div(slot="description")
					div(v-if="!rut")
						//- div Busca al apo
						checkPorRut(ref="checkPorRut" @noInscrite="iniciarInscripcion" @inscrite="cargarApoderade")
					.rut(v-else)
						div {{formatearRut(rut)}}
						a-button(@click="buscarOtroRut") Buscar otro rut


			a-step(:title="!rut? 'Inscripción' : !usuarioID? 'Inscribir' : 'Inscripción realizada'")
				div(slot="description")
					div(v-if="!usuarioID && etapa !== 'datosPersonales'")
						div Si a quien corresponde al rut no se le ha inscrito, podrás incribirle aquí
					div(v-else-if="!puedeInscribir")
						div Si a quien pertenece el rut desea ser apoderado, por favor solicita a tu apoderado general, o coordinador comunal o regional que le inscriba.
					div(v-else-if="!usuarioID")
						//- div Todo listo aquí
						creadorApoderade(ref="creadorApoderade" @buscarRut="pasarAEtapa()" :rut="rut" @incripcionRealizada="cargarApoderade")
					div(v-else-if="!datosApoderade")
						a-icon(type="loading")
					div(v-else)
						.nombre {{datosApoderade.nombre}} {{datosApoderade.apellido}}.

			a-step(title='Asignación de local/territorio')
				div(slot="description")
					div(v-if="!['estadoYOpcionesAsignacion', 'asignacionTerritorial'].includes(etapa)")
						div Aquí verás los locales/territorios asignados al apoderado inscrito
					div(v-else-if="!datosApoderade")
						a-icon(type="loading")
					div(v-else)

						.asignaciones(v-if="!_.isEmpty(datosApoderade.territoriosAsignados)")
							.elementoAsignacion(v-for="terr in datosApoderade.territoriosAsignados" )
								miniTarjetaAsignacion(:territorioAsignado="terr" :usuarioID="datosApoderade.usuarioID" mostrarDesasignar)
								a-divider.separador


						a-alert.noAsignade(v-else banner message="Aún no se ha asignado local/territorio") 

						.opcionesAsignacion(v-if="etapa === 'estadoYOpcionesAsignacion' && !_.isEmpty(alternativasAsignacion)")
							.info Puedes asignarle los siguientes roles

							.alternativas
								a-button.alternativa.w100.casiBpStyle(v-if="alternativasAsignacion.includes('regional')"
									@click="abrirAsignadorTerritorio('regional')") Coordinación regional
								a-button.alternativa.w100.casiBpStyle(v-if="alternativasAsignacion.includes('comunal')"
									@click="abrirAsignadorTerritorio('comunal')") Coordinación comunal
								a-button.alternativa.w100.casiBpStyle(v-if="alternativasAsignacion.includes('general')"
									@click="abrirAsignadorTerritorio('general')") Apoderado general
								a-button.alternativa.w100.casiBpStyle(v-if="alternativasAsignacion.includes('mesa')"
									@click="abrirAsignadorTerritorio('mesa')") Apoderado de mesa

			a-step.pasoAsignacionTerritorial(v-if="etapa === 'asignacionTerritorial'")
				.flex.jcsb.aic.w100(slot="title")
					div
						div Asignando como
						div.rol(v-if="tipoAsignacion === 'regional'") Coordinación regional
						div.rol(v-else-if="tipoAsignacion === 'comunal'") Coordinación comunal
						div.rol(v-else-if="tipoAsignacion === 'general'") Apoderado general
						div.rol(v-else-if="tipoAsignacion === 'mesa'") Apoderado de mesa
					a-icon(type="close" @click="pasarAEtapa('estadoYOpcionesAsignacion')")
				div(slot="description")
					asignadorTerritorio(ref="asignadorTerritorio" :usuarioID="usuarioID" :tipoAsignacion="tipoAsignacion" @asignacionRealizada="asignacionRealizada" @cancelar="cerrarAsignadorTerritorio")



</template>
<script>
import Rut from 'rut.js'
import checkPorRut from './-checkPorRut'
import creadorApoderade from './-creadorApoderade'
import asignadorTerritorio from './-asignadorTerritorio'

export default {
	components: { checkPorRut, creadorApoderade, asignadorTerritorio },
	data () {
		return {
			etapa: undefined,
			paso: undefined,
			rut: undefined,
			usuarioID: undefined,
			datosApoderade: undefined,
			tipoAsignacion: undefined
		}
	},
	computed: {
		puedeInscribir () { return this.alternativasAsignacion.includes('mesa') },
		alternativasAsignacion () {
			if (this.$apoderade.tieneAccesoNacional) return ['regional', 'comunal', 'general', 'mesa']
			const _ = this._
			if (_.isEmpty(this.$apoderade.territoriosAsignados)) return []
			let alternativas = []
			_.forEach(this.$apoderade.territoriosAsignados, asignacion => {
				const { region, comunaCodigo, localId, esApoderadoGeneral } = asignacion
				if (localId && !esApoderadoGeneral) return
				if (localId) alternativas.push('mesa')
				else if (comunaCodigo) alternativas.push('general')
				else if (region) alternativas.push('comunal')
			})
			alternativas = _.uniq(alternativas)
			if (alternativas.includes('comunal')) return ['comunal', 'general', 'mesa']
			if (alternativas.includes('general')) return ['general', 'mesa']
			if (alternativas.includes('mesa')) return ['mesa']
			return alternativas
		},
	},
	methods: {
		pasarAEtapa (etapa) { 
			this.etapa = etapa
			const etapasPasos = {
				datosPersonales: 1,
				estadoYOpcionesAsignacion: 2,
				asignacionTerritorial: 3,
			}
			this.paso = (etapa && etapasPasos[etapa]) || 0
		},
		formatearRut (rut) { return Rut.format(rut)},
		buscarOtroRut () {
			this.rut = null
			this.usuarioID = null
			this.datosApoderade = null
			this.tipoAsignacion = null
			this.pasarAEtapa(null)
		},
		iniciarInscripcion (rut) {
			console.log('iniciarInscripcion', rut)
			this.rut = rut
			const vm = this
			this.$nextTick(() => { vm.pasarAEtapa('datosPersonales') })
		},
		async cargarApoderade ({rut, usuarioID, nombre, apellido}) {
			console.log('cargarApoderade', {usuarioID, nombre, apellido})
			this.pasarAEtapa('estadoYOpcionesAsignacion')
			const _ = this._
			this.rut = rut
			this.usuarioID = usuarioID
			const r = await this.$cuentaBack.obtenerApoderade(usuarioID)
			this.datosApoderade = { ...r.apoderade, nombre, apellido }

			// Cargar info de locales 
			const localesPorCargar = []
			const territorioPreferencia = _.get(r, ['apoderade', 'territorioPreferencia'])
			if (territorioPreferencia) {
				const {localId, region} = territorioPreferencia
				localesPorCargar.push({regionID: region, localID: localId})
			}

			const territoriosAsignados = _.get(r, ['apoderade', 'territoriosAsignados'])
			if (territoriosAsignados && !_.isEmpty(territoriosAsignados)) {
				_.forEach(territoriosAsignados, territorio => {
					const {localId, region} = territorio
					if (localId && region) localesPorCargar.push({regionID: region, localID: localId})
				})
			}

			await Promise.all(_.map(localesPorCargar, async local => await this.$cuentaBack.localPorID(local.regionID, local.localID)))
		},
		abrirAsignadorTerritorio (tipoAsignacion) {
			console.log('abrirAsignadorTerritorio', tipoAsignacion)
			this.pasarAEtapa('asignacionTerritorial')
			this.tipoAsignacion = tipoAsignacion
		},
		cerrarAsignadorTerritorio () {
			console.log('cerrarAsignadorTerritorio')
			this.pasarAEtapa('estadoYOpcionesAsignacion')
			this.tipoAsignacion = null
		},
		asignacionRealizada () {
			console.log('asignacionRealizada')
			const { usuarioID, nombre, apellido} = this.datosApoderade
			const rut = this.rut
			this.cargarApoderade({rut, usuarioID, nombre, apellido})
		}
	},
};
</script>
<style lang="sass" scoped>
@import '@style/vars'
.appApoderadesIndex
	margin: 0 auto
	max-width: 100%
	width: 400px
	.wrapperConPasos
		margin-left: -.5em

	&::v-deep
		.ant-steps-item-title
			margin-bottom: 0.5rem
			padding-right: 0
			width: 100%
		.ant-steps-item-content
			width: auto

	.rut
		display: flex
		justify-content: space-between
	.noAsignade
		margin: 0.5em 0
	.opcionesAsignacion
		margin-top: 3em
		.info
			font-style: italic
		.alternativas
			.alternativa
				margin-top: 1em

	::v-deep .ant-steps-item-content
		padding: 0.3rem
	.asignaciones
		.separador
			margin: .5em 0
			&:last-child
				display: none


.pasoAsignacionTerritorial
	.rol
		color: $azul2
		// text-shadow: .5px .5px 0 $azul1, 1px 1px 0 $azul1, 1.5px 1.5px 0 $azul1
</style>
