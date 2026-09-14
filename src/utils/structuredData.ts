const SCRIPT_ID = 'page-structured-data'

/** Injects a JSON-LD <script> tag for the current page, replacing any previous one. */
export function setStructuredData(data: unknown) {
  removeStructuredData()
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = SCRIPT_ID
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

export function removeStructuredData() {
  document.getElementById(SCRIPT_ID)?.remove()
}
