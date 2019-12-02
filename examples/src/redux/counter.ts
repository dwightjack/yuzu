import { Component } from 'yuzu';

interface ICounterState {
  count: number;
}

export class Counter extends Component<ICounterState> {
  public state: ICounterState = {
    count: 0,
  };

  public actions = {
    count: (num: number) => (this.$el.textContent = `Total: ${num}`),
  };
}
