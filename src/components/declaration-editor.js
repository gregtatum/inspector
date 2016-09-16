const {DOM, createClass, createFactory} = require("react");
const {span} = DOM;
const NavigatableInput = createFactory(require("./navigatable-input"));

const DeclarationEditor = createClass({
  displayName: "DeclarationEditor",

  getInitialState() {
    return {
      wasEditing: false
    };
  },

  render() {
    const {
      rule,
      declaration,
      value,
      isEditing,
      className,
      commitOn,
      commands,
      valuesPasted
    } = this.props;

    if (isEditing) {
      return NavigatableInput({
        className: `rule-declaration-editor rule-declaration-editor-input ${className}`,
        defaultValue: value,
        commitOn,
        commands,
        valuesPasted
      });
    }
    return span({
      className: `rule-declaration-editor rule-declaration-editor-button ${className}`,
      onClick: () => commands.beginEdit(rule, declaration),
      role: "button",
      tabIndex: 0,
      onKeyPress: (e) => {
        if (e.key === "Enter") {
          commands.beginEdit(rule, declaration);
        }
      }
    },
      value
    );
  }
});

module.exports = DeclarationEditor;
