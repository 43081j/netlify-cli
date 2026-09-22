import { styleText } from '../command-helpers.js'

export const destructiveCommandMessages = {
  overwriteNotice: `${styleText('yellowBright', 'Notice')}: To overwrite without this warning, you can use the --force flag.`,

  blobSet: {
    generateWarning: (key: string, storeName: string) =>
      `${styleText('redBright', 'Warning')}: The blob key ${styleText('cyan', key)} already exists in store ${styleText('cyan', storeName)}!`,
    overwriteConfirmation: 'Do you want to proceed with overwriting this blob key existing value?',
  },

  blobDelete: {
    generateWarning: (key: string, storeName: string) =>
      `${styleText('redBright', 'Warning')}: The following blob key ${styleText('cyan', key)} will be deleted from store ${styleText('cyan', storeName)}!`,
    overwriteConfirmation: 'Do you want to proceed with deleting the value at this key?',
  },

  envSet: {
    generateWarning: (variableName: string) =>
      `${styleText('redBright', 'Warning')}: The environment variable ${styleText('bgBlueBright', variableName)} already exists!`,
    overwriteConfirmation: 'Do you want to overwrite it?',
  },

  envUnset: {
    generateWarning: (variableName: string) =>
      `${styleText('redBright', 'Warning')}: The environment variable ${styleText('bgBlueBright', variableName)} will be removed from all contexts!`,
    overwriteConfirmation: 'Do you want to remove it?',
  },

  envClone: {
    generateWarning: (siteId: string) =>
      `${styleText('redBright', 'Warning')}: The following environment variables are already set on the project with ID ${styleText('bgBlueBright', siteId)}. They will be overwritten!`,
    noticeEnvVars: `${styleText('yellowBright', 'Notice')}: The following variables will be overwritten:`,
    overwriteConfirmation: 'The environment variables already exist. Do you want to overwrite them?',
  },
}
