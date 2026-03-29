import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import PluginGrid from './PluginGrid.vue'
import type { PluginDef } from '../types/spec'

const makePlugin = (name: string): PluginDef => ({
  name,
  description: `${name} description`,
  endpoints: []
})

describe('PluginGrid', () => {
  it('shows empty state message when no plugins are provided', () => {
    const wrapper = shallowMount(PluginGrid, { props: { plugins: [] } })
    expect(wrapper.text()).toContain('No plugins found on this server')
  })

  it('does not show empty state when plugins are present', () => {
    const wrapper = shallowMount(PluginGrid, {
      props: { plugins: [makePlugin('Messaging')] }
    })
    expect(wrapper.text()).not.toContain('No plugins found')
  })

  it('renders one PluginCard stub per plugin', () => {
    const plugins = [makePlugin('Messaging'), makePlugin('Agents')]
    const wrapper = shallowMount(PluginGrid, { props: { plugins } })
    expect(wrapper.findAllComponents({ name: 'PluginCard' })).toHaveLength(2)
  })
})
