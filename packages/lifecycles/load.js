import {
  LOAD_ERROR,
  LOAD_RESOURCE_CODE,
  MOUNTED,
  NOT_BOOTSTRAPPED,
  NOT_LOADED,
  NOT_MOUNTED,
  SKIP_BEACUSE_BROKEN,
  UNMOUNTING
} from '../applications/app.helper'
import { ensureAppTimeouts, reasonableTime } from '../applications/timeouts'
import { flattenFnArray, getProps, isAPromise, validLifeCyclesFn } from './helper'

export function toUnmountPromise(app) {
  if (app.status !== MOUNTED) {
    return Promise.resolve(app)
  }

  app.status = UNMOUNTING

  function unmountThisApp(serviceUnmountError) {
    return reasonableTime(app.unmount(getProps(app)), `app: ${app.name} unmounting`, app.timeouts.unmount)
      .catch(e => {
        console.log(e)
        app.status = SKIP_BEACUSE_BROKEN
      })
      .then(() => {
        // APP 卸载完成
        if (app.status !== SKIP_BEACUSE_BROKEN) {
          // 由于是 serviceUnmountError 是 Promise.all 返回的, 可能为[]
          app.status = serviceUnmountError === true ? SKIP_BEACUSE_BROKEN : NOT_MOUNTED
        }
        return app
      })
  }

  // 优先卸载 app 中的 services (如果存在)
  const unmountServicePromise = Promise.all(Object.keys(app.services).map(name => app.services[name].unmountSelf()))
  return unmountServicePromise
    .catch(e => {
      console.log(e)
      return true
    })
    .then(unmountThisApp)
}

export function toLoadPromise(app) {
  if (app.status !== NOT_LOADED && app.status !== LOAD_ERROR) {
    // app 已经被 load
    return Promise.resolve(app)
  }
  // 需要被 load
  app.status = LOAD_RESOURCE_CODE
  const loadPromise = app.loadApp(getProps(app))
  if (!isAPromise(loadPromise)) {
    console.log('app loadFunction must return a promise')
    app.status = SKIP_BEACUSE_BROKEN
    return Promise.resolve(app)
  }

  return loadPromise
    .then(module => {
      const errMsg = []
      if (typeof module !== 'object') {
        errMsg.push(`app: ${app.name} 没有导出任何东西`)
      }
      ;['bootstrap', 'mount', 'unmount'].forEach(lifecycle => {
        if (!validLifeCyclesFn(module[lifecycle])) {
          errMsg.push(`app: ${app.name} 没有导出生命周期: ${lifecycle},或不是一个方法`)
        }
      })
      if (errMsg.length) {
        console.log(errMsg)
        app.status = SKIP_BEACUSE_BROKEN
        return app
      }

      app.status = NOT_BOOTSTRAPPED
      app.bootstrap = flattenFnArray(module.bootstrap)
      app.mount = flattenFnArray(module.mount)
      app.unmount = flattenFnArray(module.unmount)
      app.unload = flattenFnArray(module.unload)
      // 确保有超时处理
      app.timeouts = ensureAppTimeouts(module.timeouts)
      return app
    })
    .catch(e => {
      console.log(e)
      app.status = LOAD_ERROR
      return app
    })
}
