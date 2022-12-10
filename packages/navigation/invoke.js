import { callCapturedEvents } from './hijackLocation'
import { isStarted } from '../start.js'
import { getAppsToLoad, getAppsToMount, getAppsToUnmount, getMountedApps } from '../applications/apps'
import { toLoadPromise, toUnmountPromise } from '../lifecycles/load'
import { toBootstrapPromise } from '../lifecycles/bootstrap'
import { toMountPromise } from '../lifecycles/mount'
// 加载应用程序正在进行中
let loadAppsUnderway = false
let pendingPromises = []

/**
 * 注册 / 启动 / 路由切换都会调用
 * @param {*} pendings
 * @param {*} eventArgs
 * @returns
 */
export function invoke(pendings = [], eventArgs) {
  // 加载应用程序正在进行中, 缓存本次, 本次加载完成后再执行
  if (loadAppsUnderway) {
    return new Promise((resolve, reject) => {
      pendingPromises.push({ success: resolve, failure: reject, eventArgs })
    })
  }
  loadAppsUnderway = true

  if (isStarted()) {
    // 微前端已启动, 进行子应用更改
    return performAppChange()
  }
  // 注册加载子应用
  return loadApps()

  /**
   * 启动 / 路由切换都会调用
   */
  function performAppChange() {
    // 需要被卸载的 APP
    const unmountApps = getAppsToUnmount()
    const unmountPromises = Promise.all(unmountApps.map(toUnmountPromise))

    // 需要被加载的 APP
    const loadApps = getAppsToLoad()
    const loadPromise = loadApps.map(app => {
      return (
        toLoadPromise(app)
          // 启动
          .then(app => toBootstrapPromise(app))
          // 卸载
          .then(() => unmountPromises)
          // 挂载
          .then(() => toMountPromise(app))
      )
    })
    // 需要被挂载的 APP
    const mountApps = getAppsToMount()
    const mountPromises = mountApps.map(app => {
      return toBootstrapPromise(app)
        .then(() => unmountPromises)
        .then(() => toMountPromise(app))
    })

    // 执行卸载
    return unmountPromises.then(
      () => {
        // 确保子应用卸载和挂载完后再执行路由事件监听器
        callCapturedEvents()

        // 执行挂载和卸载
        const loadAndMountPromises = loadPromise.concat(mountPromises)
        return Promise.all(loadAndMountPromises).then(finish, e => {
          pendings.forEach(item => item.reject(e))
        })
      },
      e => {
        callCapturedEvents()
        console.log(e)
        throw e
      }
    )
  }

  function loadApps() {
    const loadPromises = getAppsToLoad().map(toLoadPromise)

    return Promise.all(loadPromises)
      .then(() => {
        // 子应用加载完成
        callAllCapturedEvents()
        return finish()
      })
      .catch(e => {
        callAllCapturedEvents()
        console.log(e)
      })
  }

  // 每次循环终止时都会将已拦截的 location 事件进行触发, 这样就可以保证微前端的 location 总是首先执行,
  // 而 Vue 或 React 的 Router 总是在之后执行
  function finish() {
    // 初始化时, 可能为空
    const resolveValue = getMountedApps()

    // pendings 上一次缓存的 queue
    // 其实就是调用下面 invoke 方法的 backup
    if (pendings?.length) {
      pendings.forEach(item => item.success(resolveValue))
    }
    // 循环结束
    loadAppsUnderway = false

    if (pendingPromises.length) {
      const backup = pendingPromises
      pendingPromises = []
      // 将缓存的 queue 传入 invoke 开启下一次循环
      return invoke(backup)
    }

    // 终止循环 返回已挂载的 APP
    return resolveValue
  }

  function callAllCapturedEvents() {
    pendings.length && pendings.filter(item => item.eventArgs).forEach(item => callCapturedEvents(item.eventArgs))
    eventArgs && callCapturedEvents(eventArgs)
  }
}
