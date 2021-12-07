<template lang="pug">
.rootFormIngreso
	transition(mode="out-in" :duration="300")

		// RECUPERACION PASSWORD
		SesionUsuarioConectado.usuarioConectado(v-if="$usuario" key="conectado")


		// INGRESO
		a-form-model.formIngreso(v-else-if="modoActivo === 'ingreso'" key="ingreso"
			:model="cuenta"
			layout="vertical"
			ref="formIngreso"
			:rules="reglasIngreso")

			h1.titulo {{ $t('ingresaATuCuenta') }}

			a-form-model-item(prop="email" :label="$t('correo')")
				a-input(
					v-enfocar
					v-model="cuenta.email"
					:placeholder="$t('correo')"
					type="email"
					@keyup.enter="pasarA($refs.iPassword)"
					autocomplete="email"
				)
					a-icon(slot="prefix" type="mail")

			a-form-model-item(prop="password"
				:help="passIncorrectos.includes(cuenta.password) ? $t('passIncorrecto') : ''"
				:validateStatus="passIncorrectos.includes(cuenta.password) ? 'error' : ''")

				div.flex.jcsb(slot="label")
					label {{$t('contrasena')}}
					a.passOlvidada(@click="modoActivo = 'recuperarPass'") Olvidada?

				a-input-password(
					ref="iPassword"
					v-model="cuenta.password"
					:placeholder="$t('contrasena')"
					autocomplete="password"
					@keyup.enter="procesarIngreso"
				)
					a-icon(slot="prefix" type="key")

			.accion
				a-form-model-item
					a-button.w-100(type="primary" block
						@click="procesarIngreso"
						:loading="conectando"
						:disabled="passIncorrectos.includes(cuenta.password)"
						) {{ conectando ? $t('conectando') : $t('ingresar') }}
				a-form-model-item
					.cambioModo
						| {{$t('eresNuevo')}}
						a(@click="modoActivo = 'registro'") {{" "}}{{$t('registrate')}}



		// REGISTRO
		a-form-model.formRegistro(v-else-if="modoActivo === 'registro'" key="registro"
			:model="cuenta"
			layout="vertical"
			ref="formRegistro"
			:rules="reglasRegistro")

			h1.titulo {{ $t('creaTuCuenta') }}

			.grupoCampos

				a-form-model-item(prop="nombre" :label="$t('nombre')")
					a-input(v-enfocar v-model="cuenta.nombre" :placeholder="$t('nombre')" autocomplete="given-name")

				a-form-model-item(prop="apellido" :label="$t('apellido')")
					a-input(v-model="cuenta.apellido" :placeholder="$t('apellido')" autocomplete="family-name")

			a-form-model-item(prop="email" :label="$t('correo')")
				a-input(v-model="cuenta.email" :placeholder="$t('correo')" type="email" autocomplete="email")
					a-icon(slot="prefix" type="mail")

			a-form-model-item(prop="password" :label="$t('contrasena')")
				a-input-password(v-model="cuenta.password" :placeholder="$t('contrasena')" autocomplete="new-password")
					a-icon(slot="prefix" type="key")

			.accion
				a-form-model-item
					a-button.w-100(type="primary" @click="procesarRegistro" :loading="conectando")
						| {{ conectando ? $t('creandoCuenta') : $t('crearla') }}
				a-form-model-item
					.cambioModo
						| {{$t('yaTienes')}}
						a(@click="modoActivo = 'ingreso'") {{" "}}{{$t('ingresa')}}


		// RECUPERACION PASSWORD
		SesionRecuPass.laRecuPass(v-else-if="modoActivo === 'recuperarPass'" key="recuperarPass"
			:email="cuenta.email"
			@volver="modoActivo = 'ingreso'"
			@ingresarConNuevoPass="ingresar")


	.sinConexion.flex.aic(v-if="$cuentaSinConexion" @click="$cuenta.ping()")
		.oicono.enchufe
		.texto {{$t('errorDeRed')}}
