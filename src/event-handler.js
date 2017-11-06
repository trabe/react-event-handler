import React, { Component, Children } from "react";
import PropTypes from "prop-types";
import { pick, pipe, map, mapObjIndexed } from "ramda";

class EventHandler extends Component {
  constructor(props) {
    super(props);
    this.eventHandlers = this.getEventHandlers(props);
    this.timeouts = {};
    this.state = {
      listening: {
        onClickAnywhere: false,
        onContextMenuAnywhere: false,
      },
    };
  }

  componentDidMount() {
    this.manageListeners();
  }

  componentWillReceiveProps(newProps) {
    this.eventHandlers = this.getEventHandlers(newProps);
    this.manageListeners();
  }

  componentWillUnmount() {
    this.stopListeners();
    this.clearTimeouts();
  }

  getEventHandlers = props =>
    pipe(
      pick([
        "onMouseEnter",
        "onMouseLeave",
        "onFocus",
        "onBlur",
        "onClick",
        "onClickAnywhere",
        "onContextMenu",
        "onContextMenuAnywhere",
      ]),
      map(this.normalizeProp),
      mapObjIndexed(this.injectHandlerName),
      map(this.delay),
    )(props);

  injectHandlerName = (v, k) => ({ handlerName: k, ...v });

  setTimeout = (handlerName, handler, delay) => {
    clearTimeout(this.timeouts[handlerName]);
    this.timeouts[handlerName] = setTimeout(handler, delay);
  };

  clearTimeouts = () => map(clearTimeout, this.timeouts);

  delay = ({ handlerName, handler, delay, propagate = true }) => event => {
    if (!propagate) {
      event.stopPropagation();
    }
    delay === undefined ? handler(event) : this.setTimeout(handlerName, () => handler(event), delay);
    return propagate;
  };

  normalizeProp = arg => (typeof arg === "function" ? { handler: arg } : arg);
  normalizeChildren = children => (typeof children === "string" ? <span>{children}</span> : children);

  handleDocumentClick = event => {
    const { onClickAnywhere } = this.eventHandlers;

    if (onClickAnywhere) {
      onClickAnywhere(event);
    }
  };

  handleContextMenuClick = event => {
    const { onContextMenuAnywhere } = this.eventHandlers;

    if (onContextMenuAnywhere) {
      onContextMenuAnywhere(event);
    }
  };

  stopListeners = () => {
    document.removeEventListener("click", this.handleDocumentClick, true);
    document.removeEventListener("contextmenu", this.handleContextMenuClick, true);
  };

  manageListeners = () => {
    this.stopListeners();

    const shouldListen = {
      onClickAnywhere: Boolean(this.eventHandlers.onClickAnywhere),
      onContextMenuAnywhere: Boolean(this.eventHandlers.onContextMenuAnywhere),
    };

    if (shouldListen.onClickAnywhere) {
      document.addEventListener("click", this.handleDocumentClick, true);
    }

    if (shouldListen.onContextMenuAnywhere) {
      document.addEventListener("contextmenu", this.handleContextMenuClick, true);
    }

    this.setState({ listening: shouldListen });
  };

  render = () =>
    React.cloneElement(
      Children.only(this.normalizeChildren(this.props.children)),
      pick(["onMouseEnter", "onMouseLeave", "onFocus", "onBlur", "onClick", "onContextMenu"], this.eventHandlers),
    );
}

const HandlerType = PropTypes.oneOfType([
  PropTypes.func,
  PropTypes.shape({
    handler: PropTypes.func,
    delay: PropTypes.number,
  }),
]);

EventHandler.propTypes = {
  onClick: HandlerType,
  onClickAnywhere: HandlerType,
  onContextMenu: HandlerType,
  onContextMenuAnywhere: HandlerType,
  onMouseEnter: HandlerType,
  onMouseLeave: HandlerType,
  onFocus: HandlerType,
  onBlur: HandlerType,
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
};

export default EventHandler;
