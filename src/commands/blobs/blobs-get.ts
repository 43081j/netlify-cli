import { promises as fs } from 'fs'
import { resolve } from 'path'

import { getStore } from '@netlify/blobs'
import { OptionValues } from 'commander'

import { styleText, logAndThrowError } from '../../utils/command-helpers.js'
import BaseCommand from '../base-command.js'

interface Options extends OptionValues {
  output?: string
}

export const blobsGet = async (storeName: string, key: string, options: Options, command: BaseCommand) => {
  const { api, siteInfo } = command.netlify
  const { output } = options
  const store = getStore({
    apiURL: `${api.scheme}://${api.host}`,
    name: storeName,
    siteID: siteInfo?.id ?? '',
    token: api.accessToken ?? '',
  })

  let blob

  try {
    blob = await store.get(key, { type: 'arrayBuffer' })
  } catch {
    return logAndThrowError(
      `Could not retrieve blob ${styleText('yellow', key)} from store ${styleText('yellow', storeName)}`,
    )
  }

  if (blob === null) {
    return logAndThrowError(
      `Blob ${styleText('yellow', key)} does not exist in store ${styleText('yellow', storeName)}`,
    )
  }

  if (output) {
    const path = resolve(output)
    await fs.writeFile(path, Buffer.from(blob))
  } else {
    const decoder = new TextDecoder('utf-8')
    const str = decoder.decode(blob)
    console.log(str)
  }
}
