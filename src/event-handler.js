import React, { Component, Children } from "react";
import PropTypes from "prop-types";
import { pick, pipe, map } from "ramda";

class EventHandler extends Component {
  constructor(props) {
    super(props);
    this.eventHandlers = this.getEventHandlers(props);
    this.timeout = null;
    this.state = { listening: false };
  }

  componentDidMount() {
    if (this.shouldStartListening(this.props)) {
      this.startListening();
    }
  }

  componentWillReceiveProps(newProps) {
    this.eventHandlers = this.getEventHandlers(newProps);

    if (this.shouldStartListening(newProps)) {
      this.startListening();
    }

    if (this.shouldStopListening(newProps)) {
      this.stopListening();
    }
  }

  componentWillUnmount() {
    if (this.state.listening) {
      this.stopListening();
    }
    this.clearTimeout();
  }

  getEventHandlers = props =>
    pipe(
      pick(["onMouseEnter", "onMouseLeave", "onFocus", "onBlur", "onClick", "onClickAnywhere"]),
      map(this.normalizeProp),
      map(this.delay),
    )(props);

  setTimeout = (handler, delay) => {
    this.clearTimeout();
    this.timeout = setTimeout(handler, delay);
  };

  clearTimeout = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  };

  delay = ({ handler, delay }) => event => this.setTimeout(() => handler(event), delay);

  normalizeProp = arg => (typeof arg === "function" ? { handler: arg, delay: 0 } : arg);
  normalizeChildren = children => (typeof children === "string" ? <span>{children}</span> : children);

  handleDocumentClick = event => {
    const { onClickAnywhere } = this.eventHandlers;

    if (onClickAnywhere) {
      onClickAnywhere(event);
    }
  };

  shouldStartListening = props => !this.state.listening && props.onClickAnywhere;
  shouldStopListening = props => this.state.listening && !props.onClickAnywhere;

  startListening = () => {
    document.addEventListener("click", this.handleDocumentClick, true);
    this.setState({ listening: true });
  };

  stopListening = () => {
    document.removeEventListener("click", this.handleDocumentClick, true);
    this.setState({ listening: false });
  };

  render = () =>
    React.cloneElement(
      Children.only(this.normalizeChildren(this.props.children)),
      pick(["onMouseEnter", "onMouseLeave", "onFocus", "onBlur", "onClick"], this.eventHandlers),
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
  onMouseEnter: HandlerType,
  onMouseLeave: HandlerType,
  onFocus: HandlerType,
  onBlur: HandlerType,
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
};

export default EventHandler;
