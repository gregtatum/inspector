const {
  DOM: {div},
  createClass
} = require("react");

function resolveIn(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function defer(fn) {
  setTimeout(fn, 1);
}

function transitionIn (callback) {
  defer(() => {
    const {
      animations: {promise},
      transitionAppearOffset,
      transitionName,
      transitionEnterTimeout,
    } = this.props;

    this.props.animations.promise = promise.then(() => {

      this.setClassName(`${transitionName}-enter ${transitionName}-enter-active`);
      setTimeout(callback, transitionEnterTimeout)
      return resolveIn(transitionAppearOffset);
    });
  });
}

const OffsetTransitionItem = createClass({
  displayName: "OffsetTransitionItem",

  getInitialState() {
    return {className: `${this.props.transitionName}-enter`};
  },

  setClassName(className) {
    this.setState({className})
  },

  componentWillAppear: transitionIn,

  componentWillEnter: transitionIn,

  componentWillLeave(callback) {
    const {
      transitionName,
      transitionLeaveTimeout,
    } = this.props;

    this.setClassName(`${transitionName}-leave`);

    defer(() => {
      this.setClassName(`${transitionName}-leave ${transitionName}-leave-active`);
      setTimeout(callback, transitionLeaveTimeout)
    });
  },

  render() {
    const {className} = this.state;

    return div({ ref: el => this._div = el, className},
      this.props.children
    );
  }
});

module.exports = OffsetTransitionItem;
