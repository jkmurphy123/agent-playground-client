import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import EndpointPanel from './EndpointPanel.vue'
import type { EndpointDef } from '../types/spec'
import * as clientModule from '../api/client'

const postEndpoint: EndpointDef = {
  method: 'POST',
  path: '/actions/message',
  description: 'Send a message',
  auth: true,
  params: [
    { name: 'text', in: 'body', type: 'string', required: true, description: 'Message text' }
  ]
}

const getEndpoint: EndpointDef = {
  method: 'GET',
  path: '/actions/messages',
  description: 'Fetch messages',
  auth: false,
  params: []
}

const mountWithProvide = (endpoint: EndpointDef) =>
  mount(EndpointPanel, {
    props: { endpoint },
    global: {
      provide: {
        baseUrl: ref('http://localhost:3000'),
        apiKey: ref('test-api-key')
      }
    }
  })

describe('EndpointPanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the method badge with the endpoint method', () => {
    const wrapper = mountWithProvide(postEndpoint)
    expect(wrapper.find('[data-testid="method-badge"]').text()).toBe('POST')
  })

  it('renders the endpoint path', () => {
    const wrapper = mountWithProvide(postEndpoint)
    expect(wrapper.text()).toContain('/actions/message')
  })

  it('renders the endpoint description', () => {
    const wrapper = mountWithProvide(postEndpoint)
    expect(wrapper.text()).toContain('Send a message')
  })

  it('renders one input per param', () => {
    const wrapper = mountWithProvide(postEndpoint)
    expect(wrapper.find('[data-testid="param-text"]').exists()).toBe(true)
  })

  it('marks required params with an asterisk', () => {
    const wrapper = mountWithProvide(postEndpoint)
    expect(wrapper.find('[data-testid="required-marker"]').exists()).toBe(true)
  })

  it('does not render an API key field even for auth endpoints', () => {
    const wrapper = mountWithProvide(postEndpoint)
    const inputs = wrapper.findAll('input')
    // Only the 'text' param input — no API key input
    expect(inputs).toHaveLength(1)
  })

  it('labels the execute button with the endpoint method', () => {
    const wrapper = mountWithProvide(postEndpoint)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Send POST')
  })

  it('shows no response area before the button is clicked', () => {
    const wrapper = mountWithProvide(postEndpoint)
    expect(wrapper.find('[data-testid="response-result"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="response-error"]').exists()).toBe(false)
  })

  it('calls execute with correct args and shows the response on success', async () => {
    vi.spyOn(clientModule, 'execute').mockResolvedValue({ status: 200, body: { messageId: 'abc' } })
    const wrapper = mountWithProvide(postEndpoint)

    await wrapper.find('[data-testid="param-text"]').setValue('hello')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(clientModule.execute).toHaveBeenCalledWith(
      'http://localhost:3000',
      postEndpoint,
      { text: 'hello' },
      'test-api-key'
    )
    expect(wrapper.find('[data-testid="response-result"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="response-result"]').text()).toContain('200')
  })

  it('shows an error message when execute throws', async () => {
    vi.spyOn(clientModule, 'execute').mockRejectedValue(new Error('Network error'))
    const wrapper = mountWithProvide(postEndpoint)

    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="response-error"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="response-error"]').text()).toContain('Network error')
  })

  it('shows no param inputs for endpoints with no params', () => {
    const wrapper = mountWithProvide(getEndpoint)
    expect(wrapper.findAll('input')).toHaveLength(0)
  })
})
