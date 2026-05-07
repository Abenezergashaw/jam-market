import en from '~/locales/en.json'
import am from '~/locales/am.json'

const messages = { en, am }

export function useLocale() {
  const locale = useCookie('jam_locale', {
    default: () => 'en',
    maxAge: 60 * 60 * 24 * 365,
  })

  function setLocale(code) {
    locale.value = code
  }

  function t(key, params = {}) {
    const keys = key.split('.')
    let msg = messages[locale.value]
    for (const k of keys) msg = msg?.[k]

    if (typeof msg !== 'string') {
      msg = messages.en
      for (const k of keys) msg = msg?.[k]
    }

    if (typeof msg !== 'string') return key

    return msg.replace(/\{(\w+)\}/g, (_, p) =>
      params[p] !== undefined ? params[p] : `{${p}}`
    )
  }

  return { locale, setLocale, t }
}
