const {DOM, createClass, createFactory} = require("react");
const {input, button, span} = DOM;
const NavigatableInput = createFactory(require('./navigatable-input'));

const DeclarationEditor = createClass({
  displayName: "DeclarationEditor",

  getInitialState() {
    return {
      wasEditing: false
    }
  },

  render() {
    const {
      rule,
      declaration,
      value,
      beginEdit,
      isEditing,
      className,
      commitOn,
      commands
    } = this.props;

    if (isEditing) {
      return NavigatableInput({
        className: `rule-declaration-editor rule-declaration-editor-input ${className}`,
        defaultValue: value,
        commitOn,
        commands
      });
    }
    return button({
        className: `rule-declaration-editor rule-declaration-editor-button ${className}`,
        onClick: () => commands.beginEdit(rule, declaration)
      },
      span({}, value)
    );
  }
});

module.exports = DeclarationEditor;
