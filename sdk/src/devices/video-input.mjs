import { EventEmitter } from 'events';
import child_process from 'child_process';
import webp from 'webp-wasm';
import Jimp from 'jimp';
import chalk from 'chalk';
import ansiEscapeSequences from 'ansi-escape-sequences';
import { QueueManager } from '../util/queue-manager.mjs';
import { aiProxyHost } from '../util/endpoints.mjs';

//

export const encodeWebp = async (imageData) => {
  return await webp.encode(imageData, {
    quality: 75,
    // lossless: 0,
  });
};

//

export const describe = async (frame, query = `What's in this image?`, {
  jwt,
}) => {
  const messages = [
    {
      role: 'user',
      content: [
        {
          "type": "text",
          "text": query,
        },
        {
          "type": "image_url",
          "image_url": {
            "url": `data:image/webp;base64,${frame.toString('base64')}`,
          }
        }
      ],
    },
  ];
  const res = await fetch(`https://${aiProxyHost}/api/ai/chat/completions`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      // 'OpenAI-Beta': 'assistants=v1',
      Authorization: `Bearer ${jwt}`,
    },

    body: JSON.stringify({
      model: 'gpt-4o',
      messages,

      // stream,
    }),
    // signal,
  });
  if (res.ok) {
    const j = await res.json();
    return j.choices[0].message.content;
  } else {
    const text = await res.text();
    throw new Error('invalid status code: ' + res.status + ': ' + text);
  }
};

//

export class TerminalVideoRenderer {
  constructor({
    width,
    height,
    footerHeight = 0,
  }) {
    this.width = width;
    this.height = height;
    this.footerHeight = footerHeight;
    if (footerHeight === 0) {
      throw new Error('footerHeight must be greater than 0');
    }

    this.imageData = null;
    this.description = null;

    this.lastDescriptionLines = 0;
  }
  setImageData(imageData) {
    this.imageData = imageData;
  }
  setDescription(description) {
    this.description = description;
  }
  render() {
    const {
      imageData,
      width,
      height,
      footerHeight,
      description,
    } = this;

    let s = '';
    if (imageData) {
      // `log-update` adds an extra newline so the generated frames need to be 2 pixels shorter.
      const ROW_OFFSET = 2;

      const PIXEL = '\u2584';

      function scale(width, height, originalWidth, originalHeight) {
        const originalRatio = originalWidth / originalHeight;
        const factor = (width / height > originalRatio ? height / originalHeight : width / originalWidth);
        width = factor * originalWidth;
        height = factor * originalHeight;
        return {width, height};
      }

      function checkAndGetDimensionValue(value, percentageBase) {
        if (typeof value === 'string' && value.endsWith('%')) {
          const percentageValue = Number.parseFloat(value);
          if (!Number.isNaN(percentageValue) && percentageValue > 0 && percentageValue <= 100) {
            return Math.floor(percentageValue / 100 * percentageBase);
          }
        }

        if (typeof value === 'number') {
          return value;
        }

        throw new Error(`${value} is not a valid dimension value`);
      }

      function calculateWidthHeight(imageWidth, imageHeight, inputWidth, inputHeight, preserveAspectRatio) {
        const terminalColumns = process.stdout.columns || 80;
        const terminalRows = process.stdout.rows - ROW_OFFSET || 24;

        let width;
        let height;

        if (inputHeight && inputWidth) {
          width = checkAndGetDimensionValue(inputWidth, terminalColumns);
          height = checkAndGetDimensionValue(inputHeight, terminalRows) * 2;

          if (preserveAspectRatio) {
            ({width, height} = scale(width, height, imageWidth, imageHeight));
          }
        } else if (inputWidth) {
          width = checkAndGetDimensionValue(inputWidth, terminalColumns);
          height = imageHeight * width / imageWidth;
        } else if (inputHeight) {
          height = checkAndGetDimensionValue(inputHeight, terminalRows) * 2;
          width = imageWidth * height / imageHeight;
        } else {
          ({width, height} = scale(terminalColumns, terminalRows * 2, imageWidth, imageHeight));
        }

        if (width > terminalColumns) {
          ({width, height} = scale(terminalColumns, terminalRows * 2, width, height));
        }

        width = Math.round(width);
        height = Math.round(height);

        return {width, height};
      }

      function render(image, {width: inputWidth, height: inputHeight, preserveAspectRatio}) {
        // const image = await Jimp.read(buffer);
        const {bitmap} = image;

        const {width, height} = calculateWidthHeight(bitmap.width, bitmap.height, inputWidth, inputHeight, preserveAspectRatio);

        image.resize(width, height);

        let result = '';
        for (let y = 0; y < image.bitmap.height - 1; y += 2) {
          for (let x = 0; x < image.bitmap.width; x++) {
            const {r, g, b, a} = Jimp.intToRGBA(image.getPixelColor(x, y));
            const {r: r2, g: g2, b: b2} = Jimp.intToRGBA(image.getPixelColor(x, y + 1));
            result += a === 0 ? chalk.reset(' ') : chalk.bgRgb(r, g, b).rgb(r2, g2, b2)(PIXEL);
          }

          result += '\n';
        }

        return result;
      }
      const image = new Jimp(imageData.width, imageData.height);
      // image.bitmap.data.set(imageData.data);
      image.bitmap.data.set(imageData.data);
      s += render(image, {
        width,
        height,
      });
      s = ansiEscapeSequences.cursor.previousLine(image.bitmap.height / 2) + s;
    }
    if (typeof description === 'string') {
      // trim the description to width, breaking with newlines
      const trimmedDescription = [];
      let currentLine = '';
      for (let i = 0; i < description.length; i++) {
        currentLine += description[i];
        if (currentLine.length >= width) {
          trimmedDescription.push(currentLine);
          currentLine = '';
        }
      }
      if (currentLine.length > 0) {
        trimmedDescription.push(currentLine);
      }

      // ensure the last line is full. pad with spaces.
      if (trimmedDescription.length > 0) {
        const lastLine = trimmedDescription[trimmedDescription.length - 1];
        if (lastLine.length < width) {
          trimmedDescription[trimmedDescription.length - 1] = lastLine.padEnd(width, ' ');
        }
      }

      this.lastDescriptionLines = trimmedDescription.length;
      s += trimmedDescription.join('\n');
      if (this.lastDescriptionLines > 1) {
        s = ansiEscapeSequences.cursor.previousLine(this.lastDescriptionLines - 1) + s;
      }
    } else {
      this.lastDescriptionLines = 0;
    }
    if (footerHeight > 0) {
      s = ansiEscapeSequences.cursor.previousLine(footerHeight) + s;
      s += '\r' + Array(footerHeight + 1).join('\n');

      // s = ansiEscapeSequences.cursor.previousLine(footerHeight - 1) + s;
      // s += '\r' + Array(this.footerHeight + 1).join('\n');
    }

    process.stdout.write(s);
  }
}

