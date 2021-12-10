<template lang="pug">
    .container
        .status-icon.green
        h3 {{ titulo }}
        a-row
            a-col(:span="8")
                b {{ resumen.locales.total }} locales
            a-col(:span="8")
                | {{ resumen.locales.apoderades }} apoderados
            a-col(:span="8")
                | {{ resumen.locales.sinApoderade }} sin apoderado
            a-col(:span="8")
                b {{ resumen.mesas.total }} mesas
            a-col(:span="8")
                | {{resumen.mesas.abiertas }} abiertas
            a-col(:span="8")
                | {{resumen.mesas.noConstituidas }} no constituidas
</template>

<script>
export default {
	props: [
		'titulo',
		'resumen'
	]
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

    h3
        display: inline
        color: $azul2
</style>
