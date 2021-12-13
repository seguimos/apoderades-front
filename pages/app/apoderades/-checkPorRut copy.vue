<template lang="pug">
.checkPorRut

	a-form-model(ref="rutForm" :model="rutForm" :rules="reglasFormRut")
		a-form-model-item(has-feedback prop="rut" label="Ingresa RUT del apoderado")
			a-input.input(ref="inputRut" v-model="rutForm.rut" type="rut" allow-clear)
		a-form-model-item
			a-button.w100.bpStyle.verde(type="primary" @click="checkRutOBuscarOtro"
				:loading="revisandoRut") 
				| {{rutBuscado? 'BUSCAR OTRO' : revisandoRut? 'BUSCANDO' : 'BUSCAR'}}

	//- export interface ApoderadeModel {
	//-   _id?: ObjectId;
	//-   territorioPreferencia?: TerritorioPreferenciaModel;
	//-   territoriosAsignados?: TerritorioAsignadoModel[];
	//-   tieneAccesoNacional?: boolean;
	//-   fechaValidacionDatos?: Date;
	//- }

	.resultado(v-if="rutBuscado")
		div(v-if="usuarioID") 
			a-divider Apoderado existente


			a-list-item(slot='renderItem')
				a-list-item-meta(:description='apoderadeNombre')
					b(slot='title') Nombre
					//- .emoji(slot='avatar') 
						div 🙋🏽

			div(v-if="!apoderadeDatos") 
				a-icon(type="loading")

			div(v-else) 

				div(v-if="apoderadeDatos.tieneAccesoNacional")
					a-list-item
						a-list-item-meta
							b(slot='title') Nivel de acceso
							div(slot='description') Nacional

				div(v-if="!apoderadeDatos.territorio")
					a-list-item
						a-list-item-meta
							b(slot='title') Territorio asignado
							div(slot='description') No hay registro de territorio asignado

				div(v-else)
					a-list-item
						a-list-item-meta(description='datosApoderade')
							b(slot='title') Territorio asignado
							div(slot='description') Nombre de local - Comuna - Región

				// ========= Territorio de preferencia ============
				a-list-item
					a-list-item-meta(description='')
						b(slot='title') Territorio de preferencia
						div(slot='description') 
							div(v-if="!territorioPreferencia") No hay registro de preferencia 


				.acciones
					a-button.w100.bpStyle.verde(type="primary" @click="$emit('quiereAsignar', usuarioID)"
						v-if="puedeAsignarTerritorio") Asignar territorio


		div(v-else) 
			a-divider Rut no registrado
			a-button.w100.bpStyle.verde(@click="$emit('quiereIncribir', rutBuscado)") Inscribir nuevo apoderado

</template>
<script>
import { regionesYSusComunas } from '@lib/regioneschile'
import { Validado } from "@lib/validador"
export default {
	data () {
		return {
			// Rut
			rutForm: { rut: undefined },
			usuarioID: undefined,
			apoderadeNombre: undefined,
			rutBuscado: undefined,
			apoderadeDatos: undefined,
			revisandoRut: false
		}
	},
	computed: {
		reglasFormRut () {
			const rutValidador = (rule, value, callback) => {
				if (!value) return callback(new Error("Ingresa tu rut"));
				if (value.length < 8) return callback(new Error("Ingresa un rut valido"));
				const validado = Validado.rut(value)
				if (!validado) return callback(new Error("Ingresa un rut valido"));
				return callback();
			};
			return { 
				rut: [{ required: true, message: '*', whitespace: false }, { validator: rutValidador, trigger: "change" }] 
			}
		},
		// Permisos
		puedeAsignarTerritorio () {
			const _ = this._
			return this.$apoderade.tieneAccesoNacional || !_.isEmpty(this.$apoderade.territoriosAsignados)
		},


		// Datos obtenidos de búsqueda
		territorioPreferencia () {
			const _ = this._
			const ad = this.apoderadeDatos

			if (!ad.territorioPreferencia) return false
			const { localId: localID, region: regionID } = ad.territorioPreferencia
			const local = localID && _.get(this.$store.state.locales, localID)
			const region = regionID && _.get(regionesYSusComunas, (reg, regID) => regID === regionID)
			return {
				title: 'Territorio de preferencia',
				local,
				region
			}
		},
		territoriosAsignados () {
			const _ = this._
			const ad = this.apoderadeDatos
			const territoriosAsignados = []
			// Territorios asignados
			if (ad.territoriosAsignados && !_.isEmpty(ad.territoriosAsignados)) {
				_.forEach(ad.territoriosAsignados, territorioAsignado => {
					const {region: regionID, comunaCodigo: comunaID, localId, esApoderadoGeneral} = territorioAsignado
					const localasignado = localId && _.get(this.$store.state.locales, localId)
					territoriosAsignados.push({
						avatar: '',
						title: 'Territorio asignado',
						description: localasignado && localasignado.nombre,
						esApoderadoGeneral,
						regionID,
						comunaID
					})
					// region?: string;
					// comunaCodigo?: string;
					// llavePublicaAsignador?: string;
					// localId?: string;
					// esApoderadoGeneral?: boolean;
				})
			}
			return territoriosAsignados
		},
		datosApoderade () {
			const _ = this._
			const ad = this.apoderadeDatos

			let territorioPreferencia
			if (ad.territorioPreferencia) {
				const { localId } = ad.territorioPreferencia
				const local = localId && _.get(this.$store.state.locales, localId)
				territorioPreferencia = {
				// avatar: '',
					title: 'Territorio de preferencia',
					description: local && local.nombre
				}
			} else {
				territorioPreferencia = {
				// avatar: '',
					title: 'Territorio de preferencia',
					description: 'No hay registro de preferencia'
				}
			}
			const tieneAccesoNacional = {
				avatar: '',
				title: 'Territorio asignado',
				description: ad.tieneAccesoNacional ? '' : ''
			}
			const fechaValidacionDatos = {
				avatar: '',
				title: 'Ha completado su registro en la app',
				description: ad.fechaValidacionDatos ? 'Si' : 'No'
			}
			const datos = [
				territorioPreferencia,
				tieneAccesoNacional,
				fechaValidacionDatos
			]
			return datos
		}
	},
	methods: {
		checkRut() {
			this.$refs.rutForm.validate(async valid => {
				if (!valid) return false;
				const rut = this.rutForm.rut
				this.revisandoRut = true
				const r = await this.$cuentaBack.buscarXRut(Validado.rut(rut) );
				console.log("checkRut r", r);

				this.revisandoRut = false
				this.rutBuscado = rut
				this.apoderadeNombre = `${r.nombre} ${r.apellido}`
				this.usuarioID = r.usuarioID || null
				if (r.usuarioID) {
					const c = await this.obtenerApoderade(r.usuarioID)
					console.log("carga apoderade c", c);
				}
			});
		},
		checkRutOBuscarOtro () {
			if (this.rutForm.rut === this.rutBuscado) {
				this.rutForm.rut = undefined
				this.$refs.inputRut.focus()
			} else this.checkRut()
		},
		async obtenerApoderade (apoderadeID) {
			const _ = this._
			const r = await this.$cuentaBack.obtenerApoderade(apoderadeID)
			this.apoderadeDatos = r.apoderade

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
		}
	}
}
</script>
<style lang="sass" scoped>
// .checkPorRut
</style>
