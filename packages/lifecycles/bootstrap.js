import { BOOTSTRAPPING, NOT_BOOTSTRAPPED, NOT_MOUNTED, SKIP_BEACUSE_BROKEN } from '../applications/app.helper'
import { reasonableTime } from '../applications/timeouts'
import { getProps } from './helper'

export function toBootstrapPromise(app) {
  if (app.status !== NOT_BOOTSTRAPPED) return Promise.resolve(app)

  app.status = BOOTSTRAPPING

  return reasonableTime(app.bootstrap(getProps(app)), `app: ${app.name} bootstrapping`, app.timeouts.bootstrap)
    .then(() => {
      app.status = NOT_MOUNTED
      return app
    })
    .catch(e => {
      console.log(e)
      app.status = SKIP_BEACUSE_BROKEN
      return app
    })
}
