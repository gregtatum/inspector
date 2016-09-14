const {DOM, createClass, createFactory} = require("react");
const {div, span} = DOM;
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
      valuesPasted
    } = this.props;

    const {selector, declarations} = rule;

    return div({className: "rule theme-separator"},
      div({className: "rule-selector"},
        span({className: "rule-selector-text"}, selector),
        span({className: "rule-selector-bracket"}, " {")
      ),
      div({className: "rule-declarations"},
        declarations.map((declaration) => {
          const {name, value, id} = declaration;
          const isEditingThis = editing && declaration === editing.declaration;
          return (
            div({className: "rule-declaration", key: id + name + value},
              span({}, "  "),
              DeclarationEditor({
                className: "rule-declaration-name",
                rule,
                declaration,
                value: declaration.name,
                isEditing: isEditingThis && isEditingName,
                commitOn: ":",
                valuesPasted: (text) => valuesPasted(declaration, text),
                commands: {
                  editNext,
                  editPrevious,
                  stopEditing,
                  commitChanges: (name) => setName(declaration, name),
                  beginEdit: editName,
                }
              }),
              span({className: "rule-declaration-colon"}, ": "),
              DeclarationEditor({
                className: "rule-declaration-value",
                rule,
                declaration,
                value: declaration.value,
                isEditing: isEditingThis && isEditingValue,
                commitOn: ";",
                valuesPasted: (text) => {
                  valuesPasted(declaration, `${declaration.name}: ${text}`)
                },
                commands: {
                  editNext,
                  editPrevious,
                  stopEditing,
                  commitChanges: (value) => setValue(declaration, value),
                  beginEdit: editValue,
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
