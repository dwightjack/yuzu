import { Component } from '@packages/yuzu/src';

export class Counter extends Component {
  public state = {
    count: 0,
  };

  public actions = {
    count: (num) => ((this.$el as HTMLElement).innerText = num),
  };
}
