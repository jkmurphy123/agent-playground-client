import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchSpec } from './spec'

describe('fetchSpec', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches /api-spec from the given base URL', async () => {
    const mockSpec = { plugins: [] }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSpec)
    })

    const result = await fetchSpec('http://localhost:3000')

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api-spec')
    expect(result).toEqual(mockSpec)
  })

  it('throws an error when the response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 })

    await expect(fetchSpec('http://localhost:3000')).rejects.toThrow(
      'Failed to fetch spec: 503'
    )
  })

  it('throws when fetch itself rejects (network error)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    await expect(fetchSpec('http://localhost:3000')).rejects.toThrow('Network error')
  })
})
