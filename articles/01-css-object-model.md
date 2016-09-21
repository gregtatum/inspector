# How to Write a Devtools CSS Inspector

As part of the Firefox Devtools team, I've been helping to refactor some of the internals of the inspector tool. I started with sending in a few patches for some features, and gradually wrapped my head around the problem of "how to build an inspector." I decided to write some code to play around with these ideas and write some words to go with it to explain how a CSS inspector works. These articles will dive into the conceptual models of how to work with manipulating CSS, and some browser internals dealing with CSS.

## Part 1: The CSS Object Model

The first step is to dive into the APIs that the browser exposes that allow users to manipulate the webpage. `document.styleSheet` is the entry point in to how a webpage applies its style. The value of this property is the [StyleSheetList][StyleSheetList] interface. This interfaces provides a list of [StyleSheet][StyleSheet] objects or objects that inherit from StyleSheet like [CSSStyleSheet][CSSStyleSheet], (which this article will deal with the most.)

Now it's interesting to note that the [StyleSheetList][StyleSheetList] is not actually an array. Observe the following:

```js
const styleSheets = document.styleSheets;
styleSheets[0];
//> CSSStyleSheet

// Has a length.
styleSheets.length;
//> 4

// For loops work.
for (let i = 0; i < array.length; i++) {
  styleSheets[i];
  //> CSSStyleSheet
}

// No Array.prototype methods.
styleSheets.map((sheet, index) => index);
//> document.styleSheets.forEach is not a function

// But it is iterable.
[...styleSheets].map((sheet, index) => index);
//> [0, 1, 2, 3]
```

While this might be annoying for a JavaScript developer, this is typical for web APIs. The reason for this behavior is that specs are written for the C++ implementors more than for the JavaScript user. Once I came to this realization, interacting with web APIs became a lot easier. Any time I start interacting with a new web API I create an entirely new interface that has more JavaScript-esque practices, for whatever JS style is popular at the moment.

### Web IDL

To reveal what's going on behind the scenes inside the browser, let me introduce the [Web IDL][Web IDL]. This flavor of an [IDL][IDL] or "interface description language" describes the function signatures of the bindings of C++ things to JavaScript things. This is how JavaScript land and the platform speak to each other. This is why APIs feel like interacting with some C++ interface, and not a native JavaScript objects, as they are describing how the C++ interface should be built.

The above example uses the [StyleSheetList][StyleSheetList], so let's [peek at its Web IDL][StyleSheetList.webidl].

```
interface StyleSheetList {
  readonly attribute unsigned long length;
  getter StyleSheet? item(unsigned long index);
};
```

This one is simple enough, it has a length attribute that is an unsigned long, and a getter for StyleSheet objects. The getter powers the array-like syntax of `styleSheets[i]`. The JavaScript code above where the object looks like an array, but isn't really an array should make sense after seeing how the Web IDL is defined. A more interesting example would be the [StyleSheet.webidl][StyleSheet.webidl] file. Many more attributes can be seen with this IDL, and the associated backing types. This really reinforces how when dealing with web APIs, the JavaScript is just an interface to a C++ object.

```
interface StyleSheet {
  [Constant]
  readonly attribute DOMString type;
  [Constant]
  readonly attribute DOMString? href;
  // Spec says "Node", but it can go null when the node gets a new
  // sheet.  That's also why it's not [Constant]
  [Pure]
  readonly attribute Node? ownerNode;
  [Pure]
  readonly attribute StyleSheet? parentStyleSheet;
  [Pure]
  readonly attribute DOMString? title;
  [Constant]
  readonly attribute MediaList media;
  [Pure]
  attribute boolean disabled;
};
```

## The CSSStyleSheet

The best way to begin tackling the problem of buliding a CSS inspector is knowing what the browser provides. The [CSSStyleSheet] is the basic unit to start exploring. It inherits from the [StyleSheet] (oh so C++). The `StyleSheet.webidl` already enumerates the properties that are accessible. Since this is an object model, it is helpful to start traveling down into it. A StyleSheet object represents all of the text in one file or the `.innerHTML` of a `<style>` node.

The following represents what a CSSStyleSheet would represent. It's an interface to the internal representation of that structure. For instance `document.styleSheets[0].ownerNode` would be the `<style>` element, while `ownerNode.innerHTML` would be the actual text contents.

```css
<style>
  ul > li {
    padding: 1em 0em;
    line-height: 1;
    /* margin: 2em !important" */
  }
  .footer a[href] {
    text-decoration: none;
  }
</style>
```

## The CSSRule

The next level down in the object model is the [CSSStyleRule][CSSStyleRule] (which implements the CSSRule interface.) In the previous text there would be two CSSStyleRules.

The first:

```css
ul > li {
  padding: 1em 0em;
  line-height: 1;
  /* margin: 2em !important" */
}
```

The second:

```css
.footer a[href] {
  text-decoration: none;
}
```

The CSSStyleRule in turn provides access to some helpful attributes worth noting:

