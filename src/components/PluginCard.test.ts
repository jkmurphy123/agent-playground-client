import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import PluginCard from './PluginCard.vue'
import type { PluginDef } from '../types/spec'

const plugin: PluginDef = {
  name: 'Messaging',
  description: 'Send and retrieve messages',
  endpoints: [
    { method: 'POST', path: '/actions/message', description: 'Send', auth: true, params: [] },
    { method: 'GET', path: '/actions/messages', description: 'Fetch', auth: false, params: [] }
  ]
}

describe('PluginCard', () => {
  it('renders plugin name and description', () => {
    const wrapper = shallowMount(PluginCard, { props: { plugin } })
    expect(wrapper.text()).toContain('Messaging')
    expect(wrapper.text()).toContain('Send and retrieve messages')
  })

  it('shows endpoint count in the header', () => {
    const wrapper = shallowMount(PluginCard, { props: { plugin } })
    expect(wrapper.text()).toContain('2 endpoints')
  })

  it('does not show endpoint panels by default', () => {
    const wrapper = shallowMount(PluginCard, { props: { plugin } })
    expect(wrapper.find('[data-testid="endpoints"]').exists()).toBe(false)
  })

  it('shows endpoint panels after clicking the header button', async () => {
    const wrapper = shallowMount(PluginCard, { props: { plugin } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('[data-testid="endpoints"]').exists()).toBe(true)
  })

  it('hides endpoint panels when clicked a second time', async () => {
    const wrapper = shallowMount(PluginCard, { props: { plugin } })
    await wrapper.find('button').trigger('click')
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('[data-testid="endpoints"]').exists()).toBe(false)
  })

  it('renders one EndpointPanel stub per endpoint when expanded', async () => {
    const wrapper = shallowMount(PluginCard, { props: { plugin } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.findAllComponents({ name: 'EndpointPanel' })).toHaveLength(2)
  })
})
