import React, { Component, Children, forwardRef } from "react";
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
    this.stopAllListeners();
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

  stopAllListeners = () => {
    this.stopOnClickAnywhereListener();
    this.stopOnContextMenuListener();
  };

  startOnClickAnywhereListener = () => {
    document.addEventListener("click", this.handleDocumentClick);
  };

  stopOnClickAnywhereListener = () => {
    document.removeEventListener("click", this.handleDocumentClick);
  };

  startOnContextMenuListener = () => {
    document.addEventListener("contextmenu", this.handleContextMenuClick);
  };

  stopOnContextMenuListener = () => {
    document.removeEventListener("contextmenu", this.handleContextMenuClick);
  };

  startOrStopListenerFactory = (start, stop) => ({ listening, shouldListen }) => {
    if (listening && !shouldListen) {
      stop();
    }

    if (!listening && shouldListen) {
      start();
    }
  };

  startOrStopOnClickAnywhereListener = this.startOrStopListenerFactory(
    this.startOnClickAnywhereListener,
    this.stopOnClickAnywhereListener,
  );

  startOrStopOnContextMenuListener = this.startOrStopListenerFactory(
    this.startOnContextMenuListener,
    this.stopOnContextMenuListener,
  );

  manageListeners = () => {
    const { listening } = this.state;

    const shouldListen = {
      onClickAnywhere: Boolean(this.eventHandlers.onClickAnywhere),
      onContextMenuAnywhere: Boolean(this.eventHandlers.onContextMenuAnywhere),
    };

    this.startOrStopOnClickAnywhereListener({
      listening: listening.onClickAnywhere,
      shouldListen: shouldListen.onClickAnywhere,
    });

    this.startOrStopOnContextMenuListener({
      listening: listening.onContextMenuAnywhere,
      shouldListen: shouldListen.onContextMenuAnywhere,
    });

    this.setState({ listening: shouldListen });
  };

  render = () => {
    const Wrapper = this.props.wrapper;

    return (
      <Wrapper
        ref={this.props.forwardedRef}
        {...pick(["onMouseEnter", "onMouseLeave", "onFocus", "onBlur", "onClick", "onContextMenu"], this.eventHandlers)}
      >
        {this.props.children}
      </Wrapper>
    );
  };
}

const HandlerType = PropTypes.oneOfType([
  PropTypes.func,
  PropTypes.shape({
    handler: PropTypes.func,
    delay: PropTypes.number,
  }),
]);

EventHandler.propTypes = {
  wrapper: PropTypes.any,
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

EventHandler.defaultProps = {
  wrapper: "span",
};

const withForwardRef = Component =>
  forwardRef((props, ref) => {
    return <Component {...props} forwardedRef={ref} />;
  });

export default withForwardRef(EventHandler);
