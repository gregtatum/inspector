const {DOM, createClass} = require("react");
const {div} = DOM;
const {connect} = require("react-redux");
const {bindActionCreators} = require("redux");
const actions = require("../actions");

const Page = createClass({
  displayName: "Page",

  componentDidMount() {
    this.props.focusOnRedBox();
  },

  render() {
    return div({className: "page-container"},
      div({}),
      div({}),
      div({className: "red-box"}),
      div({className: "blue-box"}),
      div({}),
      div({})
    );
  }
});

module.exports = connect(
  null,
  dispatch => bindActionCreators({
    focusOnRedBox: actions.focusOnRedBox,
  }, dispatch)
)(Page);
