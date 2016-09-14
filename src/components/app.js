const {DOM, createClass, createFactory} = require("react");
const {connect} = require("react-redux");
const {getRule, getRuleDeclaration} = require("../utils/accessors");

const RulesSidebar = createFactory(require("./rules-sidebar"))
const Page = createFactory(require("./page"))

const {
  editDeclarationName,
  editDeclarationValue,
  setDeclarationName,
  setDeclarationValue,
  stopEditingDeclaration,
  tabThroughDeclarations,
  addPageStyleSheet,
  focusOnRedBox,
  pasteDeclarations,
} = require("../actions/element-rules");

const Inspector = createClass({
  displayName: "Inspector",

  componentWillMount() {
    const {dispatch} = this.props;
    dispatch(addPageStyleSheet());
  },

  render() {
    const {
      dispatch,
      elementRules: {
        matchedRules,
        styleSheets,
        editing,
        isEditingName,
        isEditingValue,
        updateQueue
      }
    } = this.props

    return DOM.div({},
      Page({
        focusOnRedBox: () => dispatch(focusOnRedBox())
      }),
      RulesSidebar({
        rules: matchedRules.map(id => getRule(styleSheets, id)),
        ruleProps: {
          editing: getRuleDeclaration(styleSheets, editing),
          isEditingName: isEditingName,
          isEditingValue: isEditingValue,
          editName: (rule, declaration) => dispatch(editDeclarationName(rule, declaration)),
          editValue: (rule, declaration) => dispatch(editDeclarationValue(rule, declaration)),
          setName: (declaration, name) => dispatch(setDeclarationName(updateQueue, declaration, name)),
          setValue: (declaration, value) => dispatch(setDeclarationValue(updateQueue, declaration, value)),
          stopEditing: () => dispatch(stopEditingDeclaration()),
          editNext: () => dispatch(tabThroughDeclarations(1)),
          editPrevious: () => dispatch(tabThroughDeclarations(-1)),
          valuesPasted: (declaration, text) => dispatch(pasteDeclarations(declaration, text))
        }
      })
    )
  }
});

function mapStateToProps(state) {
  return state
}

module.exports = connect(mapStateToProps)(Inspector)
