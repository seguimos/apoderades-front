<template lang="pug">
    .container
        .status-icon(:class="getColor(resumen)")
        h3 {{ titulo }}
        a-row(v-if="resumen")
            a-col(:span="8")
                b {{ resumen.numeroLocales }} locales
            a-col(:span="8")
                | {{ resumen.numeroApoderados }} apoderados
            a-col(:span="8")
                | X sin apoderado
            a-col(:span="8")
                b {{ resumen.numeroMesas }} mesas
            a-col(:span="8")
                | X abiertas
            a-col(:span="8")
                | X no constituidas
</template>

<script>
export default {
	props: {
		titulo: {
			type: String,
			default: 'false'
		},
		resumen: {
			type: Object,
			default () { return {}}
		}
	},
	methods: {
		getColor (resumen) {
			const porcentaje = resumen.numeroApoderados / resumen.numeroMesas * 100
			if (porcentaje < 25) {
				return 'red'
			} else if (porcentaje < 50) {
				return 'orange'
			} else if (porcentaje < 75) {
				return 'yellow'
			} else {
				return 'green'
			}
		}
	}
}
</script>

<style lang="sass" scoped>
@import '@style/paleta'
@import '@style/utils'

.status-icon
    border-radius: 50%
    width: 20px
    height: 20px
    border: solid 4px $azul2
    margin-right: 5px
    display: inline-block
    vertical-align: middle

    &.green
        background-color: rgba(100,200,0,0.5)
    &.yellow
        background-color: rgba(200,200,0,0.5)
    &.orange
        background-color: rgba(200,100,0,0.5)
    &.red
        background-color: rgba(200,0,0,0.5)


.container
    border: solid 3px $azul2
    padding: 10px
    border-radius: 10px
    margin: 10px 0
    cursor: pointer
    background-color: #EFEFEF

    &:hover
        filter: brightness(120%)

    h3
        display: inline
        color: $azul2
</style>
