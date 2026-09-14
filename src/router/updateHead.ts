import type { RouteLocationNormalized } from 'vue-router'

const SITE_URL = 'https://webpageawearnew.vercel.app'
const DEFAULT_TITLE = 'AWEAR Lab · GIST'
const DEFAULT_DESCRIPTION =
  'AWEAR Lab at the Gwangju Institute of Science and Technology (GIST) develops wearable robots and neural interfaces for rehabilitation, assistive technology, and human-robot interaction.'

function setMeta(selector: string, attr: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    const [, attrName, attrValue] = /\[(\w+)="([^"]+)"\]/.exec(selector) ?? []
    if (attrName && attrValue) el.setAttribute(attrName, attrValue)
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export function updateHeadForRoute(to: RouteLocationNormalized) {
  const title = (to.meta.title as string) || DEFAULT_TITLE
  const description = (to.meta.description as string) || DEFAULT_DESCRIPTION
  const robots = (to.meta.robots as string) || 'index, follow'
  const url = `${SITE_URL}${to.path}`

  document.title = title

  setMeta('meta[name="description"]', 'content', description)
  setMeta('meta[name="robots"]', 'content', robots)

  setMeta('meta[property="og:title"]', 'content', title)
  setMeta('meta[property="og:description"]', 'content', description)
  setMeta('meta[property="og:url"]', 'content', url)
  setMeta('meta[property="og:type"]', 'content', 'website')
  setMeta('meta[property="og:site_name"]', 'content', DEFAULT_TITLE)

  setMeta('meta[name="twitter:card"]', 'content', 'summary')
  setMeta('meta[name="twitter:title"]', 'content', title)
  setMeta('meta[name="twitter:description"]', 'content', description)

  setLink('canonical', url)
}
