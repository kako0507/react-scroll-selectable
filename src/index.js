import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';

function isNodeInRoot(node, root) {
  while (node) {
    if (node === root) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}

class Selectable extends Component {

  /**
   * @type {Object}
   */
  static propTypes = {
    /**
     * Event that will fire when items are selected. Passes an array of keys
     */
    onSelection: React.PropTypes.func,
    /**
     * The component that will represent the Selectable DOM node
     */
    component: React.PropTypes.oneOfType([
      React.PropTypes.func,
      React.PropTypes.string
    ]),
    /**
     * The style of selectbox's border
     */
    selectboxBorderWidth: React.PropTypes.number,
    selectboxBorderStyle: React.PropTypes.string,
    selectboxBorderColor: React.PropTypes.string,
    /**
     * Expands the boundary of the selectable area. It can be an integer, which
     * applies to all sides, or an object containing "top", "bottom", "left",
     * and "right" values for custom distance on each side
     */
    distance: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.number
    ]),
    /**
     * Amount of forgiveness an item will offer to the selectbox before registering
     * a selection, i.e. if only 1px of the item is in the selection, it shouldn't be
     * included.
     */
    tolerance: React.PropTypes.number,
    /**
     * If true, a click-and-drag with the mouse will generate a select box anywhere
     * in the document.
     */
    globalMouse: React.PropTypes.bool,
    /**
     * If true, selectable will be no working.
     */
    disabled: React.PropTypes.bool,
    /**
     * If true, selectable will be auto-scrolling
     */
    autoScroll: React.PropTypes.bool,
    /**
     * The speed of auto-scrolling
     */
    scrollSpeed: React.PropTypes.number,
  };

  /**
   * @type {Object}
   */
  static defaultProps = {
    onSelection: () => {},
    component: 'div',
    selectboxBorderWidth: 1,
    selectboxBorderStyle: 'dashed',
    selectboxBorderColor: '#999',
    distance: 0,
    tolerance: 0,
    globalMouse: false,
    disabled: false,
    autoScroll: true,
    scrollSpeed: 50,
  };

  constructor() {
    super();
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
  componentDidMount() {
    document.addEventListener('keydown', this._keyListener);
    document.addEventListener('keyup', this._keyListener);
  }

  /**
   * Remove global event listeners
   */
  componentWillUnmount() {
    document.removeEventListener('keydown', this._keyListener);
    document.removeEventListener('keyup', this._keyListener);
  }

  /**
   * Renders the component
   * @return {ReactComponent}
   */
  render() {
    let boxStyle = {
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

    return (
      <this.props.component
        {...this.props}
        style={{
          position: 'relative',
          height: '100%',
          overflowY: 'auto',
          ...this.props.style
        }}
        onMouseDown={::this._mouseDown}
      >
        {this.state.isBoxSelecting &&
          <div style={boxStyle} ref="selectbox"/>
        }
        {React.Children.map(this.props.children,(child, i) => {
          return React.cloneElement(child, {
            key: child.key || i,
            ref: 'selectable_'+child.key,
            selected: this.state.selectedItems.indexOf(child.key) > -1
          })
        }, this)}
      </this.props.component>
    );
  }

  /**
   * Called while moving the mouse with the button down. Changes the boundaries
   * of the selection box
   */
  _openSelector(e) {
    let node = ReactDOM.findDOMNode(this);
    let left = e.pageX - node.offsetLeft + node.scrollLeft;
    let top = e.pageY - node.offsetTop + node.scrollTop;
    let newLeft = left;
    let newTop = top;
    let newWidth = this._mouseDownData.boxLeft - newLeft;
    let newHeight = this._mouseDownData.boxTop - newTop;
    let doubleBorderWidth = this.props.selectboxBorderWidth * 2;

    if(left > this._mouseDownData.boxLeft) {
      newLeft = this._mouseDownData.boxLeft;
      newWidth = left - this._mouseDownData.boxLeft - doubleBorderWidth;
    }
    if(top > this._mouseDownData.boxTop) {
      newTop = this._mouseDownData.boxTop;
      newHeight = top - this._mouseDownData.boxTop - doubleBorderWidth;
    }

    if((newLeft + newWidth) > this._mouseDownData.nodeW - doubleBorderWidth) {
      newWidth = this._mouseDownData.nodeW - newLeft - doubleBorderWidth;
    }
    else if(newLeft < 0) {
      newWidth += newLeft;
      newLeft = 0;
    }
    if((newTop + newHeight) > this._mouseDownData.nodeH - doubleBorderWidth) {
      newHeight = this._mouseDownData.nodeH - newTop - doubleBorderWidth;
    }
    else if(newTop < 0) {
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

    if(this.props.autoScroll) {
      this.scrollPerhaps(e);
    }
  }

  /**
   * Auto scrolling
   */
  scrollPerhaps(e) {
    let node = ReactDOM.findDOMNode(this);
    let {scrollSpeed} = this.props;
    // Scroll down
    if ((e.pageY + 10) > (node.offsetTop + node.offsetHeight)) {
      node.scrollTop += scrollSpeed;
      if(node.scrollTop > this._mouseDownData.nodeH) {
        node.scrollTop = this._mouseDownData.nodeH;
      }
    }
    // Scroll up
    if ((e.pageY - 10) < node.offsetTop) {
      node.scrollTop -= scrollSpeed;
    }
    // Scroll right
    if ((e.pageX + 10) > (node.offsetLeft + node.offsetWidth)) {
      node.scrollLeft += scrollSpeed;
      if(node.scrollLeft > this._mouseDownData.nodeW) {
        node.scrollLeft = this._mouseDownData.nodeW;
      }
    }
    // Scroll left
    if ((e.pageX - 10) < node.offsetLeft) {
      node.scrollLeft -= scrollSpeed;
    }
  }

  /**
   * Called when a user presses the mouse button. Determines if a select box should
   * be added, and if so, attach event listeners
   */
  _mouseDown(e) {
    if(this.props.disabled) {
      return;
    }

    let node = ReactDOM.findDOMNode(this);
    let collides;
    let offsetData;
    let distanceData;

    document.addEventListener('mouseup', this._mouseUp);

    // Right clicks
    if(e.nativeEvent.which !== 1) return;

    if(!isNodeInRoot(e.target, node) && !this.props.globalMouse) {
      distanceData = this._getDistanceData();
      offsetData = this._getBoundsForNode(node);
      collides = this._objectsCollide(
        {
          top: offsetData.top - distanceData.top,
          left: offsetData.left - distanceData.left,
          bottom: offsetData.offsetHeight + distanceData.bottom,
          right: offsetData.offsetWidth + distanceData.right
        },
        {
          top: e.pageY,
          left: e.pageX,
          offsetWidth: 0,
          offsetHeight: 0
        }
      );

      if(!collides) return;
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
  _mouseUp(e) {
    document.removeEventListener('mousemove', this._openSelector);
    document.removeEventListener('mouseup', this._mouseUp);

    if(!this._mouseDownData) return;
    let inRoot = isNodeInRoot(e.target, ReactDOM.findDOMNode(this));
    let click = (e.pageX === this._mouseDownData.initialX && e.pageY === this._mouseDownData.initialY);

    // Clicks outside the Selectable node should reset clear selection
    if(click && !inRoot) {
      this.setState({
        selectedItems: []
      });
      return this.props.onSelection([]);
    }

    // Handle selection of a single element
    if(click && inRoot) {
      return this._selectElement(e.pageX, e.pageY)
    }

    return this._selectElements(e);
  }

  /**
   * Selects a single child, given the x/y coords of the mouse
   * @param  {int} x
   * @param  {int} y
   */
  _selectElement(x, y) {
    let currentItems = this.state.selectedItems;
    let index;

    React.Children.forEach(this.props.children, child => {
      let node = ReactDOM.findDOMNode(this.refs['selectable_' + child.key]);
      let collision = this._objectsCollide(
        node,
        {
          top: y,
          left: x,
          offsetWidth: 0,
          offsetHeight: 0
        },
        this.props.tolerance
      );

      if(collision) {
        index = currentItems.indexOf(child.key);
        if(this.state.persist) {
          if(index > -1) {
            currentItems.splice(index, 1);
          }
          else {
            currentItems.push(child.key);
          }
        }
        else {
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

    this.props.onSelection(currentItems.map(item => item.substring(2)));
  }

  /**
   * Selects multiple children given x/y coords of the mouse
   */
  _selectElements(e) {
    let currentItems = this.state.selectedItems;

    this._mouseDownData = null;

    React.Children.forEach(this.props.children, child => {
      let collision = this._objectsCollide(
        ReactDOM.findDOMNode(this.refs.selectbox),
        ReactDOM.findDOMNode(this.refs['selectable_'+child.key]),
        this.props.tolerance
      );
      if(collision) {
        currentItems.push(child.key);
      }
    }, this);

    this.setState({
      isBoxSelecting: false,
      boxWidth: 0,
      boxHeight: 0,
      selectedItems: currentItems
    });

    this.props.onSelection(currentItems.map(item => item.substring(2)));
  }

  /**
   * Given a node, get everything needed to calculate its boundaries
   * @param  {HTMLElement} node
   * @return {Object}
   */
  _getBoundsForNode(node) {
    let rect = node.getBoundingClientRect();

    return {
      top: rect.top+document.body.scrollTop,
      left: rect.left+document.body.scrollLeft,
      offsetWidth: node.offsetWidth,
      offsetHeight: node.offsetHeight
    };
  }

  /**
   * Resolve the disance prop from either an Int or an Object
   * @return {Object}
   */
  _getDistanceData() {
    let distance = this.props.distance;

    if(!distance) {
      distance = 0;
    }

    if(typeof distance !== 'object') {
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
  _objectsCollide(a, b, tolerance) {
    let aObj = (a instanceof HTMLElement) ? this._getBoundsForNode(a) : a;
    let bObj = (b instanceof HTMLElement) ? this._getBoundsForNode(b) : b;

    return this._coordsCollide(
      aObj.top,
      aObj.left,
      bObj.top,
      bObj.left,
      aObj.offsetWidth,
      aObj.offsetHeight,
      bObj.offsetWidth,
      bObj.offsetHeight,
      tolerance
    );
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
  _coordsCollide(aTop, aLeft, bTop, bLeft, aWidth, aHeight, bWidth, bHeight, tolerance) {
    if(typeof tolerance === 'undefined') {
      tolerance = 0;
    }

    return !(
      // 'a' bottom doesn't touch 'b' top
      ( (aTop + aHeight - tolerance ) < bTop ) ||
      // 'a' top doesn't touch 'b' bottom
      ( (aTop + tolerance) > (bTop + bHeight) ) ||
      // 'a' right doesn't touch 'b' left
      ( (aLeft + aWidth - tolerance) < bLeft ) ||
      // 'a' left doesn't touch 'b' right
      ( (aLeft + tolerance) > (bLeft + bWidth) )
    );
  }

  /**
   * Listens for the meta key
   */
  _keyListener(e) {
    this.setState({
      persist: !!e.metaKey
    });
  }
}

export default Selectable;