//

export class VideoInput extends EventEmitter {
  queueManager = new QueueManager();

  constructor(id, {
    width,
    height,
    framerate = 30,
    fps = 1,
  } = {}) {
    super();

    // ffmpeg -f avfoundation -framerate 30 -i "0" -vf "fps=1" -c:v libwebp -lossless 1 -f image2pipe -
    const cp = child_process.spawn('ffmpeg', [
      '-f', 'avfoundation',
      '-framerate', `${framerate}`,
      '-i', `${id}`,
      '-vf', `fps=${fps}`,
      '-c:v', 'libwebp',
      // '-lossless', '1',
      '-f', 'image2pipe',
      '-',
    ]);
    // cp.stderr.pipe(process.stderr);
    const bs = [];
    let bsLength = 0;
    const tryParseFrame = async () => {
      if (bsLength >= 8) {
        const b = Buffer.concat(bs);
        // check for 'RIFF'
        if (
          b[0] === 0x52 && // 'R'
          b[1] === 0x49 && // 'I'
          b[2] === 0x46 && // 'F'
          b[3] === 0x46 // 'F'
        ) {
          let fileSize = new DataView(b.buffer, b.byteOffset + 4, 4).getUint32(0, true); // little-endian
          fileSize += 8; // add header size
          if (bsLength >= fileSize) {
            const data = b.slice(0, fileSize);
            await this.queueManager.waitForTurn(async () => {
              let imageData = await webp.decode(data);
              if (typeof width === 'number' || typeof height === 'number') {
                const image = new Jimp(imageData.width, imageData.height);
                image.bitmap.data.set(imageData.data);
                image.resize(
                  typeof width === 'number' ? width : Jimp.AUTO,
                  typeof height === 'number' ? height : Jimp.AUTO,
                );
                // imageData.data.set(image.bitmap.data);
                // imageData.width = image.bitmap.width;
                // imageData.height = image.bitmap.height;
                // imageData = new ImageData(image.bitmap.data, image.bitmap.width, image.bitmap.height)
                imageData = image.bitmap;
              }
              this.emit('frame', imageData);
            });

            bs.length = 0;
            bsLength -= fileSize;
            if (bsLength > 0) {
              bs.push(b.slice(fileSize));
            }
          }
        }
      }
    };
    cp.stdout.on('data', data => {
      this.emit('data', data);

      bs.push(data);
      bsLength += data.length;

      tryParseFrame();
    });
    cp.stdout.on('end', () => {
      this.emit('end');
    });
    cp.on('error', err => {
      this.emit('error', err);
    });
  }
};