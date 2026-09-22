#!/usr/bin/env node
import { argv } from 'process'
import EventEmitter from 'events'

import { maybeEnableCompileCache } from '../dist/utils/nodejs-compile-cache.js'

// 12 hours
const UPDATE_CHECK_INTERVAL = 432e5

const NETLIFY_CYAN_HEX = '#28b5ac'

const main = async () => {
  // TODO(serhalp) Investigate and fix this at the root instead.
  // This avoids `MaxListenersExceededWarning` warnings during Edge Functions bundling,
  // from somewhere around here:
  // https://github.com/netlify/build/blob/ca0bb348b3d7437d2418526f49b803a3db4e5ac2/packages/build/src/steps/run_step.ts.
  EventEmitter.defaultMaxListeners = 25

  const { default: chalk } = await import('chalk')
  const { notifier } = await import('nano-updater')
  const { box } = await import('@clack/prompts')
  const { default: terminalLink } = await import('terminal-link')
  const { createMainCommand } = await import('../dist/commands/main.js')
  const { logError } = await import('../dist/utils/command-helpers.js')
  const { default: getPackageJson } = await import('../dist/utils/get-cli-package-json.js')
  const { runProgram } = await import('../dist/utils/run-program.js')

  try {
    const pkg = await getPackageJson()
    const updateNotifier = notifier({
      name: pkg.name,
      version: pkg.version,
      interval: UPDATE_CHECK_INTERVAL,
    })
    if (updateNotifier.outdated) {
      const message = `Update available ${chalk.dim(updateNotifier.current)} → ${chalk.green(updateNotifier.latest)}
See what's new in the ${terminalLink('release notes', 'https://ntl.fyi/cli-versions')}

Run ${chalk.inverse.hex(NETLIFY_CYAN_HEX)(`npm i -g ${pkg.name}`)} to update`
      updateNotifier.notify({
        message,
        onMessage: (message) => {
          box(message, '⬥', {
            output: process.stderr,
            width: 'auto',
            withGuide: false,
            contentAlign: 'center',
            titleAlign: 'center',
            formatBorder: (border) => chalk.hex(NETLIFY_CYAN_HEX)(border),
          })
        },
      })
    }
  } catch (error) {
    logError(`Error checking for updates: ${error?.toString()}`)
  }

  const program = createMainCommand()

  try {
    await runProgram(program, argv)

    program.onEnd()
  } catch (error) {
    program.onEnd(error)
  }
}

// Must come first, including before any imports
maybeEnableCompileCache()

await main()
