const fs = require('fs')
const path = require('path')

const width = 1800
const height = 1650

function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function text(x, y, value, opts = {}) {
  const {
    size = 24,
    weight = 500,
    anchor = 'middle',
    color = '#111827',
  } = opts
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(value)}</text>`
}

function multilineText(x, y, lines, opts = {}) {
  const {
    size = 18,
    weight = 600,
    anchor = 'middle',
    color = '#111827',
    lineHeight = 22,
  } = opts
  const spans = lines
    .map((lineValue, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${esc(lineValue)}</tspan>`)
    .join('')
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${spans}</text>`
}

function actor(x, y, label) {
  return `
    <circle cx="${x}" cy="${y}" r="18" stroke="#111827" stroke-width="3" fill="white" />
    <line x1="${x}" y1="${y + 18}" x2="${x}" y2="${y + 78}" stroke="#111827" stroke-width="3" />
    <line x1="${x - 30}" y1="${y + 42}" x2="${x + 30}" y2="${y + 42}" stroke="#111827" stroke-width="3" />
    <line x1="${x}" y1="${y + 78}" x2="${x - 24}" y2="${y + 118}" stroke="#111827" stroke-width="3" />
    <line x1="${x}" y1="${y + 78}" x2="${x + 24}" y2="${y + 118}" stroke="#111827" stroke-width="3" />
    ${multilineText(x, y - 42, label.split(' / '), { size: 22, weight: 700 })}
  `
}

function useCase(cx, cy, rx, ry, lines, fill = '#ffffff', stroke = '#9ca3af') {
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="2" />
    ${multilineText(cx, cy - 4, Array.isArray(lines) ? lines : [lines], { size: 18, weight: 600, lineHeight: 21 })}
  `
}

const system = { x: 450, y: 80, w: 900, h: 1460 }
const mainX = 820
const helperX = 1125

const mainCases = [
  { y: 170, rx: 120, ry: 36, lines: ['Register', 'Account'] },
  { y: 270, rx: 120, ry: 36, lines: ['Login Account'] },
  { y: 370, rx: 110, ry: 34, lines: ['View Profile'] },
  { y: 470, rx: 110, ry: 34, lines: ['View Lessons'] },
  { y: 570, rx: 120, ry: 36, lines: ['View Lesson', 'Content'] },
  { y: 670, rx: 100, ry: 32, lines: ['Take Quiz'] },
  { y: 770, rx: 110, ry: 36, lines: ['View Quiz', 'Result'] },
  { y: 870, rx: 130, ry: 36, lines: ['View Learning', 'Progress'] },
  { y: 970, rx: 145, ry: 40, lines: ['Adjust Accessibility', 'Settings'] },
  { y: 1070, rx: 90, ry: 32, lines: ['Logout'] },
  { y: 1170, rx: 120, ry: 36, lines: ['Access Help', 'and Support'] },
  { y: 1270, rx: 130, ry: 40, lines: ['Add / Edit /', 'Delete Lessons'] },
  { y: 1370, rx: 120, ry: 38, lines: ['Add Quiz', 'Questions'] },
]

const helperCases = [
  { y: 170, rx: 120, ry: 30, lines: ['Check Username'], fill: '#eff6ff', stroke: '#60a5fa' },
  { y: 225, rx: 122, ry: 30, lines: ['Validate Password'], fill: '#eff6ff', stroke: '#60a5fa' },
  { y: 315, rx: 120, ry: 30, lines: ['Forgot Password'], fill: '#fffbeb', stroke: '#f59e0b' },
  { y: 670, rx: 100, ry: 30, lines: ['Submit Quiz'], fill: '#eff6ff', stroke: '#60a5fa' },
  { y: 825, rx: 118, ry: 34, lines: ['Unlocks Next', 'Lesson'], fill: '#f8fafc', stroke: '#94a3b8' },
  { y: 770, rx: 110, ry: 30, lines: ['Review Answers'], fill: '#f8fafc', stroke: '#94a3b8' },
  { y: 1460, rx: 125, ry: 38, lines: ['Monitors Student', 'Progress'], fill: '#f8fafc', stroke: '#94a3b8' },
]

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#ffffff" />
  ${text(60, 40, '15. Use Case Diagram', { anchor: 'start', size: 26, weight: 800 })}

  <rect x="${system.x}" y="${system.y}" width="${system.w}" height="${system.h}" fill="#b9dbe7" stroke="#93c5d4" stroke-width="2" />
  ${text(system.x + system.w / 2, 110, 'CompuBasics', { size: 28, weight: 800 })}

  ${actor(170, 760, 'User / Student')}
  ${actor(1620, 760, 'Admin')}

  ${mainCases.map((item) => useCase(mainX, item.y, item.rx, item.ry, item.lines)).join('')}
  ${helperCases.map((item) => useCase(helperX, item.y, item.rx, item.ry, item.lines, item.fill, item.stroke)).join('')}
</svg>
`

const outDir = path.join(process.cwd(), 'output')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

const svgPath = path.join(outDir, 'compubasics-use-case-diagram.svg')
fs.writeFileSync(svgPath, svg, 'utf8')

async function main() {
  let sharp
  try {
    sharp = require('sharp')
  } catch {
    console.error('sharp is required. Install with: npm install --no-save sharp')
    process.exit(1)
  }

  const pngPath = path.join(outDir, 'compubasics-use-case-diagram.png')
  await sharp(Buffer.from(svg)).png().toFile(pngPath)
  console.log(`SVG: ${svgPath}`)
  console.log(`PNG: ${pngPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
