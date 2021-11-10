# Selection Drag - JS/TS Mouse Drag Area Selection Library

> This is a very ✌ lightweight & `simple` library for selecting an area on mouse click and drag.

## Install

```bash
npm install selection-drag
```

## Features

- Takes in a Container Element and sets up `_selectstart`, `_selectend`, `_selected`, and `_removed` events on it. `_selectend` gets the final list of selected elements, and `_selected` gets each selected one, whereas `_removed` gets each removed one.
- Also takes in target css selectors for the elements you want selected. The selection container has an id of `selectionRectangle` if you need to use it to add a click off event.
- Dynamically adds/removes the selection div and has a `cleanUp` method to restart selection, in addition to `disable`/`enable` methods to remove/add the above event listeners.
- Right and center mouse clicks are ignored, and scrolling is taken into consideration.

## Usage

### Example using JS alone

- [Demo](https://codepen.io/tmoses/pen/VwWaRKL)

```js
  import selectionDrag from 'selection-drag';
  ...

  const contentRef = document.querySelector('.container');
  const sel = selectionDrag({ container: contentRef, targetSelectors: '.listitem'});

  sel.rect.addEventListener('_selectstart', e => console.log('started!'))
  sel.rect.addEventListener('_selectend', e => {
    const { selectedElements } = e?.detail || {};
    console.log(selectedElements); // use all *active selected elements
  });
  sel.rect.addEventListener('_selected', e => {
     e.detail.addedElement.classList.add('active'); // add a class to that element
  });
   sel.rect.addEventListener('_removed', e => {                                       
     e.detail.removedElement.classList.remove('active'); // remove the added class
  });

  // other code such as container drop event listeners
  // remove & disable mouse selection area
  // sel.cleanUp();
  // sel.disable();
```

### Example using React Hooks & TS

```TS
// you can import any name since it uses default exports.
import Selection from 'selection-drag';
...
  const selectionRef = useRef<ReturnType<typeof Selection>>();
...
  useEffect(() => {
    if (!selectionRef.current) {
      const currentContentContainer = document.querySelector('.container');
      const sel = Selection({
        container: currentContentContainer,
        targetSelectors: `.${dynamicClass}`
      });
      selectionRef.current = sel;
      sel.rect.addEventListener('_selectstart', e => {
      // do stuff on select start.
      })
      sel.rect.addEventListener('_selectend', e => {
        const { selectedElements }: 
          { selectedElements: Element[] | undefined } = e?.detail || {};
        // use all *active selected elements
      });
      sel.rect.addEventListener('_selected', e =>
        // maybe add a hover class for each item selected
        e?.detail?.addedElement?.classList.add('active')
      );
      sel.rect.addEventListener('_removed', e =>
        // remove the hover class for each item selected
        e?.detail?.removedElement?.classList.remove('active')
      );
    }
  }, [YourDependencies]);
  ...
  // other code event listeners
  if (selectionRef.current) {
    // remove & disable mouse selection area
    selectionRef.current.cleanUp();
    selectionRef.current.disable();
  }
```

To support, Please &#127775; if you used / like this library!

## Contributing

Please see the contributing guidelines [here](contributing.md) for further information. All contributions are appreciated, even if they are just comments from issues.

## License

MIT
