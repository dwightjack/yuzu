import { mount } from 'yuzu';
import { Form } from './form';
import { App } from './app';
import { TodoList } from './list';
export { template } from './template';

export function initialize(root: HTMLElement): () => Promise<void> {
  if (!root) {
    return () => Promise.resolve();
  }

  const component = mount(App, root, {}, (app) => [
    mount(Form, app.$els.form, {
      id: 'form',
      on: {
        submit: (v) => app.addTodo(v),
      },
    }),
    mount(TodoList, app.$els.list, {
      id: 'list',
      on: {
        completed: (id) => app.toggleComplete(id),
        remove: (id) => app.removeTodo(id),
      },
      state: {
        'todos>todos': (todos: any[]) => todos,
      },
      itemTemplate: (root.querySelector('#todo-item-tmpl') as HTMLElement)
        .innerHTML,
    }),
  ])();

  return () => component.destroy();
}
