# Yuzu

> old school component management

## Why?

There are scenarios where you need to add interactivity to a web page or web application where the HTML is already in place, rendered by a server-side service.

To address these scenarios you can use **Yuzu** to organize your application in a component-based, progressive enhanced architecture.

## Example

```html
<div class="Timer">
  <p class="Timer__value">0<p>
</div>
```

```js
import { Component } from 'yuzu';

class Timer extends Component {
  selectors = {
    value: '.Timer__value',
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

new Timer().mount('.Timer');
```

[![Edit Yuzu Demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/4w5ml1kmk0?initialpath=%2Ftimer&module=%2Fexamples%2Ftimer%2Findex.js)

Learn more about Yuzu on the core package [**documentation**](packages/yuzu/).

## Official Packages

- [yuzu](packages/yuzu/)
- [yuzu-application](packages/application/)
- [yuzu-utils](packages/utils/)
- [yuzu-loadable](packages/loadable/)
- [yuzu-polyfills](packages/polyfills/)
