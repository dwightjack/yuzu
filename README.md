# Yuzu

> old school component management

## Why?

There are scenarios where you need to add interactivity to a web page or web application where the HTML is already in place, rendered by a server-side service.

To address these scenarios you can use Yuzu to organize your application in a component-based, progressive enhanced architecture.

Learn more at https://dwightjack.github.io/yuzu/.

## Example

```html
<div class="timer">
  <p class="timer__value">0</p>
  <p></p>
</div>
```

```js
import { Component } from 'yuzu';

class Timer extends Component {
  selectors = {
    value: '.timer__value',
  };

  state = {
    elapsed: 0,
  };

  actions = {
    elapsed: 'update',
  };

  mounted() {
    this.interval = setInterval(() => {
      this.setState(({ elapsed }) => ({ elapsed: elapsed + 1 }));
    }, 1000);
  }

  beforeDestroy() {
    clearInterval(this.interval);
  }

  update() {
    this.$els.value.innerText = this.state.elapsed;
  }
}

new Timer().mount('.timer');
```

[![Edit Yuzu Demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/yuzu-demo-m1v2m?autoresize=1&fontsize=14&initialpath=%2Fexamples%2Ftimer%2Findex.html&view=preview)

Read the core package [documentation](https://dwightjack.github.io/yuzu/#/packages/yuzu/) to learn more.

## Packages

- [yuzu](packages/yuzu/)
- [yuzu-application](packages/yuzu-application/)
- [yuzu-utils](packages/yuzu-utils/)
- [yuzu-loadable](packages/yuzu-loadable/)
- [yuzu-polyfills](packages/yuzu-polyfills/)
