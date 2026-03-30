import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import RegisterPanel from './RegisterPanel.vue'

describe('RegisterPanel', () => {
  const baseUrl = ref('http://localhost:3000')

  function mountPanel() {
    return mount(RegisterPanel, {
      global: { provide: { baseUrl } }
    })
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    baseUrl.value = 'http://localhost:3000'
  })

  it('renders name/description form by default', () => {
    const wrapper = mountPanel()
    expect(wrapper.find('[data-testid="input-name"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="input-description"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="register-btn"]').exists()).toBe(true)
  })

  it('switches to email mode when email tab clicked', async () => {
    const wrapper = mountPanel()
    await wrapper.find('[data-testid="mode-email"]').trigger('click')
    expect(wrapper.find('[data-testid="input-email"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="input-name"]').exists()).toBe(false)
  })

  it('switches back to name mode', async () => {
    const wrapper = mountPanel()
    await wrapper.find('[data-testid="mode-email"]').trigger('click')
    await wrapper.find('[data-testid="mode-name"]').trigger('click')
    expect(wrapper.find('[data-testid="input-name"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="input-email"]').exists()).toBe(false)
  })

  it('calls POST /agents/register with name and description', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ agentId: 'agent-1', apiKey: 'key-abc' })
    })
    vi.stubGlobal('fetch', mockFetch)

    const wrapper = mountPanel()
    await wrapper.find('[data-testid="input-name"]').setValue('TestAgent')
    await wrapper.find('[data-testid="input-description"]').setValue('A test agent')
    await wrapper.find('[data-testid="register-btn"]').trigger('click')
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/agents/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'TestAgent', description: 'A test agent' })
    })
  })

  it('calls POST /agents/register with email in email mode', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ agentId: 'agent-2', apiKey: 'key-xyz' })
    })
    vi.stubGlobal('fetch', mockFetch)

    const wrapper = mountPanel()
    await wrapper.find('[data-testid="mode-email"]').trigger('click')
    await wrapper.find('[data-testid="input-email"]').setValue('agent@example.com')
    await wrapper.find('[data-testid="register-btn"]').trigger('click')
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/agents/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'agent@example.com' })
    })
  })

  it('displays agentId and apiKey on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ agentId: 'agent-1', apiKey: 'key-abc' })
    }))

    const wrapper = mountPanel()
    await wrapper.find('[data-testid="input-name"]').setValue('TestAgent')
    await wrapper.find('[data-testid="input-description"]').setValue('A test agent')
    await wrapper.find('[data-testid="register-btn"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="result-agent-id"]').text()).toContain('agent-1')
    expect(wrapper.find('[data-testid="result-api-key"]').text()).toContain('key-abc')
  })

  it('emits api-key-received when "Use this API key" clicked', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ agentId: 'agent-1', apiKey: 'key-abc' })
    }))

    const wrapper = mountPanel()
    await wrapper.find('[data-testid="input-name"]').setValue('TestAgent')
    await wrapper.find('[data-testid="input-description"]').setValue('A test agent')
    await wrapper.find('[data-testid="register-btn"]').trigger('click')
    await flushPromises()
    await wrapper.find('[data-testid="use-api-key-btn"]').trigger('click')

    expect(wrapper.emitted('api-key-received')).toEqual([['key-abc']])
  })

  it('shows server error message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Email already registered' })
    }))

    const wrapper = mountPanel()
    await wrapper.find('[data-testid="mode-email"]').trigger('click')
    await wrapper.find('[data-testid="input-email"]').setValue('test@example.com')
    await wrapper.find('[data-testid="register-btn"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="register-error"]').text()).toContain('Email already registered')
  })

  it('shows network error on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network fail')))

    const wrapper = mountPanel()
    await wrapper.find('[data-testid="input-name"]').setValue('TestAgent')
    await wrapper.find('[data-testid="input-description"]').setValue('A test agent')
    await wrapper.find('[data-testid="register-btn"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="register-error"]').text()).toContain('Network error')
  })

  it('strips trailing slash from baseUrl', async () => {
    baseUrl.value = 'http://localhost:3000/'
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ agentId: 'a', apiKey: 'k' })
    })
    vi.stubGlobal('fetch', mockFetch)

    const wrapper = mountPanel()
    await wrapper.find('[data-testid="input-name"]').setValue('A')
    await wrapper.find('[data-testid="input-description"]').setValue('B')
    await wrapper.find('[data-testid="register-btn"]').trigger('click')
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/agents/register', expect.any(Object))
  })
})
