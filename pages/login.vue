<template lang="pug">
.root
	a-form#components-form-demo-normal-login.login-form(:form='form' @submit='handleSubmit')
		a-form-item
			a-input(v-decorator="[\
			'userName',\
			{ rules: [{ required: true, message: 'Please input your username!' }] },\
			]" placeholder='Username')
			a-icon(slot='prefix' type='user' style='color: rgba(0,0,0,.25)')
		a-form-item
			a-input(v-decorator="[\
			'password',\
			{ rules: [{ required: true, message: 'Please input your Password!' }] },\
			]" type='password' placeholder='Password')
			a-icon(slot='prefix' type='lock' style='color: rgba(0,0,0,.25)')
		a-form-item
			a(href='')
				| Olvidé mi contraseña
			a-button.login-form-button(type='primary' html-type='submit')
				| Iniciar Sesión

</template>

<script>
import NavBar from '../components/Navbar.vue'

export default {
	components: {
		NavBar
	},
	data () {
		return {
			routes: [
			],
			current: ['mail']
		}
	},
	beforeCreate () {
		this.form = this.$form.createForm(this, { name: 'normal_login' })
	},
	methods: {
		handleSubmit (e) {
			e.preventDefault()
			this.form.validateFields((err, values) => {
				if (!err) {
					console.log('Received values of form: ', values)
				}
			})
		}
	}
}
</script>

<style>
#components-form-demo-normal-login .login-form {
  max-width: 300px;
}

#components-form-demo-normal-login .login-form-button {
  width: 100%;
}
</style>
