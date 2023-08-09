import { debuglog } from 'util'

export const debug = (...args: any[]) => {
  if (process.env.MOBIUS_CUSTOM_DEBUG === 'mobius') {
    console.log(...args)
  }
  // @ts-ignore
  debuglog('mobius')(...args)
}
