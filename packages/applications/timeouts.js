const DEFAULT_TIMEOUTS = {
  bootstrap: {
    // 超时(毫秒)
    millisecond: 3000,
    // 当超时，是否
    rejectWhenTimeout: false
  },
  mount: {
    // 超时(毫秒)
    millisecond: 3000,
    // 当超时，是否
    rejectWhenTimeout: false
  },
  unmount: {
    // 超时(毫秒)
    millisecond: 3000,
    // 当超时，是否
    rejectWhenTimeout: false
  },
  unload: {
    // 超时(毫秒)
    millisecond: 3000,
    // 当超时，是否
    rejectWhenTimeout: false
  }
}

export function ensureAppTimeouts(timeouts = {}) {
  return {
    ...DEFAULT_TIMEOUTS,
    ...timeouts
  }
}

/**
 * 卸载超时处理
 * @param {*} promise 上一步 flatten 处理过的生命周期函数
 * @param {*} description 描述
 * @param {*} timeouts 生命周期超时对象
 */
export function reasonableTime(promise, description, timeouts) {
  return new Promise((resolve, reject) => {
    let finished = false

    promise
      .then(data => {
        finished = true
        resolve(data)
      })
      .catch(e => {
        finished = true
        reject(e)
      })

    setTimeout(() => confirmTimeou(), timeouts.millisecond)
    function confirmTimeou() {
      if (finished) return
      const error = `${description} 没有在 ${timeouts.millisecond} 时间内 resolve 或 reject`
      if (timeouts.rejectWhenTimeout) {
        reject(new Error(error))
      } else {
        console.error(error)
      }
    }
  })
}
