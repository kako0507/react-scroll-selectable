# Selectable items for React

Allows individual or group selection of items using the mouse. Click and drag to lasso multiple items.
Forked from [react-selectable](https://github.com/unclecheese/react-selectable)

## Usage

### JavaScript ES5

```js
var React = require('react');
var Selectable = require('react-selectable');

var App = React.createClass({
  render: function () {
    return (
      <Selectable onSelection={this.handleSelection}>
        {this.props.items.map(function(item, i) {
          return <MyItem key={i}>{item.title}</MyItem>;
        })}
      </Selectable>
    );
  },
  handleSelection: function (keys) {
    console.log('you selected the following keys', keys);
  }
});

var MyItem = React.createClass({
  render: function () {
    return (
      <div className={this.props.selected ? 'selected' : ''>
        {this.props.children}
      </div>
    );
  }
});
```

### JavaScript ES6

```js
import React, {Component} from 'react';
import Selectable from 'react-selectable';

class App extends Component {
  render() {
    return (
      <Selectable onSelection={this.handleSelection}>
        {this.props.items.map((item, i) => (
          <MyItem key={i}>{item.title}</MyItem>
        ))}
      </Selectable>
    );
  }
  handleSelection(keys) {
    console.log('you selected the following keys', keys);
  }
}

class MyItem extends Component {
  render() {
    return (
      <div className={this.props.selected ? 'selected' : ''>
        {this.props.children}
      </div>
    );
  }
}
```

Selected items receive the property `selected`.

## Configuration

The component accepts a few optional props:
* `selectboxBorderWidth` (number) The border-width of selectbox.
* `selectboxBorderStyle` (string) The border-style of selectbox.
* `selectboxBorderColor` (string) The border-color of selectbox.
* `onSelection` (function) Fired after user completes selection
* `tolerance` (number|object) The amount of buffer to add around your `<Selectable />` container, in pixels. To set custom tolerances for each border of the container, pass an object containing values for `top`, `left`, `bottom`, and `right`, e.g. `{ top: 30, left: 40, bottom: 100, right: 0 }`.
* `component` (string) The component to render. Defaults to `div`.
* `disabled` (boolean) disable selectable or not.
* `autoScroll` (boolean) Auto-scrolling of parent component.
* `scrollSpeed` (number) The speed of auto-scrolling.
