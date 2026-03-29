import { describe, it, expect, vi, beforeEach } from 'vitest'
import { execute } from './client'
import type { EndpointDef } from '../types/spec'

const baseEndpoint: EndpointDef = {
  method: 'GET',
  path: '/actions/messages',
  description: 'Fetch messages',
  auth: false,
  params: []
}

describe('execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('makes a GET request to the correct URL', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve([])
    })

    await execute('http://localhost:3000', baseEndpoint, {}, '')

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/actions/messages',
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('sends body params as JSON for POST requests', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({ messageId: 'abc' })
    })
    const endpoint: EndpointDef = {
      method: 'POST',
      path: '/actions/message',
      description: 'Send message',
      auth: false,
      params: [{ name: 'text', in: 'body', type: 'string', required: true, description: '' }]
    }

    await execute('http://localhost:3000', endpoint, { text: 'hello' }, '')

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({ text: 'hello' })
  })

  it('appends query params to the URL for GET requests', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve([])
    })
    const endpoint: EndpointDef = {
      method: 'GET',
      path: '/search',
      description: 'Search',
      auth: false,
      params: [{ name: 'q', in: 'query', type: 'string', required: false, description: '' }]
    }

    await execute('http://localhost:3000', endpoint, { q: 'hello' }, '')

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain('q=hello')
  })

  it('interpolates path params into the URL', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({})
    })
    const endpoint: EndpointDef = {
      method: 'GET',
      path: '/agents/:id',
      description: 'Get agent',
      auth: false,
      params: [{ name: 'id', in: 'path', type: 'string', required: true, description: '' }]
    }

    await execute('http://localhost:3000', endpoint, { id: 'abc-123' }, '')

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain('/agents/abc-123')
  })

  it('injects X-API-Key header when endpoint auth is true', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({})
    })
    const authEndpoint: EndpointDef = { ...baseEndpoint, auth: true }

    await execute('http://localhost:3000', authEndpoint, {}, 'my-secret-key')

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(options.headers['X-API-Key']).toBe('my-secret-key')
  })

  it('does not inject X-API-Key when endpoint auth is false', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({})
    })

    await execute('http://localhost:3000', baseEndpoint, {}, 'my-secret-key')

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(options.headers['X-API-Key']).toBeUndefined()
  })

  it('returns status and parsed body', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 201,
      json: () => Promise.resolve({ id: '1' })
    })

    const result = await execute('http://localhost:3000', baseEndpoint, {}, '')

    expect(result).toEqual({ status: 201, body: { id: '1' } })
  })

  it('does not send Content-Type header on GET requests', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve([])
    })

    await execute('http://localhost:3000', baseEndpoint, {}, '')

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(options.headers['Content-Type']).toBeUndefined()
  })

  it('returns null body when response is not JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 204,
      json: () => Promise.reject(new SyntaxError('No content'))
    })

    const result = await execute('http://localhost:3000', baseEndpoint, {}, '')

    expect(result).toEqual({ status: 204, body: null })
  })
})
