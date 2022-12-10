import APP状态 from '../../doc/APP状态.png'
/**
 * 未加载
 */
export const NOT_LOADED = 'NOT_LOADED'
/**
 * 加载中子应用代码中
 */
export const LOAD_RESOURCE_CODE = 'LOAD_RESOURCE_CODE'
/**
 * 加载成功, 未启动
 */
export const NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED'
/**
 * 启动中
 */
export const BOOTSTRAPPING = 'BOOTSTRAPPING'
/**
 * 启动成功, 未挂载
 */
export const NOT_MOUNTED = 'NOT_MOUNTED'
/**
 * 挂载中
 */
export const MOUNTING = 'MOUNTING'
/**
 * 挂载成功
 */
export const MOUNTED = 'MOUNTED'
/**
 * 卸载中
 */
export const UNMOUNTING = 'UNMOUNTING'
/**
 * 加载时参数未通过校验或非致命错误
 */
export const SKIP_BEACUSE_BROKEN = 'SKIP_BEACUSE_BROKEN'
/**
 * 加载时遇到致命错误
 */
export const LOAD_ERROR = 'LOAD_ERROR'
/**
 * 更新 service 中
 */
export const UPDATING = 'UPDATING'

export function notSkipped(app) {
  return app.status !== SKIP_BEACUSE_BROKEN
}

export function withoutLoadError(app) {
  return app.status !== LOAD_ERROR
}

/**
 * 是否已加载
 * @param {*} app
 * @return {Boolean} Boolean
 */
export function isLoaded(app) {
  return app.status !== NOT_LOADED && app.status !== LOAD_ERROR && app.status !== LOAD_RESOURCE_CODE
}

/**
 * 未加载
 * @param {*} app
 * @return {Boolean} Boolean
 */
export function isntLoaded(app) {
  return !isLoaded(app)
}

/**
 * 是否已激活状态
 * @param {*} app
 * @return {Boolean} Boolean
 */
export function isActive(app) {
  return app.status === MOUNTED
}

/**
 * 是否失活状态
 * @param {*} app
 * @return {Boolean} Boolean
 */
export function isntActive(app) {
  return !isActive(app)
}

/**
 * 是否可以激活
 * @param {*} app
 * @return {Boolean} Boolean
 */
export function shouldBeActive(app) {
  try {
    return app.activityWhen(window.location)
  } catch (e) {
    app.status = SKIP_BEACUSE_BROKEN
    throw e
  }
}

/**
 * 是否可以失活
 * @param {*} app
 * @return {Boolean} Boolean
 */
export function shouldntBeActive(app) {
  try {
    return !app.activityWhen(window.location)
  } catch (e) {
    app.status = SKIP_BEACUSE_BROKEN
    throw e
  }
}
