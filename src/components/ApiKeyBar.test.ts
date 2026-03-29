import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ApiKeyBar from './ApiKeyBar.vue'

describe('ApiKeyBar', () => {
  it('renders the server URL input with the provided value', () => {
    const wrapper = mount(ApiKeyBar, {
      props: { baseUrl: 'http://localhost:3000', apiKey: '', status: 'unknown' }
    })
    const input = wrapper.find('[data-testid="server-url"]')
    expect((input.element as HTMLInputElement).value).toBe('http://localhost:3000')
  })

  it('renders the API key input with the provided value', () => {
    const wrapper = mount(ApiKeyBar, {
      props: { baseUrl: '', apiKey: 'secret-key', status: 'unknown' }
    })
    const input = wrapper.find('[data-testid="api-key"]')
    expect((input.element as HTMLInputElement).value).toBe('secret-key')
  })

  it('emits update:baseUrl when the URL input changes', async () => {
    const wrapper = mount(ApiKeyBar, {
      props: { baseUrl: 'http://localhost:3000', apiKey: '', status: 'unknown' }
    })
    await wrapper.find('[data-testid="server-url"]').setValue('http://localhost:4000')
    expect(wrapper.emitted('update:baseUrl')?.[0]).toEqual(['http://localhost:4000'])
  })

  it('emits update:apiKey when the API key input changes', async () => {
    const wrapper = mount(ApiKeyBar, {
      props: { baseUrl: '', apiKey: '', status: 'unknown' }
    })
    await wrapper.find('[data-testid="api-key"]').setValue('new-key')
    expect(wrapper.emitted('update:apiKey')?.[0]).toEqual(['new-key'])
  })

  it('shows a status dot with a class matching the status prop', () => {
    const wrapper = mount(ApiKeyBar, {
      props: { baseUrl: '', apiKey: '', status: 'connected' }
    })
    expect(wrapper.find('[data-testid="status-dot"]').classes()).toContain('connected')
  })
})
