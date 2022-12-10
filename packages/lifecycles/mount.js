import { MOUNTED, MOUNTING, NOT_MOUNTED, SKIP_BEACUSE_BROKEN } from '../applications/app.helper'
import { reasonableTime } from '../applications/timeouts'
import { getProps } from './helper'
import { toUnmountPromise } from './load'

export function toMountPromise(app) {
  if (app.status !== NOT_MOUNTED) return Promise.resolve(app)
  app.status = MOUNTING

  return reasonableTime(app.mount(getProps(app)), `app: ${app.name} mounting`, app.timeouts.mount)
    .then(() => {
      app.status = MOUNTED
    })
    .catch(e => {
      console.log(e)
      app.status = MOUNTED

      // 挂载失败需要卸载
      return toUnmountPromise(app)
        .catch(e => {
          console.log(e)
        })
        .then(() => {
          app.status = SKIP_BEACUSE_BROKEN
          return app
        })
    })
}
