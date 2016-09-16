const {
  createClass,
  createFactory,
  Children: {map}
} = require("react");
const TransitionGroup = createFactory(require("react-addons-transition-group"));
const OffsetTransitionItem = createFactory(require("./offset-transition-item"));

const OffsetTransitionGroup = createClass({
  displayName: "OffsetTransitionGroup",

  getInitialState() {
    return {animations: {promise: Promise.resolve()}};
  },

  render() {
    const {children} = this.props;
    const {animations} = this.state;

    if (!this.props.children) {
      return null;
    }

    const itemProps = Object.assign({animations}, this.props);

    return TransitionGroup({},
      ...map(children, (child, i) => OffsetTransitionItem(itemProps, child))
    );
  }
});

module.exports = OffsetTransitionGroup;
