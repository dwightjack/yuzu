# Context

A context is an object you can inject into a component instance.

You can inject the same context into multiple instances thus sharing its data.

After the injection the context's data will be available inside the component through a `$context` property.

?> Child components registered with `setRef` will inherit the parent `$context` property.

<!-- TOC depthTo:3 -->

- [Example](#example)
- [Data management](#data-management)
  - [Read](#read)
  - [Updates](#updates)
- [Context vs Store](#context-vs-store)
- [Recipes](#recipes)

<!-- /TOC -->

## Example

The most common usage scenario for Context is sharing data among a group of components by _injecting_ it into each instance:

```js
import { Component } from '@yuzu/core';
import { createContext } from '@yuzu/application';

const one = new Component();
const two = new Component();

// create a new context
const context = createContext({
  theme: 'dark',
});

// inject it into the dummy components
context.inject(one);
context.inject(two);

console.log(one.$context.theme); // logs 'dark'

// $context data are shared between instances
one.$context.theme === one.$context.theme;
```

## Data management

### Read

To retrieve data stored into the context use the `getData` method:

```js
const context = createContext({
  theme: 'dark',
});

const data = context.getData();

data.theme === 'dark';
```

?> Inside a component, context's data are exposed on the `$context` property.

### Updates

To update a context's data, you can use the `update` method:

```js
const context = createContext({
  theme: 'dark',
});

context.update({ theme: 'light' });

context.getData().theme === 'light';
```

Note that `update` **completely replaces** the previous stored data.

!> By design components are not allowed to directly update a context.

## Context vs Store

Context is meant to be used as an entry point for sharable data. This means there is no update tracking system nor any flux-like pattern provided.

In order to implement a shared store you could leverage a library like [Redux](https://redux.js.org/) or [unistore](https://www.npmjs.com/package/unistore) and attach the store instance to a context:

```js
import { Component } from '@yuzu/core';
import { createContext } from '@yuzu/application';
import createStore from 'unistore';

const instance = new Component();

const store = createStore({ theme: 'dark' });
const context = createContext({ store });

context.inject(instance);

//access store state
instance.$context.store.getState().theme === 'dark';

// react to store updates
instance.$context.store.subscribe((state) => {
  // ...
});
```

## Recipes

- [Use unistore with context](packages/application/docs/recipes/unistore.md)
- [Use redux with context](packages/application/docs/recipes/redux.md)
  recipes/
