// Writes themes/*.json from the palettes in palettes.mjs and lists them in orca-plugin.json.
// Usage: node scripts/build-palettes.mjs
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { PALETTES } from './palettes.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

// Each role and the TextMate scopes it colors. Orca colors plugin syntaxes through these canonical
// scopes, so one rule per scope covers Jinja and Orca's built-in languages alike.
const ROLE_SCOPES = {
  comment: ['comment'],
  delimiter: ['keyword', 'storage', 'constant.language', 'variable.language'],
  control: ['keyword.control'],
  operator: ['keyword.operator'],
  variable: ['support.variable', 'variable.parameter'],
  filter: ['entity.name.type', 'support.type', 'support.class'],
  function: ['entity.name.function', 'support.function', 'meta.decorator'],
  string: ['string', 'markup.inline.raw'],
  escape: ['constant.character.escape', 'string.regexp'],
  number: ['constant.numeric', 'constant'],
  tag: ['entity.name.tag', 'markup.heading'],
  attribute: ['entity.other.attribute-name'],
  property: ['support.type.property-name'],
  punctuation: ['punctuation'],
  link: ['markup.underline.link'],
  invalid: ['invalid']
}
const ROLE_STYLE = { comment: 'italic', attribute: 'italic', link: 'underline' }

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
function mix(a, b, t) {
  const channel = (hex, i) => parseInt(hex.slice(i, i + 2), 16)
  return `#${[1, 3, 5]
    .map((i) => Math.round(channel(a, i) * (1 - t) + channel(b, i) * t).toString(16).padStart(2, '0'))
    .join('')}`
}
// Orca drops a code color under 3:1 on the editor background; nudge it toward the text color instead.
function legible(color, background, toward, min) {
  for (let t = 0; t <= 1; t += 0.02) {
    const candidate = mix(color, toward, t)
    if (contrast(candidate, background) >= min) {
      return candidate
    }
  }
  return toward
}

export function expandPalette(palette) {
  const { background, foreground } = palette
  if (contrast(foreground, background) < 4.5) {
    throw new Error(`${palette.id}: foreground needs 4.5:1 on background`)
  }
  const extreme = palette.base === 'dark' ? '#ffffff' : '#000000'
  const colors = Object.fromEntries(
    Object.entries(palette.colors).map(([role, color]) => [role, legible(color, background, foreground, 3.2)])
  )
  const primary = legible(palette.primary, palette.primaryForeground, extreme, 4.6)
  return {
    theme: {
      schemaVersion: 1,
      base: palette.base,
      tokens: {
        '--background': background,
        '--foreground': foreground,
        '--primary': primary,
        '--primary-foreground': palette.primaryForeground
      },
      tokenColors: Object.entries(colors).map(([role, color]) => ({
        name: role,
        scope: ROLE_SCOPES[role],
        settings: ROLE_STYLE[role] ? { foreground: color, fontStyle: ROLE_STYLE[role] } : { foreground: color }
      }))
    },
    colors
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const palette of PALETTES) {
    const unknown = Object.keys(palette.colors).filter((role) => !ROLE_SCOPES[role])
    if (unknown.length > 0) {
      throw new Error(`${palette.id}: unknown roles ${unknown.join(', ')}`)
    }
    const { theme, colors } = expandPalette(palette)
    const changed = Object.entries(colors).filter(([role, color]) => color !== palette.colors[role])
    await writeFile(path.join(root, 'themes', `${palette.id}.json`), `${JSON.stringify(theme, null, 2)}\n`)
    console.log(
      `${palette.id.padEnd(16)} ${changed.length ? `adjusted for contrast: ${changed.map(([r, c]) => `${r} ${palette.colors[r]}→${c}`).join(', ')}` : 'ok'}`
    )
  }
  const manifestPath = path.join(root, 'orca-plugin.json')
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  manifest.contributes.themes = PALETTES.map((p) => ({ id: p.id, title: p.title, path: `themes/${p.id}.json` }))
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
}
