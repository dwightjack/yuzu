import { Component, devtools, mount } from 'yuzu';
import { Form } from './form';
import { App } from './app';
import { TodoList } from './list';

devtools(Component);

mount(App, '#app', {}, (app: App) => [
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
      'todos>todos': (todos) => todos,
    },
    itemTemplate: document.querySelector('#todo-item-tmpl').innerHTML,
  }),
])();
