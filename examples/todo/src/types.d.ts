export interface ITodo {
  text: string;
  completed: boolean;
  id: string | null;
}

export interface IAppState {
  todos: ITodo[];
  count: number;
}
