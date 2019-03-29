import { Component } from 'yuzu';
import { ITodo } from './types';

interface ITodoOptions {
  template: string;
}

export class Todo extends Component<ITodo, ITodoOptions> {
  public defaultOptions(): ITodoOptions {
    return { template: '' };
  }

  public $els: {
    text: HTMLElement;
    complete: HTMLButtonElement;
    remove: HTMLButtonElement;
  };

  public selectors = {
    text: '.todo-text',
    complete: 'button[data-action="complete"]',
    remove: 'button[data-action="remove"]',
  };

  public listeners = {
    'click @remove': () => this.emit('remove', this.state.id),
    'click @complete': () => this.emit('completed', this.state.id),
  };

  public state = {
    id: null,
    text: '',
    completed: false,
  };

  public actions = {
    text: (str: string) => (this.$els.text.textContent = str),
    completed: (completed: boolean) =>
      this.$el.classList[completed ? 'add' : 'remove']('is-completed'),
  };

  public beforeMount(): void {
    this.$el.className = 'list-group-item';
    this.$el.innerHTML = this.options.template;
  }
}