```javascript
const rule = document.styleSheet[0].cssRules[0];

rule.cssText;
//> "ul > li { padding: 1em 0em; line-height: 1; }"

rule.selectorText;
//> "ul > li"

rule.style
//> CSSStyleDeclaration: { padding, paddingTop, ..., lineHeight }
```

## CSSStyleDeclaration

Declarations represent the key/pair values that make up the CSSRules. The interface for declarations is the [CSSStyleDeclaration][CSSStyleDeclaration]. The name and value of different properties can be queried and set through this interface, as well as the text that creates the declarations.

```js
const styleSheet = document.styleSheet[0];
const firstRule = styleSheet.cssRules[0];
const declarations = firstRule.style;

declarations.cssText;
// "padding: 1em 0em; line-height: 1;"

// This is a shorthand property.
declarations.padding;
//> "1em 0em"

// The interface knows about the fully expanded longhand values.
declarations.paddingTop
//> "1em"

declarations.paddingTop = "2em"

declarations["padding-top"]
//> "2em"

declarations.cssText;
//> "padding: 2em 0em 1em; line-height: 1;"
```

The CSS can be updated on the fly using an object model that is not too hard to interact with. This is great for the use-case of working on a web application that needs some kind of dynamic CSS manipulation, but there is a big hole in making this work for the inspector. To illustrate the problem, observe the value of the `<style>` element's innerHTML after running the above javascript.

```js
// Retrieve the style element's innerHTML
styleSheet.ownerNode.innerHTML;
```

```css
ul > li {
  padding: 1em 0em;
  line-height: 1;
  /* margin: 2em !important" */
}
.footer a[href] {
  text-decoration: none;
}
```

Even though the CSS Object Model and the DOM have been updated, the original source has not. In addition the comment `/* margin: 2em !important" */` was completely ignored. It would be nice to be able to toggle that commented code on and off. If there are multiple declarations of the same name, there is no way to extract the multiple values using the CSS Object Model.

The browser doesn't provide the exact information needed to build an inspector, however a quick hack can reveal the start of the solution I will detail in the next part of this article.

```js
// Get the style element.
const styleElement = document.styleSheets[0].ownerNode;
const text = styleElement.innerHTML;

// Rewrite the 1em to 12px.
const oldValue = "1em";
const newValue = "12px";

// Find the start and end offsets in the CSS text of the value "1em".
const offsetStart = text.indexOf(oldValue);
const offsetEnd = offsetStart + oldValue.length;

// Chop up the text.
const beginning = text.substring(0, offsetStart);
const end = text.substring(offsetEnd, text.length - 1);

// Rewrite the node's innerHTML.
styleElement.innerHTML = beginning + newValue + end;
```

The result with "1em" switched to "12px":

```css
ul > li {
  padding: 12px 0em;
  line-height: 1;
  /* margin: 2em !important" */
}
.footer a[href] {
  text-decoration: none;
}
```

The `<style>` element would be rewritten, and the changes would immediately be reflected on the page. Taking this simplistic example, it would be easy to imagine a way to expand this hack and uncomment the margin declaration, or make other modifications to the text. At this point it would be helpful to demonstrate how simple the function would be to swap out values if we already knew what the offsets were. Of course, the harder question is figuring out the values of these offsets.

```js
function swapValue(sourceText, replacementValue, offsetStart, offsetEnd) {
  // Chop up the string.
  const beginning = sourceText.substring(0, offsetStart);
  const end = sourceText.substring(offsetEnd, sourceText.length - 1);

  // Re-assemble the string.
  return beginning + replacementValue + end;
}
```

# Summary

The CSS Object Model is a helpful way to think about the CSS and style on the page; breaking things up into StyleSheets, Rules, and Declarations. Unfortunately this existing model can't be used directly to power an inspector. The CSS needs to be rewritten on the fly, but done in a way that is robust, has an easy interface to manipulate the style, and can be easily represented using JavaScript objects, arrays, and values. The next section will introduce a CSS lexer that generates tokens. These tokens will be parsed to build up a customized CSS object model.

[StyleSheetList]: https://developer.mozilla.org/en-US/docs/Web/API/StyleSheetList
[StyleSheet]: https://developer.mozilla.org/en-US/docs/Web/API/StyleSheet
[CSSRuleList]: https://developer.mozilla.org/en-US/docs/Web/API/CSSRuleList
[CSSStyleRule]: https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleRule
[CSSRule]: https://developer.mozilla.org/en-US/docs/Web/API/CSSRule
[CSSStyleSheet]: https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet
[Web IDL]: https://en.wikipedia.org/wiki/Web_IDL
[IDL]: https://en.wikipedia.org/wiki/Interface_description_language
[StyleSheetList.webidl]: https://dxr.mozilla.org/mozilla-central/source/dom/webidl/StyleSheetList.webidl
[StyleSheet.webidl]: https://dxr.mozilla.org/mozilla-central/source/dom/webidl/StyleSheet.webidl
[CSSStyleDeclaration]: https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration
