const {DOM, createClass, createFactory} = require("react");
const {div, span, button, input} = DOM;
const DeclarationEditor = createFactory(require('./declaration-editor'));

const Rule = createClass({
  displayName: "Rule",

  render() {
    const {
      rule,
      editing,
      isEditingName,
      isEditingValue,
      editName,
      editValue,
      setName,
      setValue,
      stopEditing,
      editNext,
      editPrevious,
    } = this.props;

    const {selector, declarations} = rule;

    return div({className: "rule theme-separator"},
      div({className: "rule-selector"},
        span({className: "rule-selector-text"}, selector),
        span({className: "rule-selector-bracket"}, "{")
      ),
      div({className: "rule-declarations"},
        declarations.map((declaration) => {
          const {name, value, id} = declaration;
          const isEditingThis = editing && declaration === editing.declaration;
          console.log(id + name + value)
          return (
            div({className: "rule-declaration", key: id + name + value},
              DeclarationEditor({
                className: "rule-declaration-name",
                rule,
                declaration,
                value: declaration.name,
                isEditing: isEditingThis && isEditingName,
                commands: {
                  editNext,
                  editPrevious,
                  stopEditing,
                  commitChanges: (name) => setName(rule, declaration, name),
                  beginEdit: editName
                }
              }),
              span({className: "rule-declaration-colon"}, ":"),
              DeclarationEditor({
                className: "rule-declaration-value",
                rule,
                declaration,
                value: declaration.value,
                isEditing: isEditingThis && isEditingValue,
                commands: {
                  editNext,
                  editPrevious,
                  stopEditing,
                  commitChanges: (value) => setValue(rule, declaration, value),
                  beginEdit: editValue
                }
              }),
              span({className: "rule-declaration-colon"}, ";")
            )
          )
        })
      ),
      div({className: "rule-declaration-close"}, "}")
    )
  }
});

module.exports = Rule;
