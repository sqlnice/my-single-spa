import { invoke } from './invoke'

// 拦截的事件名称
const HIJACK_EVENTS_NAME = /^(hashchange|popstate)$/i
const EVENTS_POOL = {
  hashchange: [],
  popstate: []
}

function reroute() {
  // invoke 用来 load/mount/unmount 满足条件的 app
  invoke([], arguments)
}
// 路由哈希值变化时触发
window.addEventListener('hashchange', reroute)
// 激活同一文档中不同的历史记录条目时
// 或者点击后退按钮
// 或者在 JavaScript 中调用 history.back() 方法时触发
// 注意, pushState 和 replaceState 不会触发 popstate 事件
// 所以我们要在下面重写
window.addEventListener('popstate', reroute)

// 拦截所有注册事件(针对 React/Vue 框架), 以确保首先执行此处事件
const originalAddEventListener = window.addEventListener
const originalRemoveEventListener = window.removeEventListener

window.addEventListener = function (eventName, handler) {
  if (eventName && HIJACK_EVENTS_NAME.test(eventName) && typeof handler === 'function') {
    const eventList = EVENTS_POOL[eventName]
    // 首次注册时,保存起来
    if (eventList.indexOf(handler) === -1) eventList.push(handler)
  }
  // 立即执行
  return originalAddEventListener.apply(this, arguments)
}

window.removeEventListener = function (eventName, handler) {
  if (eventName && HIJACK_EVENTS_NAME.test(eventName) && typeof handler === 'function') {
    const eventList = EVENTS_POOL[eventName]
    if (eventList.indexOf(handler) > -1) EVENTS_POOL[eventName] = eventList.filter(fn => fn !== handler)
  }
  return originalRemoveEventListener.apply(this, arguments)
}

// 拦截 history, 因为 pushState 和 replaceState 不会触发 popstate 事件
const originalHistoryPushState = window.history.pushState
const originalHistoryReplaceState = window.history.replaceState
window.history.pushState = function (state, title, url) {
  const result = originalHistoryPushState.apply(this, arguments)
  // 模拟 popstate 事件
  reroute(new PopStateEvent('popstate', { state }))
  return result
}
window.history.replaceState = function (state, title, url) {
  const result = originalHistoryReplaceState.apply(this, arguments)
  // 模拟 popstate 事件
  reroute(new PopStateEvent('popstate', { state }))
  return result
}
// 子应用的 load/mount/unmount 执行完后,执行此函数,可以保证微前端的逻辑总是第一个执行,然后再执行具体框架的 location 事件
export function callCapturedEvents(eventArgs) {
  if (!eventArgs) return
  if (Array.isArray(eventArgs)) {
    eventArgs = eventArgs[0]
  }
  const name = eventArgs.type
  // 是否是拦截的事件名称
  if (!HIJACK_EVENTS_NAME.test(name)) return
  // 为什么 this 为 window ?
  EVENTS_POOL[name].forEach(handler => handler.apply(window, eventArgs))
}
