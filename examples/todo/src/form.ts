import { Component } from '@packages/yuzu/src';

export class Form extends Component {
  public $els: Component['$els'] & {
    input: any;
  };

  public selectors = {
    input: 'input[name="todo"]',
  };

  public listeners = {
    submit: 'onSubmit',
  };

  public onSubmit(e) {
    e.preventDefault();
    this.emit('submit', this.$els.input.value);

    this.$els.input.value = '';
  }
}
