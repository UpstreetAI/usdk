throw new Error('do not import');

export class AiAgent {
  constructor() {
  }
}

function getIoElements(rootNode) {
  const min = 100;
  const max = window.innerWidth * 0.75;

  const ioTags = [
    'input', 'select', 'textarea', 'button',
  ];
  // const imageTags = [
  //   'img', 'svg',
  // ];

  function hasContent(node) {
    return node.offsetParent && (
      /[A-zÀ-ÿ0-9\u0100-\u017F]/.test(node.innerText) // ||
        // node.querySelector('img, svg') !== null
    );
  }

  function isImportantTextNode(node) {
    const rect = node.getBoundingClientRect();
    const hasSufficientSize = rect.width > min || rect.height > min;
    // const hasNonEmptyContent = /\w+/i.test(node.textContent);
    return hasSufficientSize // && hasNonEmptyContent;
  }

  function isImportantLink(node) {
    if (node.tagName.toLowerCase() !== 'a') {
      return false;
    }

    const href = node.getAttribute('href');
    const hasHref = !!href && !/^#/.test(href);
    const hasImportantText = isImportantTextNode(node);
    const hasImage = node.querySelector('img') !== null;

    return hasHref && (hasImportantText || hasImage);
  }

  function isImportantInputElement(node) {
    const tagName = node.tagName.toLowerCase();
    return ioTags.includes(tagName);
  }

  // function isImportantImageElement(node) {
  //   return false;
  //   // const tagName = node.tagName.toLowerCase();
  //   // return imageTags.includes(tagName);
  // }

  function isImportantNode(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }

    // const tagName = node.tagName.toLowerCase();
    // if (tagName === 'html' || tagName === 'body') {
    //   return false;
    // }

    return hasContent(node) &&
      (
        // isImportantTextNode(node) ||
        isImportantLink(node) ||
        isImportantInputElement(node) // ||
        // isImportantImageElement(node)
      );
  }

  const allNodes = rootNode.querySelectorAll('*');
  const importantNodes = [];

  for (const node of allNodes) {
    if (isImportantNode(node)) {
      importantNodes.push(node);
    }
  }

  const smallImportantNodes = importantNodes.filter(node => {
    const rect = node.getBoundingClientRect();
    if (rect.width > max || rect.height > max) {
      return false;
    } else if (node.querySelectorAll(ioTags.join(', ')).length > 1) {
      return false;
    } else {
      return true;
    }
  });

  const outerImportantNodes = [];
  for (const node of smallImportantNodes) {
    let current = node.parentElement;
    let isNested = false;

    while (current) {
      if (smallImportantNodes.includes(current)) {
        isNested = true;
        break;
      }
      current = current.parentElement;
    }

    if (!isNested) {
      outerImportantNodes.push(node);
    }
  }
  return outerImportantNodes;
}
globalThis.testIoElementsRead = () => {
  const ioElements = getIoElements(document);
  console.log(o = ioElements.map(e => ([e, e.innerText ? e.innerText
    .replace(/[^A-zÀ-ÿ0-9\u0100-\u017F\s]+/g, '')
    .replace(/^\s+/, '')
    .replace(/\s+$/, '')
  : ''])));
  console.log(s = o.map(o => o[1]).join(' '));
};

//

function getTextElements(rootNode) {
  const min = window.innerWidth * 0.2;
  const max = window.innerWidth * 0.75;

  function hasContent(node) {
    return node.offsetParent && (
      /[A-zÀ-ÿ0-9\u0100-\u017F]/.test(node.innerText)
    );
  }

  /* function isImportantTextNode(node) {
    // get all text nodes
    // XXX also need to get normal childless nodes that are not inside an anchor tag
    const textNodes = [];
    const walker = document.createTreeWalker(
      node,
      NodeFilter.SHOW_TEXT,
      null
    );
    let currentNode = walker.nextNode();
    while (currentNode) {
      // if it's not contained in an anchor tag
      if (!currentNode.parentElement.closest('a')) {
        textNodes.push(currentNode);
      }

      currentNode = walker.nextNode();
    }

    // console.log('got nodes', textNodes);

    // get the max bounding box of all text nodes
    const maxBox = [
      [Infinity, Infinity],
      [-Infinity, -Infinity],
    ];
    for (const textNode of textNodes) {
      const range = document.createRange();
      range.selectNode(textNode);
      const rect = range.getBoundingClientRect();
      if (rect.width > min || rect.height > min) {
        maxBox[0][0] = Math.min(maxBox[0][0], rect.left);
        maxBox[0][1] = Math.min(maxBox[0][1], rect.top);
        maxBox[1][0] = Math.max(maxBox[1][0], rect.right);
        maxBox[1][1] = Math.max(maxBox[1][1], rect.bottom);
      }
    }
    const w = maxBox[1][0] - maxBox[0][0];
    const h = maxBox[1][1] - maxBox[0][1];
    const hasSufficientSize = w > min || h > min;
    return hasSufficientSize;
  } */
  function isImportantTextNode(node) {
    const rect = node.getBoundingClientRect();
    const hasSufficientSize = rect.width > min || rect.height > min;
    // const hasNonEmptyContent = /\w+/i.test(node.textContent);
    if (hasSufficientSize) {
      if (!node.parentElement.closest('a')) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  function isImportantNode(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }

    return hasContent(node) &&
      (
        isImportantTextNode(node) // ||
        // isImportantLink(node) ||
        // isImportantInputElement(node) ||
        // isImportantImageElement(node)
      );
  }

  const allNodes = rootNode.querySelectorAll('*');
  const importantNodes = [];

  for (const node of allNodes) {
    if (isImportantNode(node)) {
      importantNodes.push(node);
    }
  }

  const smallImportantNodes = importantNodes.filter(node => {
    const rect = node.getBoundingClientRect();
    if (rect.width > max || rect.height > max) {
      return false;
    // } else if (node.querySelectorAll(ioTags.join(', ')).length > 1) {
    //   return false;
    } else {
      return true;
    }
  });

  const outerImportantNodes = [];
  for (const node of smallImportantNodes) {
    let current = node.parentElement;
    let isNested = false;

    while (current) {
      if (smallImportantNodes.includes(current)) {
        isNested = true;
        break;
      }
      current = current.parentElement;
    }

    if (!isNested) {
      outerImportantNodes.push(node);
    }
  }
  return outerImportantNodes;
}
globalThis.testTextElementsRead = () => {
  const textElements = getTextElements(document);
  console.log(o = textElements.map(e => ([e, e.innerText ? e.innerText
    .replace(/[^A-zÀ-ÿ0-9\u0100-\u017F\s]+/g, '')
    .replace(/^\s+/, '')
    .replace(/\s+$/, '')
  : ''])));
  console.log(s = o.map(o => o[1]).join(' '));
};