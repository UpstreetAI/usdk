import React from 'react';

function reactHelpersCreateElement(elementName, props, _children) {
  let children;
  if (Array.isArray(props)) {
    children = props;
    props = undefined;
  } else if (typeof props === 'string' || typeof props === 'number') {
    children = [props];
    props = undefined;
  } else {
    children = _children;
  }
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      if (typeof child === 'object' && (child.key === undefined || child.key === null)) {
        child = React.cloneElement(child, {
          key: i,
        });
        children[i] = child;
      }
    }
  }
  return React.createElement(elementName, props, children);
}

const TAG_NAMES = [
  'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo',
  'big', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col',
  'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt',
  'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4',
  'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins',
  'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem',
  'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param',
  'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select',
  'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td',
  'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'video',
  'wbr', 'circle', 'clipPath', 'defs', 'ellipse', 'g', 'image', 'line', 'linearGradient', 'mask',
  'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'stop', 'svg', 'text', 'tspan'
];
const reactHelpers = {
  Fragment: (props, children) => reactHelpersCreateElement(React.Fragment, props, children),
};
for (const elementName of TAG_NAMES) {
  reactHelpers[elementName] = (props, children) => reactHelpersCreateElement(elementName, props, children);
}
export default reactHelpers;