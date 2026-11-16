import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, expect, test, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

for (const token of ['phc_test', '', '   ']) {
  test(`application provider preserves direct EU ingestion with ${token.trim() ? 'configured' : 'missing'} credentials`, async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', token)
    vi.stubEnv('MODE', 'development')
    const { PHProvider } = await import('./ph-provider')
    const element = PHProvider({ children: 'application' })
    expect({
      key: element.props.environment?.projectToken,
      host: element.props.ingestPath,
      options: element.props.options,
      html: renderToStaticMarkup(element),
    }).toEqual({
      key: token.trim() || undefined,
      host: token.trim() ? 'https://eu.i.posthog.com' : undefined,
      options: { debug: true },
      html: 'application',
    })
  })
}
