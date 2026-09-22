import { OptionValues } from 'commander'

import { listSites } from '../../lib/api.js'
import { startSpinner } from '../../lib/spinner.js'
import { styleText, log, logJson } from '../../utils/command-helpers.js'
import { SiteInfo } from '../../utils/types.js'
import BaseCommand from '../base-command.js'

export const sitesList = async (options: OptionValues, command: BaseCommand) => {
  const { api } = command.netlify
  let spinner
  if (!options.json) {
    spinner = startSpinner({ text: 'Loading your projects' })
  }
  await command.authenticate()

  const sites = await listSites({ api, options: { filter: 'all' } })
  if (spinner) {
    spinner.success()
  }

  if (sites && sites.length !== 0) {
    const logSites = sites.map((site) => {
      const siteInfo: Pick<SiteInfo, 'id' | 'name' | 'ssl_url' | 'account_name'> & { repo_url?: string } = {
        id: site.id,
        name: site.name,
        ssl_url: site.ssl_url,
        account_name: site.account_name,
      }

      if (site.build_settings && site.build_settings.repo_url) {
        siteInfo.repo_url = site.build_settings.repo_url
      }

      return siteInfo
    })

    // Json response for piping commands
    if (options.json) {
      const redactedSites = sites.map((site) => {
        if (site?.build_settings?.env) {
          delete site.build_settings.env
        }
        return site
      })
      logJson(redactedSites)
      return false
    }

    log(`
────────────────────────────┐
 Current Netlify Projects │
────────────────────────────┘

Count: ${logSites.length}
`)

    logSites.forEach((logSite) => {
      log(`${styleText('greenBright', logSite.name)} - ${logSite.id}`)
      log(`  ${styleText(['whiteBright', 'bold'], 'url:')}  ${styleText('yellowBright', logSite.ssl_url)}`)
      if (logSite.repo_url) {
        log(`  ${styleText(['whiteBright', 'bold'], 'repo:')} ${styleText('white', logSite.repo_url)}`)
      }
      if (logSite.account_name) {
        log(`  ${styleText(['whiteBright', 'bold'], 'account:')} ${styleText('white', logSite.account_name)}`)
      }
      log(`─────────────────────────────────────────────────`)
    })
  }
}
