import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from './App.vue'
import * as specModule from './api/spec'
import type { ApiSpec } from './types/spec'

const mockSpec: ApiSpec = {
  plugins: [
    {
      name: 'Messaging',
      description: 'Send messages',
      endpoints: []
    }
  ]
}

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('calls fetchSpec on mount using the default base URL', async () => {
    vi.spyOn(specModule, 'fetchSpec').mockResolvedValue(mockSpec)
    mount(App)
    await flushPromises()
    expect(specModule.fetchSpec).toHaveBeenCalledWith('http://localhost:3000')
  })

  it('renders plugin names returned by fetchSpec', async () => {
    vi.spyOn(specModule, 'fetchSpec').mockResolvedValue(mockSpec)
    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.text()).toContain('Messaging')
  })

  it('shows a banner error when fetchSpec throws', async () => {
    vi.spyOn(specModule, 'fetchSpec').mockRejectedValue(new Error('refused'))
    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.find('[data-testid="banner-error"]').exists()).toBe(true)
  })

  it('persists baseUrl to localStorage when it changes', async () => {
    vi.spyOn(specModule, 'fetchSpec').mockResolvedValue(mockSpec)
    const wrapper = mount(App)
    await flushPromises()

    await wrapper.find('[data-testid="server-url"]').setValue('http://localhost:4000')
    await flushPromises()

    expect(localStorage.getItem('agentPlayground.serverUrl')).toBe('http://localhost:4000')
  })

  it('persists apiKey to localStorage when it changes', async () => {
    vi.spyOn(specModule, 'fetchSpec').mockResolvedValue(mockSpec)
    const wrapper = mount(App)
    await flushPromises()

    await wrapper.find('[data-testid="api-key"]').setValue('my-api-key')

    expect(localStorage.getItem('agentPlayground.apiKey')).toBe('my-api-key')
  })

  it('restores baseUrl from localStorage on load', async () => {
    localStorage.setItem('agentPlayground.serverUrl', 'http://saved-server:9000')
    vi.spyOn(specModule, 'fetchSpec').mockResolvedValue(mockSpec)

    mount(App)
    await flushPromises()

    expect(specModule.fetchSpec).toHaveBeenCalledWith('http://saved-server:9000')
  })
})
