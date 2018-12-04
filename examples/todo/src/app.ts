import { Component } from 'yuzu';

export class App extends Component {
  public $els: {
    list: HTMLUListElement;
    form: HTMLFormElement;
    count: HTMLElement;
  };

  public selectors = {
    list: '#list',
    form: '#form',
    count: '#count',
  };

  public state = {
    todos: [],
    count: 0,
  };

  public actions = {
    todos: 'setCount',
    count: 'updateCountText',
  };

  public addTodo(text) {
    const todo = { text, completed: false, id: null };
    this.setState(({ todos }) => ({ todos: [...todos, todo] }));
  }

  public removeTodo(todoId) {
    const todoIdx = this.getTodoIdxById(todoId);
    if (todoIdx !== false) {
      const { todos } = this.state;
      this.setState({
        todos: [...todos.slice(0, todoIdx), ...todos.slice(todoIdx + 1)],
      });
    }
  }

  public getTodoIdxById(todoId) {
    const { todos } = this.state;
    const todoIdx = todos.findIndex(({ id }) => id === todoId);
    return todoIdx !== -1 ? todoIdx : false;
  }

  public setCount() {
    this.setState({
      count: this.state.todos.filter(({ completed }) => !completed).length,
    });
  }

  public updateCountText() {
    this.$els.count.textContent = `${this.state.count} items left`;
  }

  public toggleComplete(todoId) {
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
