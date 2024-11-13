import * as THREE from 'three';
import React, {
  useState,
  useEffect,
} from 'react';
// import {
//   App,
// } from '../../app-runtime/app.js';
import reactHelpers from '../react-helpers.js';
import {Text} from 'troika-three-text/src/Text.js';

//

const {
  div,
  span,
  input,
  label,
  select,
  option,
} = reactHelpers;

//

const anchorXOptions = [
  'center',
  'left',
  'right',
  // technically also supports percentages
];
const anchorYOptions = [
  'top',
  'top-baseline',
  'top-cap',
  'top-ex',
  'middle',
  'bottom-baseline',
  'bottom',
  // technically also supports percentages
];
const defaults = {
  text: 'Hello world!',
  font: '/fonts/WinchesterCaps.ttf',
  fontSize: 1,
  letterSpacing: 0,
  color: 0x000000,
  anchorX: anchorXOptions[0],
  anchorY: anchorYOptions[0],
};
async function makeTextMesh({
  text = defaults.text,
  material = null,
  font = defaults.font,
  fontSize = defaults.fontSize,
  letterSpacing = defaults.letterSpacing,
  anchorX = defaults.anchorX,
  anchorY = defaults.anchorY,
  color = defaults.color,
} = {}) {
  const textMesh = new Text();
  textMesh.text = text;
  if (material) {
    textMesh.material = material;
  }
  textMesh.font = font;
  textMesh.fontSize = fontSize;
  textMesh.letterSpacing = letterSpacing;
  textMesh.color = color;
  textMesh.anchorX = anchorX;
  textMesh.anchorY = anchorY;
  textMesh.frustumCulled = false;
  await new Promise(accept => {
    textMesh.sync(accept);
  });
  return textMesh;
}

//

export default srcUrl => ctx => {
  const {
    useApp,
    useComponentUi,
  } = ctx;

  const app = useApp();

  app.name = 'text';
  app.description = 'A text field';
  
  ctx.waitUntil((async () => {
    // const res = await fetch(srcUrl);
    // const json = await res.json();

    const componentsObject = app.getComponents();
    const textMesh = await makeTextMesh(componentsObject);
    app.add(textMesh);
    textMesh.updateMatrixWorld();

    const componentNames = [
      'text',
      'font',
      'fontSize',
      'letterSpacing',
      'color',
      'anchorX',
      'anchorY',
    ];
    const updateText = async () => {
      for (const componentName of componentNames) {
        const value = app.getComponent(componentName);
        if (value !== undefined) {
          textMesh[componentName] = value;
        }
      }

      await new Promise(accept => {
        textMesh.sync(accept);
      });
    };
    app.addEventListener('componentsupdate', e => {
      if (componentNames.some(componentName => e.keys.includes(componentName))) {
        updateText();
      }
    });

    // register components ui
    useComponentUi(() => {
      const [text, setText] = useState(() => app.getComponent('text') || defaults.text);
      const [font, setFont] = useState(() => app.getComponent('font') || defaults.font);
      const [fontSize, setFontSize] = useState(() => app.getComponent('fontSize') || defaults.fontSize);
      const [letterSpacing, setLetterSpacing] = useState(() => app.getComponent('letterSpacing') || defaults.letterSpacing);
      const [color, setColor] = useState(() => app.getComponent('color') || defaults.color);
      const [anchorX, setAnchorX] = useState(() => app.getComponent('anchorX') || defaults.anchorX);
      const [anchorY, setAnchorY] = useState(() => app.getComponent('anchorY') || defaults.anchorY);

      useEffect(() => {
        if (
          app.getComponent('text') !== text ||
          app.getComponent('font') !== font ||
          app.getComponent('fontSize') !== fontSize ||
          app.getComponent('letterSpacing') !== letterSpacing ||
          app.getComponent('color') !== color ||
          app.getComponent('anchorX') !== anchorX ||
          app.getComponent('anchorY') !== anchorY
        )
        app.setComponents({
          text,
          font,
          fontSize,
          letterSpacing,
          color,
          anchorX,
          anchorY,
        });
      }, [
        text,
        font,
        fontSize,
        letterSpacing,
        color,
        anchorX,
        anchorY,
      ]);

      return div(
        []
        .concat([
          div([
            label([
              span('Text'),
              input({
                type: 'text',
                value: text,
                placeholder: 'Hello, world!',
                onChange: e => {
                  setText(e.target.value);
                },
              }),
            ]),
          ]),
          div([
            label([
              span('Font'),
              input({
                type: 'font',
                value: font,
                placeholder: '/fonts/WinchesterCaps.ttf',
                onChange: e => {
                  setFont(e.target.value);
                },
              }),
            ]),
          ]),
          div([
            label([
              span('Font Size'),
              input({
                type: 'number',
                value: fontSize,
                placeholder: '1',
                onChange: e => {
                  setFontSize(Number(e.target.value));
                },
              }),
            ]),
          ]),
          div([
            label([
              span('Letter Spacing'),
              input({
                type: 'number',
                value: letterSpacing,
                placeholder: '0',
                onChange: e => {
                  setLetterSpacing(Number(e.target.value));
                },
              }),
            ]),
          ]),
          div([
            label([
              span('Color'),
              input({
                type: 'color',
                value: color,
                onChange: e => {
                  setColor(e.target.value);
                },
              }),
            ]),
          ]),
          div([
            label([
              span('Anchor X'),
              select({
                value: anchorX,
                onChange: e => {
                  setAnchorX(e.target.value);
                },
              }, anchorXOptions.map(anchorXOption => option({
                value: anchorXOption,
              }, anchorXOption))),
            ]),
          ]),
          div([
            label([
              span('Anchor Y'),
              select({
                value: anchorY,
                onChange: e => {
                  setAnchorY(e.target.value);
                },
              }, anchorYOptions.map(anchorYOption => option({
                value: anchorYOption,
              }, anchorYOption))),
            ]),
          ]),
        ]),
      );
    });
  })());

  return app;
};