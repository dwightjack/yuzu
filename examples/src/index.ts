import { Component, devtools } from 'yuzu';
import * as detached from './detached';
import * as todo from './todo';

devtools(Component);

const routes: Record<string, any> = {
  detached,
  todo,
};

let current: any = null;

const root = document.getElementById('app');

if (root) {
  const render = async (): Promise<void> => {
    const hash = location.hash.replace('#', '');
    const route = routes[hash];
    if (!route) {
      throw new Error(`Route ${hash} not found.`);
    }
    if (current) {
      await current();
    }
    root.innerHTML = '';
    root.appendChild(route.template());
    current = route.initialize(root);
  };

  window.addEventListener('hashchange', render, false);

  render();
}
