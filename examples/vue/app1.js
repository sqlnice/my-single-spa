;(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
    ? define(['exports'], factory)
    : ((global = global || self), (global.app1 = factory()))
})(this, function () {
  'use strict'
  const vueLifecycles = mySingleSpaVue({
    Vue: window.Vue,
    appOptions: {
      template: `<div>hello my-single-spa for Vue; <br> this content made for app1! Time:{{now}}</div>`,
      data() {
        return {
          now: 0,
          timer: null
        }
      },
      created() {
        this.timer = setInterval(() => {
          this.now = Date.now()
        }, 1000)
      },
      beforDestroy() {
        this.now = 0
        clearInterval(this.timer)
      }
    }
  })
  return {
    bootstrap: [vueLifecycles.bootstrap],
    mount: [vueLifecycles.mount],
    unmount: [vueLifecycles.unmount]
  }
})
