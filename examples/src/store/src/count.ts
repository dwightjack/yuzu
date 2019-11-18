import { Component } from 'yuzu';

interface ICountState {
  count: number;
}
export class Count extends Component<ICountState> {
  public state = {
    count: 0,
  };

  public actions = {
    count: (v: number) => (this.$el.textContent = `${v}`),
  };
}
