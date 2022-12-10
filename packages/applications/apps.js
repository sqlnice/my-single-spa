import {
  isActive,
  isLoaded,
  isntActive,
  isntLoaded,
  notSkipped,
  NOT_LOADED,
  shouldBeActive,
  shouldntBeActive,
  withoutLoadError
} from './app.helper'
import { invoke } from '../navigation/invoke'
const APPS = []

/**
 * 获取所有子应用名称
 * @return
 */
export function getAppNames() {
  return APPS.map(({ name }) => name)
}

/**
 * 需要被加载的 APP
 * 1. 没有加载中断
 * 2. 没有加载错误
 * 3. 没有被加载过
 * 4. 满足 app.activityWhen()
 * @return {app[]}
 */
export function getAppsToLoad() {
  return APPS.filter(notSkipped).filter(withoutLoadError).filter(isntLoaded).filter(shouldBeActive)
}

/**
 * 需要被加载的 app
 * 1. 没有加载中断
 * 2. 加载过的
 * 3. 非激活的
 * 4. 需要被激活的
 * @returns
 */
export function getAppsToMount() {
  return APPS.filter(notSkipped).filter(isLoaded).filter(isntActive).filter(shouldBeActive)
}

/**
 * 需要被卸载的 APP
 * 1. 没有加载中断
 * 2. 已激活
 * 3. 需要卸载的
 */
export function getAppsToUnmount() {
  return APPS.filter(notSkipped).filter(isActive).filter(shouldntBeActive)
}

/**
 * 获取已挂载的 APP
 */
export function getMountedApps() {
  return APPS.filter(isActive).map(name => name)
}

/**
 * 注册子应用
 * @param {string} appName 子应用名称
 * @param {Object|Function<Promise>} applicationOrLoadFunction 子应用配置和异步加载函数
 * @param {Function<Boolean>} activityWhen 判断是否应该被挂载
 * @param {Object} customProps 自定义配置
 * @return {Promise}
 */
export function registerApplication(appName, applicationOrLoadFunction, activityWhen, customProps = {}) {
  if (!appName || typeof appName !== 'string') throw new Error('参数:appName 不能为空字符串')
  if (getAppNames().includes(appName)) throw new Error(`子应用appName: ${appName} 已注册`)
  if (!applicationOrLoadFunction) throw new Error('缺少参数: applicationOrLoadFunction')
  if (typeof activityWhen !== 'function') throw new Error('参数: activityWhen 格式必须为 Function')
  if (typeof customProps !== 'object' || Array.isArray(customProps))
    throw new Error('参数:customProps 格式必须为 Object')
  if (typeof applicationOrLoadFunction !== 'function') {
    // 转换子应用加载函数
    applicationOrLoadFunction = () => Promise.resolve(applicationOrLoadFunction)
  }

  APPS.push({
    name: appName,
    loadApp: applicationOrLoadFunction,
    activityWhen,
    customProps,
    status: NOT_LOADED,
    services: []
  })
  return invoke()
}
