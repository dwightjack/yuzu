import { Component, devtools } from 'yuzu';
import * as detached from './detached'

devtools(Component);


const routes: Record<string, any> = {
  detached: detached
}

let current: any = null

const root = document.getElementById('app')


if (root) {

  window.addEventListener('hashchange', () => {
    const hash = location.hash.replace('#', '')
    const route = routes[hash]
    if (!route) {
      throw new Error(`Route ${hash} not found.`)
    }
    if (current) {
      current()
    }
    root.innerHTML = ''
    root.appendChild(route.template())
    current = route.initialize(root);
  }, false);
}


