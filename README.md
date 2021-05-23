# ref-to

ref-to is a web component.  Sample syntax:

```html
<ref-to id=myRefTo my-grid></ref-to>
```

What ref-to does:

1.  It looks for its single attribute (my-grid in this case).  That single attribute is expected to satisfy custom-element/web-component naming conventions.
2.  It does document.createElement('myGrid') and creates a weak reference to it, and dynamically creates a property to retrieve the element if it exists:  myRefTo.myGrid (camelCase).  ref-to does **not** add the element to any live DOM tree.
3.  ref-to fires an event, 'weak-ref-to-created' and passes the element created in step 2 in the detail of the event.  detail.createdElement.
4.  If the weak reference is dereferenced, the ref-to element disappears.
