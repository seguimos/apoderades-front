import { mount } from '@vue/test-utils'
import Icono from '@/components/icono.vue'

describe('Icono', () => {
	test('is a Vue instance', () => {
		const wrapper = mount(Icono)
		expect(wrapper.vm).toBeTruthy()
	})
})
