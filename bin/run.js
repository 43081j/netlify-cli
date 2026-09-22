#!/usr/bin/env node
import { argv } from 'process'
import EventEmitter from 'events'

import { maybeEnableCompileCache } from '../dist/utils/nodejs-compile-cache.js'

// 12 hours
const UPDATE_CHECK_INTERVAL = 432e5

const main = async () => {
  // TODO(serhalp) Investigate and fix this at the root instead.
  // This avoids `MaxListenersExceededWarning` warnings during Edge Functions bundling,
  // from somewhere around here:
  // https://github.com/netlify/build/blob/ca0bb348b3d7437d2418526f49b803a3db4e5ac2/packages/build/src/steps/run_step.ts.
  EventEmitter.defaultMaxListeners = 25

  const { notifier } = await import('nano-notifier')
  const { default: terminalLink } = await import('terminal-link')
  const { createMainCommand } = await import('../dist/commands/main.js')
  const { logError, NETLIFY_CYAN, styleText } = await import('../dist/utils/command-helpers.js')
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
      const message = `Update available ${styleText('dim', updateNotifier.current)} → ${styleText('green', updateNotifier.latest)}
See what's new in the ${terminalLink('release notes', 'https://ntl.fyi/cli-versions')}

Run ${styleText('inverse', NETLIFY_CYAN(`npm i -g ${pkg.name}`))} to update`
      updateNotifier.notify({
        title: '⬥',
        message,
        boxOptions: {
          contentAlign: 'center',
          titleAlign: 'center',
          formatBorder: (border) => NETLIFY_CYAN(border),
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