</template>
<script>
export default {
	name: 'Ingreso',
	directives: {
		enfocar: {
			inserted (el) {
				el.focus()
			}
		}
	},
	props: {
		modo: { type: String, required: false, default: 'ingreso' }
	},
	data () {
		// console.log('IGRESO DATA this.modo', this.modo)

		let modoActivo = 'ingreso'
		if (this.modo && 'ingreso registro'.split(' ').includes(this.modo)) modoActivo = this.modo

		const cuenta = process.env.dev ? { nombre: 'Timothée', apellido: 'Chalamet', email: 'tcha@obiqu.com', password: 'sererere', confirmacion: 'sererere' } : { nombre: '', apellido: '', email: '', password: '', confirmacion: '' }
		return {
			modoActivo,
			// modoActivo: 'recuperarPass',
			conectando: false,
			error: null,

			// cuenta: { nombre: '', apellido: '', email: '', password: '', confirmacion: '' },
			cuenta,

			passIncorrectos: []
		}
	},
	computed: {
		reglasIngreso () {
			return {
				email: [{ type: 'email', message: this.$t('emailInvalido') }, { required: true, message: this.$t('ingresaTuEmail') }],
				password: [{ required: true, message: this.$t('noOlvidesEsto') }, { type: 'string', min: 1, message: this.$t('muyCorto') }]
			}
		},
		reglasRegistro () {
			return {
				nombre: [{ required: true, message: '*', whitespace: true }],
				apellido: [{ required: true, message: '*', whitespace: true }],

				email: [{ type: 'email', message: this.$t('emailInvalido') }, { required: true, message: this.$t('ingresaTuEmail') }],
				password: [{ required: true, message: this.$t('noOlvidesEsto') }, { type: 'string', min: 1, message: this.$t('muyCorto') }]
			}
		}
	},
	watch: {
		'cuenta.email' () {
			this.passIncorrectos = []
		}
	},
	methods: {
		procesarIngreso () {
			console.log('procesarIngreso')
			this.$refs.formIngreso.validate(valid => {
				if (valid) {
					// const c = this.cuenta
					const { email, password } = this.cuenta
					this.ingresar({ email, password })
				} else {
					console.warn('error submit!!')
					return false
				}
			})
		},
		async ingresar ({ email, password }) {
			this.$consolo.log('ingresar', { email, password })
			this.conectando = true
			try {
				const r = await this.$cuenta.ingresar(email, password)

				if (!r.ok) {
					if (r.error === 'noExiste') {
						const vm = this
						this.$info({
							title: vm.$t('correoNoRegistrado'),
							content: vm.$t('emailSinCuenta'),
							okText: vm.$t('registrarme'),
							onOk () { vm.modoActivo = 'registro' },
							closable: true,
							maskClosable: true,
							cancelText: vm.$t('cancelar'),
							centered: true
						})
					} else if (r.error === 'passIncorrecto') {
						this.passIncorrectos = [...this.passIncorrectos, password]
					}
				}
			} catch (e) {
				this.conectando = false
			}
			this.conectando = false
		},

		procesarRegistro () {
			console.log('procesarRegistro')
			this.$refs.formRegistro.validate(valid => {
				if (valid) {
					const c = this.cuenta
					this.registrar(c.nombre, c.apellido, c.email, c.password)
				} else {
					console.warn('error submit!!')
					return false
				}
			})
		},
		async registrar (nombre, apellido, email, pass) {
			this.$consolo.log('registrar', { nombre, apellido, email, pass })
			this.conectando = true
			try {
				await this.$cuenta.crearCuenta({ nombre, apellido, email, pass })
			} catch (e) {
				this.$consolo.error('registrar', e)
				this.conectando = false
			}
			this.conectando = false
		},

		resetRegistro () {
			this.$refs.formRegistro.resetFields()
		},

		pasarA (el) {
			el.focus()
		}
	},
	traducciones: {
		// FORMULARIO
		// ingreso
		ingresaATuCuenta: { es: 'Ingresa a tu cuenta' },
		correo: { es: 'Correo' },
		contrasena: { es: 'Contraseña' },
		conectando: { es: 'Conectando' },
		ingresar: { es: 'Ingresar' },
		passIncorrecto: { es: 'Incorrecto' },
		correoNoRegistrado: { es: 'Correo no registrado' },
		emailSinCuenta: { es: 'El email ingresado no tiene cuenta' },
		// registro
		creaTuCuenta: { es: 'Crea tu cuenta' },
		nombre: { es: 'Nombre' },
		apellido: { es: 'Apellido' },
		creandoCuenta: { es: 'Creando cuenta' },
		crearla: { es: 'Crearla' },

		// acciones
		yaTienes: { es: 'Ya tienes una cuenta?' },
		ingresa: { es: 'Ingresa' },
		eresNuevo: { es: 'Eres nuevo aquí?' },
		cancelar: { es: 'Cancelar' },
		registrate: { es: 'Regístrate' },
		registrarme: { es: 'Registrarme' },
		confirmarCambioPass: { es: 'Confirmar cambio' },
		operacionNoSolicitada: { es: 'Operación no solicitada' },


		// VALIDACION
		falta: { es: 'Falta' },
		// ingreso
		emailInvalido: { es: 'E-mail inválido' },
		ingresaTuEmail: { es: 'Ingresa tu e-mail' },
		muyCorto: { es: 'Muy corto' },
		// registro
		noOlvidesEsto: { es: 'No olvides esto' },

		errorDeRed: { es: 'Error de red', en: 'Network error', pt: 'Error de red' }
	}
}
</script>
<style lang="sass" scoped>
@import "@style/vars"
.rootFormIngreso
	width: 100%
	max-width: 100%
	position: relative
	z-index: 9
	.formIngreso,
	.formRegistro,
	.usuarioConectado,
	.laRecuPass
		+saliendo
			overflow: hidden
			max-height: 100vh
		+salir
			max-height: 0
			opacity: 0

	.titulo
		margin-bottom: 2rem

	.accion
		margin-top: .5em
		border-top: 1px solid hsla(0,0%,50%, .2)
		padding-top: 1em

	.cambioModo
		display: block
		margin-top: .5em
		text-align: center

	a
		color: #ff1799
		+bold

	.grupoCampos
		display: flex
		> div
			&:first-child
				input
					border-top-right-radius: 0
					border-bottom-right-radius: 0
			&:last-child
				input
					border-top-left-radius: 0
					border-bottom-left-radius: 0

	.ant-form-item
		margin-bottom: .8em
	.ant-row
		&:last-child
			margin-bottom: 0

	::v-deep
		.ant-form-item-label
			font-size: .8em
			padding-bottom: .5em
			label
				font-size: inherit
			.ant-form-item-required::before
				color: #da4a13
				font-size: inherit
				display: none


	.sinConexion
		margin-top: 1em
		color: $error
		text-align: center
		display: flex
		justify-content: center
		.oicono
			margin-right: .5em


/*Errores de formulario*/
.ant-form-explain, .ant-form-extra
		// font-size: $font-size-xs !important
.ant-form-vertical .ant-form-explain
	// font-size: $font-size-xs !important
.has-error .ant-form-explain, .has-error .ant-form-split
	color: $error
	// font-size: $font-size-xs !important
	letter-spacing: .5px !important
</style>
