'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function isNodeInRoot(node, root) {
  while (node) {
    if (node === root) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}

var Selectable = (function (_Component) {
  _inherits(Selectable, _Component);

  _createClass(Selectable, null, [{
    key: 'propTypes',

    /**
     * @type {Object}
     */
    value: {
      /**
       * Event that will fire when items are selected. Passes an array of keys
       */
      onSelection: _react2['default'].PropTypes.func,
      /**
       * The component that will represent the Selectable DOM node
       */
      component: _react2['default'].PropTypes.oneOfType([_react2['default'].PropTypes.func, _react2['default'].PropTypes.string]),
      /**
       * The style of selectbox's border
       */
      selectboxBorderWidth: _react2['default'].PropTypes.number,
      selectboxBorderStyle: _react2['default'].PropTypes.string,
      selectboxBorderColor: _react2['default'].PropTypes.string,
      /**
       * Expands the boundary of the selectable area. It can be an integer, which
       * applies to all sides, or an object containing "top", "bottom", "left",
       * and "right" values for custom distance on each side
       */
      distance: _react2['default'].PropTypes.oneOfType([_react2['default'].PropTypes.object, _react2['default'].PropTypes.number]),
      /**
       * Amount of forgiveness an item will offer to the selectbox before registering
       * a selection, i.e. if only 1px of the item is in the selection, it shouldn't be
       * included.
       */
      tolerance: _react2['default'].PropTypes.number,
      /**
       * If true, a click-and-drag with the mouse will generate a select box anywhere
       * in the document.
       */
      globalMouse: _react2['default'].PropTypes.bool,
      /**
       * If true, selectable will be no working.
       */
      disabled: _react2['default'].PropTypes.bool,
      /**
       * If true, selectable will be auto-scrolling
       */
      autoScroll: _react2['default'].PropTypes.bool,
      /**
       * The speed of auto-scrolling
       */
      scrollSpeed: _react2['default'].PropTypes.number
    },

    /**
     * @type {Object}
     */
    enumerable: true
  }, {
    key: 'defaultProps',
    value: {
      onSelection: function onSelection() {},
      component: 'div',
      selectboxBorderWidth: 1,
      selectboxBorderStyle: 'dashed',
      selectboxBorderColor: '#999',
      distance: 0,
      tolerance: 0,
      globalMouse: false,
      disabled: false,
      autoScroll: true,
      scrollSpeed: 50
    },
    enumerable: true
  }]);

  function Selectable() {
    _classCallCheck(this, Selectable);

    _get(Object.getPrototypeOf(Selectable.prototype), 'constructor', this).call(this);
    /**
     * This is stored outside the state, so that setting it doesn't
     * rerender the app during selection. shouldComponentUpdate() could work around that.
     * @type {Object}
     */
    this._mouseDownData = null;
    this.state = {
      isBoxSelecting: false,
      persist: false,
      boxWidth: 0,
      boxHeight: 0,
      selectedItems: []
    };
    this._openSelector = this._openSelector.bind(this);
    this._mouseUp = this._mouseUp.bind(this);
    this._selectElement = this._selectElement.bind(this);
    this._keyListener = this._keyListener.bind(this);
  }

  /**
   * Attach global event listeners
   */

  _createClass(Selectable, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      document.addEventListener('keydown', this._keyListener);
      document.addEventListener('keyup', this._keyListener);
    }

    /**
     * Remove global event listeners
     */
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      document.removeEventListener('keydown', this._keyListener);
      document.removeEventListener('keyup', this._keyListener);
    }

    /**
     * Renders the component
     * @return {ReactComponent}
     */
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var boxStyle = {
        position: 'absolute',
        zIndex: 9000,
        left: this.state.boxLeft,
        top: this.state.boxTop,
        width: this.state.boxWidth,
        height: this.state.boxHeight,
        borderWidth: this.props.selectboxBorderWidth,
        borderStyle: this.props.selectboxBorderStyle,
        borderColor: this.props.selectboxBorderColor,
        cursor: 'default'
      };

      return _react2['default'].createElement(
        this.props.component,
        _extends({}, this.props, {
          style: _extends({
            position: 'relative',
            height: '100%',
            overflowY: 'auto'
          }, this.props.style),
          onMouseDown: this._mouseDown.bind(this)
        }),
        this.state.isBoxSelecting && _react2['default'].createElement('div', { style: boxStyle, ref: 'selectbox' }),
        _react2['default'].Children.map(this.props.children, function (child, i) {
          return _react2['default'].cloneElement(child, {
            key: child.key || i,
            ref: 'selectable_' + child.key,
            selected: _this.state.selectedItems.indexOf(child.key) > -1
          });
        }, this)
      );
    }

    /**
     * Called while moving the mouse with the button down. Changes the boundaries
     * of the selection box
     */
  }, {
    key: '_openSelector',
    value: function _openSelector(e) {
      var node = _reactDom2['default'].findDOMNode(this);
      var left = e.pageX - node.offsetLeft + node.scrollLeft;
      var top = e.pageY - node.offsetTop + node.scrollTop;
      var newLeft = left;
      var newTop = top;
      var newWidth = this._mouseDownData.boxLeft - newLeft;
      var newHeight = this._mouseDownData.boxTop - newTop;
      var doubleBorderWidth = this.props.selectboxBorderWidth * 2;

      if (left > this._mouseDownData.boxLeft) {
        newLeft = this._mouseDownData.boxLeft;
        newWidth = left - this._mouseDownData.boxLeft - doubleBorderWidth;
      }
      if (top > this._mouseDownData.boxTop) {
        newTop = this._mouseDownData.boxTop;
        newHeight = top - this._mouseDownData.boxTop - doubleBorderWidth;
      }

      if (newLeft + newWidth > this._mouseDownData.nodeW - doubleBorderWidth) {
        newWidth = this._mouseDownData.nodeW - newLeft - doubleBorderWidth;
      } else if (newLeft < 0) {
        newWidth += newLeft;
        newLeft = 0;
      }
      if (newTop + newHeight > this._mouseDownData.nodeH - doubleBorderWidth) {
        newHeight = this._mouseDownData.nodeH - newTop - doubleBorderWidth;
      } else if (newTop < 0) {
        newHeight += newTop;
        newTop = 0;
      }

      this.setState({
        isBoxSelecting: true,
        boxWidth: newWidth,
        boxHeight: newHeight,
        boxLeft: newLeft,
        boxTop: newTop,
        selectedItems: this.state.persist ? this.state.selectedItems : []
      });

      if (this.props.autoScroll) {
        this.scrollPerhaps(e);
      }
    }

    /**
     * Auto scrolling
     */
  }, {
    key: 'scrollPerhaps',
    value: function scrollPerhaps(e) {
      var node = _reactDom2['default'].findDOMNode(this);
      var scrollSpeed = this.props.scrollSpeed;

      // Scroll down
      if (e.pageY + 10 > node.offsetTop + node.offsetHeight) {
        node.scrollTop += scrollSpeed;
        if (node.scrollTop > this._mouseDownData.nodeH) {
          node.scrollTop = this._mouseDownData.nodeH;
        }
      }
      // Scroll up
      if (e.pageY - 10 < node.offsetTop) {
        node.scrollTop -= scrollSpeed;
      }
      // Scroll right
      if (e.pageX + 10 > node.offsetLeft + node.offsetWidth) {
        node.scrollLeft += scrollSpeed;
        if (node.scrollLeft > this._mouseDownData.nodeW) {
          node.scrollLeft = this._mouseDownData.nodeW;
        }
      }
      // Scroll left
      if (e.pageX - 10 < node.offsetLeft) {
        node.scrollLeft -= scrollSpeed;
      }
    }

    /**
     * Called when a user presses the mouse button. Determines if a select box should
     * be added, and if so, attach event listeners
     */
  }, {
    key: '_mouseDown',
    value: function _mouseDown(e) {
      if (this.props.disabled) {
        return;
      }

      var node = _reactDom2['default'].findDOMNode(this);
      var collides = undefined;
      var offsetData = undefined;
      var distanceData = undefined;

      document.addEventListener('mouseup', this._mouseUp);

      // Right clicks
      if (e.nativeEvent.which !== 1) return;

      if (!isNodeInRoot(e.target, node) && !this.props.globalMouse) {
        distanceData = this._getDistanceData();
        offsetData = this._getBoundsForNode(node);
        collides = this._objectsCollide({
          top: offsetData.top - distanceData.top,
          left: offsetData.left - distanceData.left,
          bottom: offsetData.offsetHeight + distanceData.bottom,
          right: offsetData.offsetWidth + distanceData.right
        }, {
          top: e.pageY,
          left: e.pageX,
          offsetWidth: 0,
          offsetHeight: 0
        });

        if (!collides) return;
      }

      this._mouseDownData = {
        boxLeft: e.pageX - node.offsetLeft + node.scrollLeft,
        boxTop: e.pageY - node.offsetTop + node.scrollTop,
        nodeW: node.scrollWidth,
        nodeH: node.scrollHeight,
        initialX: e.pageX,
        initialY: e.pageY
      };

      e.preventDefault();

      document.addEventListener('mousemove', this._openSelector);
    }

    /**
     * Called when the user has completed selection
     */
  }, {
    key: '_mouseUp',
    value: function _mouseUp(e) {
      document.removeEventListener('mousemove', this._openSelector);
      document.removeEventListener('mouseup', this._mouseUp);

      if (!this._mouseDownData) return;
      var inRoot = isNodeInRoot(e.target, _reactDom2['default'].findDOMNode(this));
      var click = e.pageX === this._mouseDownData.initialX && e.pageY === this._mouseDownData.initialY;

      // Clicks outside the Selectable node should reset clear selection
      if (click && !inRoot) {
        this.setState({
          selectedItems: []
        });
        return this.props.onSelection([]);
      }

      // Handle selection of a single element
      if (click && inRoot) {
        return this._selectElement(e.pageX, e.pageY);
      }

      return this._selectElements(e);
    }

    /**
     * Selects a single child, given the x/y coords of the mouse
     * @param  {int} x
     * @param  {int} y
     */
  }, {
    key: '_selectElement',
    value: function _selectElement(x, y) {
      var _this2 = this;

      var currentItems = this.state.selectedItems;
      var index = undefined;

      _react2['default'].Children.forEach(this.props.children, function (child) {
        var node = _reactDom2['default'].findDOMNode(_this2.refs['selectable_' + child.key]);
        var collision = _this2._objectsCollide(node, {
          top: y,
          left: x,
          offsetWidth: 0,
          offsetHeight: 0
        }, _this2.props.tolerance);

        if (collision) {
          index = currentItems.indexOf(child.key);
          if (_this2.state.persist) {
            if (index > -1) {
              currentItems.splice(index, 1);
            } else {
              currentItems.push(child.key);
            }
          } else {
            currentItems = [child.key];
          }
        }
      }, this);

      this._mouseDownData = null;

      this.setState({
        isBoxSelecting: false,
        boxWidth: 0,
        boxHeight: 0,
        selectedItems: currentItems
      });

      this.props.onSelection(currentItems.map(function (item) {
        return item.substring(2);
      }));
    }

    /**
     * Selects multiple children given x/y coords of the mouse
     */
  }, {
    key: '_selectElements',
    value: function _selectElements(e) {
      var _this3 = this;

      var currentItems = this.state.selectedItems;

      this._mouseDownData = null;

      _react2['default'].Children.forEach(this.props.children, function (child) {
        var collision = _this3._objectsCollide(_reactDom2['default'].findDOMNode(_this3.refs.selectbox), _reactDom2['default'].findDOMNode(_this3.refs['selectable_' + child.key]), _this3.props.tolerance);
        if (collision) {
          currentItems.push(child.key);
        }
      }, this);

      this.setState({
        isBoxSelecting: false,
        boxWidth: 0,
        boxHeight: 0,
        selectedItems: currentItems
      });

      this.props.onSelection(currentItems.map(function (item) {
        return item.substring(2);
      }));
    }

    /**
     * Given a node, get everything needed to calculate its boundaries
     * @param  {HTMLElement} node
     * @return {Object}
     */
  }, {
    key: '_getBoundsForNode',
    value: function _getBoundsForNode(node) {
      var rect = node.getBoundingClientRect();

      return {
        top: rect.top + document.body.scrollTop,
        left: rect.left + document.body.scrollLeft,
        offsetWidth: node.offsetWidth,
        offsetHeight: node.offsetHeight
      };
    }

    /**
     * Resolve the disance prop from either an Int or an Object
     * @return {Object}
     */
  }, {
    key: '_getDistanceData',
    value: function _getDistanceData() {
      var distance = this.props.distance;

      if (!distance) {
        distance = 0;
      }

      if (typeof distance !== 'object') {
        return {
          top: distance,
          left: distance,
          right: distance,
          bottom: distance
        };
      }
      return distance;
    }

    /**
     * Given two objects containing "top", "left", "offsetWidth" and "offsetHeight"
     * properties, determine if they collide.
     * @param  {Object|HTMLElement} a
     * @param  {Object|HTMLElement} b
     * @return {bool}
     */
  }, {
    key: '_objectsCollide',
    value: function _objectsCollide(a, b, tolerance) {
      var aObj = a instanceof HTMLElement ? this._getBoundsForNode(a) : a;
      var bObj = b instanceof HTMLElement ? this._getBoundsForNode(b) : b;

      return this._coordsCollide(aObj.top, aObj.left, bObj.top, bObj.left, aObj.offsetWidth, aObj.offsetHeight, bObj.offsetWidth, bObj.offsetHeight, tolerance);
    }

    /**
     * Given offsets, widths, and heights of two objects, determine if they collide (overlap).
     * @param  {int} aTop    The top position of the first object
     * @param  {int} aLeft   The left position of the first object
     * @param  {int} bTop    The top position of the second object
     * @param  {int} bLeft   The left position of the second object
     * @param  {int} aWidth  The width of the first object
     * @param  {int} aHeight The height of the first object
     * @param  {int} bWidth  The width of the second object
     * @param  {int} bHeight The height of the second object
     * @return {bool}
     */
  }, {
    key: '_coordsCollide',
    value: function _coordsCollide(aTop, aLeft, bTop, bLeft, aWidth, aHeight, bWidth, bHeight, tolerance) {
      if (typeof tolerance === 'undefined') {
        tolerance = 0;
      }

      return !(
      // 'a' bottom doesn't touch 'b' top
      aTop + aHeight - tolerance < bTop ||
      // 'a' top doesn't touch 'b' bottom
      aTop + tolerance > bTop + bHeight ||
      // 'a' right doesn't touch 'b' left
      aLeft + aWidth - tolerance < bLeft ||
      // 'a' left doesn't touch 'b' right
      aLeft + tolerance > bLeft + bWidth);
    }

    /**
     * Listens for the meta key
     */
  }, {
    key: '_keyListener',
    value: function _keyListener(e) {
      this.setState({
        persist: !!e.metaKey
      });
    }
  }]);

  return Selectable;
})(_react.Component);

exports['default'] = Selectable;
module.exports = exports['default'];