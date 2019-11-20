import { Component, devtools } from 'yuzu';
import * as detached from './detached';
import * as todo from './todo';
import * as store from './store';

devtools(Component);

const routes: Record<string, any> = {
  detached,
  todo,
  store,
};

let current: any = null;

const links = document.querySelectorAll('#nav .nav-link');
const root = document.getElementById('app');

if (root) {
  const updateLinks = (): void => {
    links.forEach((el) => {
      const active = (el.getAttribute('href') || '').includes(location.hash);
      el.classList[active ? 'add' : 'remove']('active');
    });
  };

  const render = async (): Promise<void> => {
    const hash = location.hash.replace('#', '');
    const route = routes[hash];
    if (!route) {
      throw new Error(`Route ${hash} not found.`);
    }
    updateLinks();
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
