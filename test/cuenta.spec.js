import { mount } from '@vue/test-utils'
import NuxtLogo from '@/components/cuenta.vue'

describe('cuenta', () => {
	test('is a Vue instance', () => {
		const wrapper = mount(NuxtLogo)
		expect(wrapper.vm).toBeTruthy()
	})
})
