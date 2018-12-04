import { Component } from 'yuzu';

export class Counter extends Component {
  public state = {
    count: 0,
  };

  public actions = {
    count: (num) => ((this.$el as HTMLElement).innerText = num),
  };
}
