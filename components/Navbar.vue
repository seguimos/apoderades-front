<template lang="pug">
div
    a-menu(v-model='current' mode='horizontal')
        a-menu-item(key='mail')
            a-icon(type='mail')
            | Navigation One
        a-menu-item(key='app' disabled='')
            a-icon(type='appstore')
            | Navigation Two
        a-sub-menu
            span.submenu-title-wrapper(slot='title')
                a-icon(type='setting')
                | Navigation Three - Submenu
            a-menu-item-group(title='Item 1')
                a-menu-item(key='setting:1')
                    | Option 1
                a-menu-item(key='setting:2')
                    | Option 2
            a-menu-item-group(title='Item 2')
                a-menu-item(key='setting:3')
                    | Option 3
                a-menu-item(key='setting:4')
                    | Option 4
        a-menu-item(key='alipay')
            a(href='https://antdv.com' target='_blank' rel='noopener noreferrer')
                | Navigation Four - Link

</template>

<script>

export default {
	data () {
		return {
			current: ['mail']
		}
	}
}

</script>
