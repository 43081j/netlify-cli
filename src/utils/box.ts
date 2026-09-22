import { Writable } from 'stream'

import { box } from '@clack/prompts'

import { log, NETLIFY_CYAN } from './command-helpers.js'

const renderBox = (message: string, title: string): string => {
  let rendered = ''
  const output = Object.assign(
    new Writable({
      write(chunk: Buffer, _encoding, callback) {
        rendered += chunk.toString()
        callback()
      },
    }),
    { columns: process.stdout.columns },
  )
  box(`\n${message}\n`, ` ${title} `, {
    output,
    withGuide: false,
    width: 'auto',
    rounded: true,
    contentAlign: 'center',
    titleAlign: 'center',
    formatBorder: (text) => NETLIFY_CYAN(text),
  })
  return rendered.trimEnd()
}

export const logBox = (message: string, title: string): void => {
  log()
  log(renderBox(message, title))
  log()
}
