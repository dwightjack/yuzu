# Yuzu

> old school component management

## Why?

There are scenarios where you need to add interactivity to a web page or web application where the HTML is already in place, rendered by a server-side service.

To address these scenarios you can use **Yuzu** to organize your application in a component-based, progressive enhanced architecture.

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

<iframe src="https://codesandbox.io/embed/yuzu-demo-m1v2m?autoresize=1&fontsize=14&initialpath=%2Fexamples%2Ftimer%2Findex.html&view=preview" title="Yuzu Demo" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

Learn more about Yuzu on the core package [**documentation**](packages/yuzu/).

## Official Packages

- [yuzu](packages/yuzu/)
- [yuzu-application](packages/yuzu-application/)
- [yuzu-utils](packages/yuzu-utils/)
- [yuzu-loadable](packages/yuzu-loadable/)
- [yuzu-polyfills](packages/yuzu-polyfills/)
