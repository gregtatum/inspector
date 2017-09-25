const { DOM, createClass, createFactory } = require('react');
const { connect } = require('react-redux');

const RulesSidebar = createFactory(require('./rules-sidebar'));
const Page = createFactory(require('./page'));

const { addPageStyleSheet } = require('../actions/element-rules');

const Inspector = createClass({
  displayName: 'Inspector',

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch(addPageStyleSheet());
  },

  render() {
    return DOM.div({}, Page(), RulesSidebar());
  },
});

function mapStateToProps(state) {
  return state;
}

module.exports = connect(mapStateToProps)(Inspector);
