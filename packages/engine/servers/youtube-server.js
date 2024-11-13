import url from 'url';
import fs from 'fs';
import mktemp from 'mktemp';
import youtubedl from 'youtube-dl-exec';

//

export class YoutubeServer {
  constructor() {
    // nothing
  }
  async handleRequest(req, res) {
    try {
      console.log('youtube server handle request', req.url);

      const u = url.parse(req.url, true);

      if (u.pathname.startsWith('/api/youtube') && u.query.url && u.query.type) {
        const {
          type,
          url: youtubeUrl,
          startTime,
          endTime,
        } = u.query;

        const externalDownloaderArgsArray = [];
        const timeRegex = /^([0-9]+):([0-9]+):([0-9]+)\.([0-9]+)$/;
        let match;
        if (match = (startTime || '').match(timeRegex)) {
          externalDownloaderArgsArray.push('-ss', `${match[1]}:${match[2]}:${match[3]}.${match[4]}`);
        }
        if (match = (endTime || '').match(timeRegex)) {
          externalDownloaderArgsArray.push('-to', `${match[1]}:${match[2]}:${match[3]}.${match[4]}`);
        }
        const externalDownloaderArgs = externalDownloaderArgsArray.length > 0 ?
          externalDownloaderArgsArray.join(' ')
        : undefined;
        // '-ss 00:00:00.00 -to 00:01:00.00'
        // '?endTime=00:00:05.00'
        
        if (type === 'audio') {
          const p = await mktemp.createFile('XXXXXXXX.mp3');
          const rootName = p.match(/^([^\.]*)\./)[1];
          
          const outputPath = `/tmp/${rootName}.%(ext)s`;
          console.log('load audio', {
            youtubeUrl,
            outputPath,
            startTime,
            endTime,
            externalDownloaderArgs,
          });

          youtubedl(youtubeUrl, {
            extractAudio: true,
            audioFormat: 'mp3',
            // dumpSingleJson: true,
            output: outputPath,
            // output: p,
            // noContinue: true,
            // output: '-.mp3s', // stdout

            externalDownloader: 'ffmpeg',
            externalDownloaderArgs,
          }).then(out => {
            // console.log('out 1', out);

            const p2 = `/tmp/${rootName}.mp3`;

            const rs = fs.createReadStream(p2);
            rs.on('error', err => {
              console.warn('read stream error', err);
              res.sendStatus(500);

              cleanup();
            });
            rs.on('finish', () => {
              // console.log('read stream finish');

              cleanup();
            });
            res.setHeader('Content-Type', 'audio/mpeg');
            rs.pipe(res);

            const cleanup = async () => {
              await fs.promises.unlink(p);
              await fs.promises.unlink(p2);
            };
          }).catch(err => {
            console.warn('err', err);
          });
        } else if (type === 'video') {
          const p = await mktemp.createFile('XXXXXXXX.mp4');
          const rootName = p.match(/^([^\.]*)\./)[1];

          const outputPath = `/tmp/${rootName}.%(ext)s`;
          console.log('load video', {
            youtubeUrl,
            outputPath,
            startTime,
            endTime,
            externalDownloaderArgs,
          });

          youtubedl(youtubeUrl, {
            // extractAudio: true,
            // audioFormat: 'mp3',
            // dumpSingleJson: true,
            // format: 'bv[ext=mp4]+ba[ext=m4a]',
            // -c:v libx264 -crf 23 -c:a aac -movflags faststart
            output: outputPath,
            // --postprocessor-args "ffmpeg:-ac 2 -ar 48000"
            f: 'mp4',
            postprocessorArgs: 'ffmpeg:-c:v libx264 -crf 23 -c:a aac -movflags faststart',
            // output: p,
            // noContinue: true,

            externalDownloader: 'ffmpeg',
            externalDownloaderArgs,
          }).then(out => {
            // console.log('out', out);

            const p2 = `/tmp/${rootName}.mp4`;

            const rs = fs.createReadStream(p2);
            rs.on('error', err => {
              console.warn('read stream error', err);
              res.sendStatus(500);

              cleanup();
            });
            rs.on('finish', () => {
              // console.log('read stream finish');

              cleanup();
            });
            res.setHeader('Content-Type', 'video/mp4');
            rs.pipe(res);

            const cleanup = async () => {
              await fs.promises.unlink(p);
              await fs.promises.unlink(p2);
            };
          }).catch(err => {
            console.warn('err', err);
          });
        } else {
          console.warn('unknown type', type);
          res.sendStatus(400);
        }
      } else {
        console.warn('image client had no url match', req.url);
        res.sendStatus(404);
      }
    } catch (err) {
      console.warn('youtube client error', err);
      res.status(500).send(err.stack);
    }
  }
}