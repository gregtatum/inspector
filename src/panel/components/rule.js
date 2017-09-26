const { DOM, createClass, createFactory } = require('react');
const { div, span } = DOM;
const DeclarationEditor = createFactory(require('./declaration-editor'));
const { connect } = require('react-redux');
const { bindActionCreators } = require('redux');
const $ = require('../selectors');
const actions = require('../actions');

const Rule = createClass({
  displayName: 'Rule',

  render() {
    const {
      // Props:
      rule,
      // State:
      state: { editingDeclaration, isEditingName, isEditingValue, updateQueue },
      // Actions:
      actions: {
        editDeclarationName,
        editDeclarationValue,
        setDeclarationName,
        setDeclarationValue,
        stopEditingDeclaration,
        tabThroughDeclarations,
        pasteDeclarations,
      },
    } = this.props;

    const selector = rule.get('selector');
    const declarations = rule.get('declarations');
    const editNext = () => tabThroughDeclarations(1);
    const editPrevious = () => tabThroughDeclarations(-1);

    return div(
      { className: 'rule theme-separator' },
      div(
        { className: 'rule-selector' },
        span({ className: 'rule-selector-text' }, selector),
        span({ className: 'rule-selector-bracket' }, ' {')
      ),
      div(
        { className: 'rule-declarations' },
        declarations.map(declaration => {
          const name = declaration.get('name');
          const value = declaration.get('value');
          const id = declaration.get('id');

          const isEditingThis = declaration === editingDeclaration;
          return div(
            { className: 'rule-declaration', key: id + name + value },
            span({}, '  '),
            DeclarationEditor({
              className: 'rule-declaration-name',
              rule,
              declaration,
              value: name,
              isEditing: isEditingThis && isEditingName,
              commitOn: ':',
              valuesPasted: text => pasteDeclarations(declaration, text),
              commands: {
                editNext,
                editPrevious,
                stopEditing: stopEditingDeclaration,
                commitChanges: text =>
                  setDeclarationName(updateQueue, id, text),
                beginEdit: editDeclarationName,
              },
            }),
            span({ className: 'rule-declaration-colon' }, ': '),
            DeclarationEditor({
              className: 'rule-declaration-value',
              rule,
              declaration,
              value,
              isEditing: isEditingThis && isEditingValue,
              commitOn: ';',
              valuesPasted: text => {
                pasteDeclarations(declaration, `${name}: ${text}`);
              },
              commands: {
                editNext,
                editPrevious,
                stopEditing: stopEditingDeclaration,
                commitChanges: text =>
                  setDeclarationValue(updateQueue, id, text),
                beginEdit: editDeclarationValue,
              },
            }),
            span({ className: 'rule-declaration-colon' }, ';')
          );
        })
      ),
      div({ className: 'rule-declaration-close' }, '}')
    );
  },
});

module.exports = connect(
  state => ({
    state: {
      editingDeclaration: $.editingDeclaration(state),
      isEditingName: $.isEditingName(state),
      isEditingValue: $.isEditingValue(state),
      updateQueue: $.updateQueue(state),
    },
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        editDeclarationName: actions.editDeclarationName,
        editDeclarationValue: actions.editDeclarationValue,
        setDeclarationName: actions.setDeclarationName,
        setDeclarationValue: actions.setDeclarationValue,
        stopEditingDeclaration: actions.stopEditingDeclaration,
        tabThroughDeclarations: actions.tabThroughDeclarations,
        pasteDeclarations: actions.pasteDeclarations,
      },
      dispatch
    ),
  })
)(Rule);
