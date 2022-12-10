import * as mySingleSpa from '../index'
export function getProps(app) {
  return {
    ...app.customProps,
    name: app.name,
    // mountService: mountService.bind(app),
    mySingleSpa
  }
}

export function isAPromise(promise) {
  if (promise instanceof Promise) return true
  return typeof promise === 'object' && typeof promise.then === 'function' && typeof promise.catch === 'function'
}

export function validLifeCyclesFn(fn) {
  if (typeof fn === 'function') return true
  if (Array.isArray(fn)) {
    return fn.filter(i => typeof i !== 'function').length === 0
  }
  return false
}

/**
 * 拍平 Promise 数组
 * @param {*} fns
 * @returns
 */
export function flattenFnArray(fns = []) {
  if (!Array.isArray(fns)) fns = [fns]
  if (fns.length === 0) {
    fns = [() => Promise.resolve()]
  }

  return function (props) {
    return new Promise((resolve, reject) => {
      // 待验证是否可行
      // fns.reduce(async (pre, cur, index, arr) => {
      //   const fn = cur(props)
      //   if (!isAPromise(fn)) {
      //     reject(`${fn} 未返回 promise`)
      //     return
      //   }
      //   await fn.then()
      //   if (index === arr.length - 1) {
      //     resolve()
      //   }
      // }, null)

      waitForPromises(0)
      function waitForPromises(index) {
        const fn = fns[index](props)
        if (!isAPromise(fn)) {
          reject(`${fn} 未返回 promise`)
          return
        }
        fn.then(() => {
          if (index === fns.length - 1) {
            resolve()
          } else {
            waitForPromises(++index)
          }
        }).catch(e => {
          reject(e)
        })
      }
    })
  }
}
