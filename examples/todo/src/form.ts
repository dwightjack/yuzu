import { Component } from '@packages/yuzu/src';

export class Form extends Component {
  public $els: {
    input: HTMLInputElement;
  };

  public selectors = {
    input: 'input[name="todo"]',
  };

  public listeners = {
    submit: 'onSubmit',
  };

  public onSubmit(e) {
    e.preventDefault();
    const str = this.$els.input.value.trim();
    if (str) {
      this.emit('submit', str);
      this.$els.input.value = '';
    }
  }
}
