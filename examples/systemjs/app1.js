;(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
    ? define(['exports'], factory)
    : ((global = global || self), (global.app1 = factory()))
})(this, function () {
  'use strict'
  return {
    container: null,
    bootstrap: async props => {
      this.container = document.getElementById('app')
      this.container.innerHTML = 'bootstrapping'
    },
    mount: async props => {
      this.container.innerHTML = `<span style="color: red">APP1</span> 已挂载</br> ${new Date()}`
      console.log(`${props.name} 已挂载`)
    },
    unmount: async props => {
      this.container.innerHTML = ''
      console.log(`${props.name} 已卸载`)
    },
    unload: async props => {
      delete this.container
      console.log(`${props.name} 已注销`)
    }
  }
})
