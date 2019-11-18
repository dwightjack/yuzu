import { Component } from 'yuzu';
import { IAppState } from './types';

export class App extends Component<IAppState> {
  public $els!: {
    list: HTMLUListElement;
    form: HTMLFormElement;
    count: HTMLElement;
  };

  public selectors = {
    list: '#list',
    form: '#form',
    count: '#count',
  };

  public state: IAppState = {
    todos: [],
    count: 0,
  };

  public actions = {
    todos: 'setCount',
    count: 'updateCountText',
  };

  public addTodo(text: string): void {
    const todo = { text, completed: false, id: null };
    this.setState(({ todos }) => ({ todos: [...todos, todo] }));
  }

  public removeTodo(todoId: string): void {
    const todoIdx = this.getTodoIdxById(todoId);
    if (todoIdx !== false) {
      const { todos } = this.state;
      this.setState({
        todos: [...todos.slice(0, todoIdx), ...todos.slice(todoIdx + 1)],
      });
    }
  }

  public getTodoIdxById(todoId: string): number | false {
    const { todos } = this.state;
    const todoIdx = todos.findIndex(({ id }) => id === todoId);
    return todoIdx !== -1 ? todoIdx : false;
  }

  public setCount(): void {
    this.setState({
      count: this.state.todos.filter(({ completed }) => !completed).length,
    });
  }

  public updateCountText(): void {
    this.$els.count.textContent = `${this.state.count} items left`;
  }

  public toggleComplete(todoId: string): void {
    const todoIdx = this.getTodoIdxById(todoId);
    if (todoIdx !== false) {
      const { todos } = this.state;
      const todo = todos[todoIdx];
      this.setState({
        todos: [
          ...todos.slice(0, todoIdx),
          {
            ...todo,
            completed: !todo.completed,
          },
          ...todos.slice(todoIdx + 1),
        ],
      });
    }
  }
}
