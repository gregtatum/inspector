const {DOM, createClass, createFactory} = require("react");
const {connect} = require("react-redux");
const selectors = require("../selectors");

const RulesSidebar = createFactory(require("./rules-sidebar"));
const Page = createFactory(require("./page"));

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
      elementRules
    } = this.props;

    // Temporarily do this:
    const isEditingName = elementRules.get("isEditingName");
    const isEditingValue = elementRules.get("isEditingValue");
    const updateQueue = elementRules.get("updateQueue");

    /* eslint-disable max-len */
    return DOM.div({},
      Page({
        focusOnRedBox: () => dispatch(focusOnRedBox())
      }),
      RulesSidebar({
        rules: selectors.getMatchedRules(this.props),
        ruleProps: {
          editingDeclaration: selectors.getEditingDeclaration(this.props),
          isEditingName: isEditingName,
          isEditingValue: isEditingValue,
          editName: (rule, declaration) => dispatch(editDeclarationName(rule, declaration)),
          editValue: (rule, declaration) => dispatch(editDeclarationValue(rule, declaration)),
          setName: (declaration, name) => dispatch(setDeclarationName(updateQueue, declaration.get("id"), name)),
          setValue: (declaration, value) => dispatch(setDeclarationValue(updateQueue, declaration.get("id"), value)),
          stopEditing: () => dispatch(stopEditingDeclaration()),
          editNext: () => dispatch(tabThroughDeclarations(1)),
          editPrevious: () => dispatch(tabThroughDeclarations(-1)),
          valuesPasted: (declaration, text) => dispatch(pasteDeclarations(declaration, text))
        }
      })
    );
    /* eslint-enable max-len */
  }
});

function mapStateToProps(state) {
  return state;
}

module.exports = connect(mapStateToProps)(Inspector);
