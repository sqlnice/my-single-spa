const PREFIX_ID = '#my-single-spa_'
function checkElement(boxId) {
  const ele = boxId + ' #mss_container'
  let div = null

  if (!document.querySelector(boxId)) {
    div = document.createElement('div')
    div.id = boxId.slice(1)
    document.body.appendChild(div)
  }

  if (!document.querySelector(ele)) {
    div = document.createElement('div')
    div.id = 'mss_container'
    document.querySelector(boxId).appendChild(div)
  }

  return ele
}

function emptyElement(boxId) {
  const box = document.querySelector(boxId)
  if (box) box.innerHTML = ''
}

const defaultOpts = {
  Vue: null,
  appOptions: null,
  template: null
}

function bootstrap(opts) {
  return Promise.resolve()
}
function mount(opts, mountedInstances, props) {
  const el = opts.appOptions.el
  const boxId = PREFIX_ID + props.name

  if (!el || String(el).indexOf(boxId) === 0) {
    opts.appOptions.el = checkElement(boxId)
  }

  mountedInstances.instance = new opts.Vue(opts.appOptions)
  if (mountedInstances.instance.bind) {
    mountedInstances.instance = mountedInstances.instance.bind(mountedInstances.instance)
  }

  return Promise.resolve()
}

function unmount(opts, mountedInstances, props) {
  mountedInstances.instance.$destroy()
  mountedInstances.instance.$el.innerHTML = ''
  emptyElement(PREFIX_ID + props.name)
  delete mountedInstances.instance
  return Promise.resolve()
}

window.mySingleSpaVue = function (options) {
  if (typeof options !== 'object') {
    throw new Error('mySingleSpaVue options must be a object')
  }

  let opts = Object.assign({}, defaultOpts, options)

  if (!options.Vue) {
    throw new Error('mySingleSpaVue must be passed a Vue')
  }

  if (!options.appOptions) {
    throw new Error('mySingleSpaVue must be passed a appOptions')
  }

  let mountedInstances = {}

  return {
    bootstrap: bootstrap.bind(null, opts, mountedInstances),
    mount: mount.bind(null, opts, mountedInstances),
    unmount: unmount.bind(null, opts, mountedInstances)
  }
}
