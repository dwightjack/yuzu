import { Component } from 'yuzu';

export class Counter extends Component<{ count: number }> {
  public state = {
    count: 0,
  };

  public actions = {
    count: (num: number) => ((this.$el as HTMLElement).innerText = `${num}`),
  };
}
