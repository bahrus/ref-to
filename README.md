# ref-to

ref-to is a web component.  Sample syntax:

```html
<ref-to a=my-grid id=myRefTo></ref-to>
```

What ref-to does:

1.  Attribute a is expected to be the name of a built-in element, or satisfy custom-element/web-component naming conventions.
2.  It does document.createElement('my-grid') (in this example) and creates a weak reference to it.  The actual element can be retrieved, if it still exists:  myRefTo.myElement (camelCase).  ref-to does **not** add the element to any live DOM tree.
3.  ref-to searches direct children for text nodes and ref-to children.  In the case of rev-to's, adds reference to children of its reference.  Other elements are cloned and added.
3.  ref-to fires an event, 'element-created' and passes the element created in step 2 in the detail of the event.  detail.createdElement.
4.  If the weak reference is dereferenced (discovered doing a get()), the ref-to element disappears.
5.  If the ref-to element is removed from the DOM, so is the element it created.
