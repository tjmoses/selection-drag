const { default: Selection } = require('./dist/selection.min.js');

const bodyContent = `
    <div>
      <div class="container">
        <div id="topArea"><div>
        <div class="innerContainer">
          <ul>
            <li class="listitem">item1</li>
            <li class="listitem">item2</li>
          </ul>
        </div>
      </div>
      <div id="bottomArea"><div>
    </div>`;
const stylesContent = `
  #topArea, #bottomArea {
    height: 200px;
    width: 2200px;
    background-color: lightgrey;
  }
  .container {
    height 200px;
    background-color: darkgray;
  }
  .container:hover {
    cursor: pointer;
  }
  ul {
    list-style: none;
    text-align: center;
  }
  .listitem {
    padding: 10px 0;
    border: 2px solid black;
    width: 30%;
  }
  .listitem.active {
    background-color: yellow;
  }
`;
const createContentAndStyles = () => {
  document.body.innerHTML = bodyContent;
  const style = document.createElement('style');
  style.type = 'text/css';
  document.head.appendChild(style);
  style.appendChild(document.createTextNode(stylesContent));
}

describe('Mounting & Positioning Tests.', () => {
  const $ = v => document.querySelector(v);
  createContentAndStyles();
  const container = $('.container');
  const sel = Selection({
    container,
    targetSelectors: '.listitem'
  });

  test('Component mounts and unmounts on DOM properly after mouse click & move.', () => {
    const mouseDown = new MouseEvent('mousedown', { which: 1 });
    const mouseMove = new MouseEvent("mousemove");
    const mouseUp = new MouseEvent("mouseup");

    container.dispatchEvent(mouseDown);
    container.dispatchEvent(mouseMove);
    
    let selectionEle = $('#selectionRectangle');
    expect(selectionEle).not.toBe(null);
    container.dispatchEvent(mouseUp);
    selectionEle = $('#selectionRectangle');
    expect(selectionEle).toBe(null);
  });
  // TODO: finish tests.
  // test('Component has height and width after mouse click and drag.', () => {
  //   var mouseDown = new MouseEvent('mousedown', { which: 1, clientX: "2px", clientY: "2px" });
  //   var mouseMove = new MouseEvent("mousemove");
  //   var mouseUp = new MouseEvent("mouseup");
  // });
});

// describe('Component has height and width after mouse click and drag.', () => {});
// describe('In a list, one element was selected properly.', () => {});
// describe('In a list, two adjacent elements were selected properly.', () => {});
// describe('In a list, one of two elements were removed properly.', () => {});
// describe('In a list, two elements were removed after being selected.', () => {});
