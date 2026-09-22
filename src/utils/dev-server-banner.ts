import { logBox } from './box.js'
import { chalk } from './command-helpers.js'

export const printBanner = (options: { url: string }): void => {
  logBox(`Local dev server ready: ${chalk.inverse.cyan(options.url)}`, '⬥')
}
