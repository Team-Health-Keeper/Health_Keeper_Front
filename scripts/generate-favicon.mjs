import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import pngToIco from 'png-to-ico'

const root = path.resolve(process.cwd())
const srcPng = path.join(root, 'public', 'logo-icon.png')
const outIco = path.join(root, 'public', 'favicon.ico')

async function main() {
  try {
    const pngBuffer = await readFile(srcPng)
    const icoBuffer = await pngToIco(pngBuffer)
    await writeFile(outIco, icoBuffer)
    console.log(`Generated: ${outIco}`)
  } catch (err) {
    console.error('Failed to generate favicon.ico:', err)
    process.exit(1)
  }
}

main()
