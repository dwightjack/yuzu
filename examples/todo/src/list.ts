import { Component } from 'yuzu';
import { Todo } from './todo';
import { ITodo } from './types';

interface ITodoListState {
  todos: ITodo[];
  todoIds: string[];
}

export class TodoList extends Component<ITodoListState> {
  public static defaultOptions = () => ({
    itemTemplate: '',
  });

  public todoIdx: number;

  public state: ITodoListState = {
    todos: [],
    todoIds: [],
  };

  public actions = {
    todos: 'renderList',
  };

  public renderList(): void {
    const { todos, todoIds } = this.state;
    let newTodoIds = todoIds;
    // first compute removed todos
    if (todos.length < todoIds.length) {
      newTodoIds = todos.map(({ id }) => id).filter(Boolean);
      todoIds.forEach((id) => {
        if (!newTodoIds.includes(id)) {
          this.destroyRef(id, true);
        }
      });
    }

    // then add a new ids
    todos.forEach((todo) => {
      if (todo.id) {
        // let's update the todo data
        if (this.$refs[todo.id]) {
          this.$refs[todo.id].setState(todo);
        }
        return;
      }
      // assign an id:
      const id = `todo-${(this.todoIdx += 1)}`;
      todo.id = id;
      newTodoIds.push(id);
      this.setRef<Todo, typeof Todo>(
        {
          id,
          el: document.createElement('li'),
          component: Todo,
          on: {
            remove: (todoId) => this.emit('remove', todoId),
            completed: (todoId) => this.emit('completed', todoId),
          },
          template: this.options.itemTemplate,
        },
        todo,
      ).then((item) => item);
    });
    this.setState({ todoIds: newTodoIds });
  }

  public created(): void {
    this.todoIdx = 0;
  }
}
