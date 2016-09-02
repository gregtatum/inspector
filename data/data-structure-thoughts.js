[
  selectedElement: {},
  rules: [
    {
      parentRule: {},
      styleSheet: {}
      text: "",
      type: "STYLE_RULE",
      selector: ""
      declarations: [{
        name: "",
        value: "",
        priority: "",
        terminator: "",
        enabled: true,
        offsets: {
          comment: [0, 0],
          text: [0, 0],
          name: [0, 0],
          value: [0, 0]
        }
      }]
    },
    {
      condition: "",
      rules: []
    }
  ]
]

function modifyTextWithOffsets(source, newText, [offsetStart, offsetEnd]) {
  const newText = sourceText.substr(0, offsetStart) +
                  newText +
                  sourceText.substr(offsetEnd, sourceText.length);

  return [newText, newText.length - source.length];
}

function rebuildStyle () {

}
