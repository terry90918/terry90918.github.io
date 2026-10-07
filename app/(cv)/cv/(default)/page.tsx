import Home from '../[locale]/page'

export default function Page() {
  return Home({ params: Promise.resolve({ locale: 'zh-TW' }) })
}
