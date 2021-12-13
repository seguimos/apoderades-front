import { mount } from '@vue/test-utils'
import Cuenta from '@/components/cuenta.vue'

describe('cuenta', () => {
	test('is a Vue instance', () => {
		const wrapper = mount(Cuenta)
		expect(wrapper.vm).toBeTruthy()
	})
})
