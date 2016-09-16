const {DOM, createClass, createFactory} = require("react");
const {div, span} = DOM;
const DeclarationEditor = createFactory(require("./declaration-editor"));

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

    const selector = rule.get("selector");
    const declarations = rule.get("declarations");

    return div({className: "rule theme-separator"},
      div({className: "rule-selector"},
        span({className: "rule-selector-text"}, selector),
        span({className: "rule-selector-bracket"}, " {")
      ),
      div({className: "rule-declarations"},
        declarations.map((declaration) => {
          const name = declaration.get("name");
          const value = declaration.get("value");
          const id = declaration.get("id");

          const isEditingThis = editing && declaration === editing.declaration;
          return (
            div({className: "rule-declaration", key: id + name + value},
              span({}, "  "),
              DeclarationEditor({
                className: "rule-declaration-name",
                rule,
                declaration,
                value: name,
                isEditing: isEditingThis && isEditingName,
                commitOn: ":",
                valuesPasted: (text) => valuesPasted(declaration, text),
                commands: {
                  editNext,
                  editPrevious,
                  stopEditing,
                  commitChanges: (text) => setName(declaration, text),
                  beginEdit: editName,
                }
              }),
              span({className: "rule-declaration-colon"}, ": "),
              DeclarationEditor({
                className: "rule-declaration-value",
                rule,
                declaration,
                value,
                isEditing: isEditingThis && isEditingValue,
                commitOn: ";",
                valuesPasted: (text) => {
                  valuesPasted(declaration, `${name}: ${text}`);
                },
                commands: {
                  editNext,
                  editPrevious,
                  stopEditing,
                  commitChanges: (text) => setValue(declaration, text),
                  beginEdit: editValue,
                }
              }),
              span({className: "rule-declaration-colon"}, ";")
            )
          );
        })
      ),
      div({className: "rule-declaration-close"}, "}")
    );
  }
});

module.exports = Rule;
