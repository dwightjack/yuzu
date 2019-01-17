import { Component } from 'yuzu';

export class Count extends Component {
  public state = {
    count: 0,
  };

  public actions = {
    count: (v) => (this.$el.textContent = v),
  };
}
