const { DOM, createClass, createFactory } = require("react")
const { connect } = require("react-redux")

const RulesSidebar = createFactory(require('./rules-sidebar'))
const Page = createFactory(require('./page'))

const elementRulesActions = require("../actions/element-rules");

const Inspector = createClass({
  displayName: "Inspector",

  componentWillMount() {
    const {dispatch} = this.props;
    dispatch(elementRulesActions.addPageStyleSheet());
  },

  render() {
    const {
      dispatch,
      elementRules,
    } = this.props

    return DOM.div({},
      Page({
        focusOnRedBox: () => dispatch(elementRulesActions.focusOnRedBox())
      }),
      RulesSidebar({
        rules: elementRules.matchedRules,
        ruleProps: {
          editing: elementRules.editing,
          isEditingName: elementRules.isEditingName,
          isEditingValue: elementRules.isEditingValue,
          editName: (rule, declaration) => dispatch(elementRulesActions.editDeclarationName(rule, declaration)),
          editValue: (rule, declaration) => dispatch(elementRulesActions.editDeclarationValue(rule, declaration)),
          setName: (rule, declaration, name) => dispatch(elementRulesActions.setDeclarationName(rule, declaration, name)),
          setValue: (rule, declaration, value) => dispatch(elementRulesActions.setDeclarationValue(rule, declaration, value)),
          stopEditing: () => dispatch(elementRulesActions.stopEditingDeclaration()),
          editNext: () => dispatch(elementRulesActions.tabThroughDeclarations(1)),
          editPrevious: () => dispatch(elementRulesActions.tabThroughDeclarations(-1)),
        }
      })
    )
  }
});

function mapStateToProps(state) {
  return state
}

module.exports = connect(mapStateToProps)(Inspector)
