import {
  // img2img,
  generateImage,
  setSdModel,
} from '../../generate-image.js';
import {
  backgroundModel,
  backgroundLora,

  backgroundPrompt,
  backgroundNegativePrompt,
} from '../../constants/model-constants.js';

import {
  Storyboard,
} from '../../../gen/src/generators/sg-storyboard.js';
import {
  makePromise,
  blob2img,
  downloadFile,
} from '../../util.js';

//

const zineMagicBytes = 'ZINE';

//

export const generatePanel3D = async ({
  prompt,
  file,
  debug = false,
  setGenerationStatus
}) => {
  const generateZineFromFile = async (file, setGenerationStatus) => {
  /* const addFiles = newFiles => {
    const file = newFiles[0];
    if (file) {
      console.log('add file', file);
      const panel = storyboard.addPanelFromFile(file);
      onPanelSelect(panel);
    }
  }; */
  // const multiCompileFiles = async files => {
  //   for (const file of files) {
      const storyboard = new Storyboard();

      const panel = storyboard.addPanelFromFile(file);
      // wait for file add
      {
        const p = makePromise();
        const onbusyupdate = e => {
          if (!panel.isBusy()) {
            cleanup();
            // setBusy(panel.isBusy());
            // setBusyMessage(panel.getBusyMessage());
            p.resolve();
          }
        };
        panel.addEventListener('busyupdate', onbusyupdate);
        const cleanup = () => {
          panel.removeEventListener('busyupdate', onbusyupdate);
        };
        await p;
      }
      // compile
      console.log('compile 1', {
        panel,
        storyboard,
      });
      setGenerationStatus('Compiling panel')
      await panel.compile();
      console.log('compile 2', {
        panel,
        storyboard,
      });

      const imageArrayBuffer = panel.getLayer(0).getData('image');
      const imageBlob = new Blob([imageArrayBuffer], {
        type: 'image/png',
      });
      setGenerationStatus('Exporting storyboard')
      const uint8Array = await storyboard.exportAsync();
      console.log('compile 3', {
        panel,
        storyboard,
        uint8Array,
      });
      const zineBlob = new Blob([
        zineMagicBytes,
        uint8Array,
      ], {
        type: 'application/octet-stream',
      });
      // downloadFile(resultBlob, 'storyboard.zine');

      return {
        imageBlob,
        zineBlob,
      };
  //   }
  // };
  };

  if (file) {
    setGenerationStatus('Generating zine')
    const result = await generateZineFromFile(file, setGenerationStatus);
    return result;
  } else {
    setGenerationStatus('Setting image model')
    await setSdModel(backgroundModel);

    const fullPrompt = (backgroundLora ? (backgroundLora + ' ') : '') + [
      prompt,
      backgroundPrompt,
    ].join(', ');
    setGenerationStatus('Generating image from prompt')
    const imageBlob = await generateImage({
      prompt: fullPrompt,
      negativePrompt: backgroundNegativePrompt,
    });

    const image = await blob2img(imageBlob);
    if(debug){
      image.style.cssText = `\
      position: fixed;
      top: 0;
      left: 0;
      width: 512px;
      z-index: 1;
      `;
      document.body.appendChild(image);
    }
    setGenerationStatus('Generating zine')
    const result = await generateZineFromFile(imageBlob, setGenerationStatus);
    return result;
  }
};
export const batchGeneratePanel3Ds = async (files) => {
  // XXX
};
