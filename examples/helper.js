const menus = [
  {
    name: '快速开始',
    href: '/examples/started.html'
  },
  {
    name: 'systemjs 版本',
    href: '/examples/systemjs.html'
  },
  {
    name: 'Vuejs 版本',
    href: '/examples/vue.html'
  },
  {
    name: 'React 版本',
    href: '/examples/react.html'
  }
]
customElements.define(
  'common-header',
  class extends HTMLElement {
    constructor() {
      super()
      const shadowRoot = this.attachShadow({ mode: 'open' })
      const fragement = document.createDocumentFragment()
      const ul = document.createElement('ul')

      menus.forEach(menu => {
        const li = document.createElement('li')
        const a = document.createElement('a')
        a.setAttribute('href', menu.href)
        a.textContent = menu.name
        li.appendChild(a)
        fragement.appendChild(li)
      })

      ul.appendChild(fragement)
      shadowRoot.appendChild(ul)
    }
  }
)
const subMenus = [
  {
    name: '跳转到子应用 1',
    href: '#/app1'
  },
  {
    name: '跳转到子应用 2',
    href: '#/app2'
  }
]
customElements.define(
  'common-submenu',
  class extends HTMLElement {
    constructor() {
      super()
      const shadowRoot = this.attachShadow({ mode: 'open' })
      const fragement = document.createDocumentFragment()

      subMenus.forEach(menu => {
        const a = document.createElement('a')
        a.setAttribute('href', menu.href)
        a.textContent = menu.name
        fragement.appendChild(a)
      })

      shadowRoot.appendChild(fragement)
    }
  }
)
