# How to Write a Devtools CSS Inspector

I have been working with my Firefox Devtools team on refactoring some of the internals of the inspector tool. I started with sending in a few patches for some features, and gradually wrapped my head mostly around the problem of "how to build an inspector." I decided to write some code to play around with these ideas and write some words to go with it to explain how a CSS inspector works.

## Part 1: The CSS Object Model

The first step is to dive into the APIs that the browser exposes for us to deal with in a webpage. `document.styleSheet` is the entrypoint in to how your webpage is applying its style. The result of this property is the [StyleSheetList][StyleSheetList] interface. This interfaces provides a list of [StyleSheet][StyleSheet] objects or objects that inerit from StyleSheet like [CSSStyleSheet][CSSStyleSheet].

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

While this might be annoying for a JavaScript developer, this is typical for web APIs. The reason for this behavior is that specs are written for the C++ implementors more so than the JavaScript user. Once I came to this realization, interacting with web APIs became a lot easier. My first step now in interacting with a web API is to create an entirely new interface that has more JavaScript-esque practices, for whatever style is popular at the moment.

### Web IDL

To reveal what's going on behind the scenes inside the browser, let me introduce the [Web IDL][Web IDL]. This flavor of an [IDL][IDL] or "interface description language" describes the function signatures of the bindings of C++ things with JavaScript things. This is how JavaScript land and the platform speak to each other. This is why APIs feel like interacting with some C++ thing, and not some JavaScript thing, as they are describing how the C++ interface should be built.

The above example uses the [StyleSheetList][StyleSheetList], so let's [peek at its Web IDL][StyleSheetList.webidl].

```
interface StyleSheetList {
  readonly attribute unsigned long length;
  getter StyleSheet? item(unsigned long index);
};
```

This one is simple enough, it has a length attribute that is an unsigned long, and a getter for StyleSheet objects. The behavior above should make sense seeing how this is put together. A more interesting example would be the [StyleSheet.webidl][StyleSheet.webidl] file. Many more attributes can be seen with this IDL, and the associated backing types.

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

The best way to begin tackling the problem of buliding a CSS inspector is knowing what the browser provides. The [CSSStyleSheet] is the basic unit to start exploring. It inherits from the [StyleSheet] (oh so C++). We already know what the webidl tells us we have access to in the StyleSheet from above. Since this is an object model, it is helpful to start traveling down it. A StyleSheet object represents all of the text in one file or the `.innerText` of a `<style>` node.

Example stylesheet contents:

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

## The CSSRule

The next level down will be the [CSSStyleRule][CSSStyleRule] (which implements the CSSRule interface.) In the previous text there would be two CSSStyleRules.

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

 * `cssText` - "ul > li { padding: 1em 0em; line-height: 1; }"
 * `selectorText` - "ul > li"
 * `style` - CSSStyleDeclaration: { "padding", "padding-top", ..., "line-height" }

## CSSStyleDeclaration

The style declarations make up the CSSRules, and they are modifiable. The interface for doing this is the [CSSStyleDeclaration][CSSStyleDeclaration]. The CSS properties can be accessed directly, as well as some attributes.

```js
const styleSheet = document.styleSheet[0];
const firstRule = styleSheet.cssRules[0];
const declarations = firstRule.style;

declarations.cssText;
// "padding: 1em 0em; line-height: 1;"

declarations.padding;
//> "1em 0em"

declarations.paddingTop
//> "1em"

declarations.paddingTop = "2em"

declarations["padding-top"]
//> "2em"

declarations.cssText;
//> "padding: 2em 0em 1em; line-height: 1;"
```

So this is great, the CSS can be updated on the fly using an object model that is not too hard to interact with. This is great for the use-case of working on a web application that needs some kind of dynamic CSS manipulation, but there is a big hole in making this work for the inspector. Using the code from above, and assuming the stylesheet is from a `<style>` node. The style node's innerText can be retrieved.

```js
styleSheet.ownerNode.innerText
```

The contents will be:

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

Even though the CSS Object Model and the DOM have been updated, the original source has not been. In addition the comment `/* margin: 2em !important" */` was completely ignored, which it would be nice to be able to toggle that commented code on and off.

A quick hack reveals the start of the solution I will start in on in the next part of this article.

```js
// Get the style element.
const styleElement = document.styleSheets[0].ownerNode;
const text = styleElement.innerText;

// Rewrite the 1em to 12px.
const oldValue = "1em"
const newValue = "12px"

// Find the start and end offsets of the in the CSS text of value "1em"
const offsetStart = text.indexOf(oldValue)
const offsetEnd = offsetStart + oldValue.length

styleElement.innerText = text.substring(0, offsetStart) +
                         newValue +
                         text.substring(offsetEnd, text.length - 1);
```

The result:

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

This could be generalized somewhat into a function.

The `<style>` element would be rewritten, and the changes would immediately be reflected on the page. Taking this simplistic example, it would be easy to imagine a way to uncomment the margin declaration, or make other modifications to the text. At this point it would be helpful to demonstrate how simple the function would be to swap out values if we already knew what the offsets were. Of course, the harder question is figuring out the values of these offsets.

```js
function swapValue(sourceText, replacementValue, offsetStart, offsetEnd) {
  return sourceText.substring(0, offsetStart) +
    replacementValue +
    sourceText.substring(offsetEnd, sourceText.length - 1));
}
```


# Summary

The CSS Object Model is a helpful way to think about the CSS and style on the page; breaking things up into StyleSheets, Rules, and Declarations. Unfortunately this existing model can't be used directly to power an inspector. The CSS needs to be rewritten on the fly, but done in a way that is robust, has an easy interface to manipulate the style, and can be easily represented using JavaScript objects, arrays, and values. The next section will introduce the CSS Lexer and start parsing the generated tokens to build up a customized CSS object model.

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
