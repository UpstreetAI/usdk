import {
  Readable,
} from 'stream';

export class AiServer {
  constructor({
    openAiApiKey,
    elevenLabsApiKey,
    anthropicApiKey,
    // replicateApiToken,
    blockadelabsApiKey,
  }) {
    if (!openAiApiKey || !elevenLabsApiKey || !anthropicApiKey /*|| !replicateApiToken*/ || !blockadelabsApiKey) {
      console.warn('ai server missing api keys', {
        openAiApiKey: !!openAiApiKey,
        elevenLabsApiKey: !!elevenLabsApiKey,
        anthropicApiKey: !!anthropicApiKey,
        // replicateApiToken: !!replicateApiToken,
        blockadelabsApiKey: !!blockadelabsApiKey,
      });
      debugger;
      throw new Error('missing api keys: ' + JSON.stringify({
        openAiApiKey: !!openAiApiKey,
        elevenLabsApiKey: !!elevenLabsApiKey,
        anthropicApiKey: !!anthropicApiKey,
        // replicateApiToken: !!replicateApiToken,
        blockadelabsApiKey: !!blockadelabsApiKey,
      }, null, 2));
    }

    this.openAiApiKey = openAiApiKey;
    this.elevenLabsApiKey = elevenLabsApiKey;
    this.anthropicApiKey = anthropicApiKey;
    // this.replicateApiToken = replicateApiToken;
    this.blockadelabsApiKey = blockadelabsApiKey;
  }
  async handleRequest(req, res) {
    const _proxy = async (req, res, u) => {
      console.log('proxy', {u});

      const headers = {};
      for (const k in req.headers) {
        if (k !== 'host') {
          headers[k] = req.headers[k];
        }
      }
      const opts = {
        method: req.method,
        headers,
        duplex: 'half',
      };
      if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        opts.body = req;
      }
      
      const proxyRes = await fetch(u, opts);
      res.status(proxyRes.status);
      Readable.fromWeb(proxyRes.body).pipe(res);
    };

    try {
      // console.log('ai server handle request yyy', req.url);

      let match;
      if (match = req.url.match(/^\/api\/ai\/(chat\/completions|completions|embeddings|images\/generations)/)) {

        const sub = match[1];

        // console.log('match 1', match);

        /* {
          "model": "gpt-3.5-turbo",
          "messages": [{"role": "user", "content": "Hello!"}]
        } */        

        const proxyRes = await fetch(`https://api.openai.com/v1/${sub}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.openAiApiKey}`,
            'Content-Type': 'application/json',
          },
          // pipe the node request to the fetch body
          body: req,
          duplex: 'half',
        });

        if (proxyRes.ok) {
          // console.log('got ok');
          if (sub !== 'images/generations') {
            // pipe the proxy response web stream to the nodejs response stream
            Readable.fromWeb(proxyRes.body).pipe(res);
          } else {
            const j = await proxyRes.json();
            const url2 = j?.data?.[0]?.url;
            const proxyRes2 = await fetch(url2);
            if (proxyRes2.ok) {
              // pipe the proxy response web stream to the nodejs response stream
              Readable.fromWeb(proxyRes2.body).pipe(res);
            } else {
              const text = await proxyRes2.text();
              console.warn('got generations api error response', text);
              res.status(500).send(text);
            }
          }
        } else {
          const text = await proxyRes.text();
          console.warn('got api error response', text);
          res.status(500).send(text);
        }
      } else if (match = req.url.match(/^\/api\/ai\/(audio\/transcriptions)/)) {
        // console.log('proxy audio');

        const sub = match[1];

        console.log('post', `https://api.openai.com/v1/${sub}`);

        console.log('request headers', req.headers);

        const proxyRes = await fetch(`https://api.openai.com/v1/${sub}`, {
          method: req.method,
          headers: {
            // ...req.headers,
            'Authorization': `Bearer ${this.openAiApiKey}`,
            'Content-Type': req.headers['content-type'],
            'Content-Length': req.headers['content-length'],
            'User-Agent': req.headers['user-agent'],
            'Accept': req.headers['accept'],
          },
          // pipe the node request to the fetch body
          body: req,
          duplex: 'half',
        });

        if (proxyRes.ok) {
          // proxy status
          res.status(proxyRes.status);
          // proxy headers
          [
            'content-type',
            'content-length',
          ].forEach(name => {
            const value = proxyRes.headers.get(name);
            if (value) {
              res.setHeader(name, value);
            }
          });
          // pipe the proxy response web stream to the nodejs response stream
          Readable.fromWeb(proxyRes.body).pipe(res);
        } else {
          const text = await proxyRes.text();
          console.warn('got api error response', text);
          res.status(500).send(text);
        }
      } else if (match = req.url.match(/^\/api\/ai\/(text-to-speech(?:\/.*)?)/)) {
        const sub = match[1];
        // console.log('proxy text-to-speech');

        // console.log('post', `https://api.openai.com/v1/${sub}`);
        // console.log('request headers', req.headers);

        const proxyRes = await fetch(`https://api.elevenlabs.io/v1/${sub}`, {
          method: req.method,
          headers: {
            // ...req.headers,
            'xi-api-key': this.elevenLabsApiKey,
            'Content-Type': req.headers['content-type'],
            'Content-Length': req.headers['content-length'],
            'User-Agent': req.headers['user-agent'],
            'Accept': req.headers['accept'],
          },
          // pipe the node request to the fetch body
          body: req,
          duplex: 'half',
        });

        if (proxyRes.ok) {
          // proxy status
          res.status(proxyRes.status);
          // proxy headers
          [
            'content-type',
            'content-length',
          ].forEach(name => {
            const value = proxyRes.headers.get(name);
            if (value) {
              res.setHeader(name, value);
            }
          });
          // pipe the proxy response web stream to the nodejs response stream
          Readable.fromWeb(proxyRes.body).pipe(res);
        } else {
          const text = await proxyRes.text();
          console.warn('got api error response', text);
          res.status(500).send(text);
        }
      // } else if (['/api/imageSegmentation/get_boxes'].some(prefix => req.url.startsWith(prefix))) {
      //   const form = new multiparty.Form();
      //   const data = await new Promise((resolve, reject) => {
      //     const fields = {};
      //     const files = {};

      //     form.on('part', function(part) {
      //       if (part.filename) {
      //         // 'part' is a file
      //         let buffers = [];
      //         part.on('data', function(chunk) {
      //           buffers.push(chunk);
      //         });

      //         part.on('end', function() {
      //           const buffer = Buffer.concat(buffers);
      //           buffer.name = part.filename;
      //           buffer.type = mime.lookup(part.filename);
      //           files[part.name] = buffer;
      //         });
              
      //         part.on('error', function(err) {
      //           reject(err);
      //         });
              
      //       } else {
      //         // 'part' is a field
      //         let value = '';
      //         part.on('data', function(chunk) {
      //           value += chunk;
      //         });

      //         part.on('end', function() {
      //           fields[part.name] = value;
      //         });
              
      //         part.on('error', function(err) {
      //           reject(err);
      //         });
      //       }
      //     });

      //     form.on('error', (err) => {
      //       reject(err);
      //     });

      //     form.on('close', () => {
      //       resolve({ fields, files });
      //     });

      //     form.parse(req);
      //   });

      //   console.log('pipe 1');
      //   const b64 = data.files.img_file.toString('base64');
      //   const ext = data.files.img_file.type;
      //   console.log('pipe 2', {ext});
      //   const prefix = 'data:' + ext + ';base64,';
      //   const dataUri = `${prefix}${b64}`;
      //   console.log('pipe 3');
      //   const output = await replicate.run(
      //     "lalalune/segment-anything-direct:60b5ca9c7a29b61c3ddf5f9724efbb9756ff5c5bab094948dd1e905249b7b0d5",
      //     {
      //       input: {
      //         image: dataUri,
      //       },
      //     },
      //   );
      //   console.log('responding with output 1');
      //   console.log('responding with output 2', output);
      //   res.status(200).send(output);
      } else if (match = req.url.match(/^\/api\/blockadelabs\/(images|depths)/)) {
        let u = req.url.replace(/^\/api\/blockadelabs/, '');
        u = `https://blockade-platform-production.s3.amazonaws.com` + u;
        u = new URL(u);
        // u.searchParams.set('api_key', this.blockadelabsApiKey);
        u = u.href;

        await _proxy(req, res, u);
      } else if (match = req.url.match(/^\/api\/blockadelabs/)) {
        let u = req.url.replace(/^(\/api)\/blockadelabs/, '$1');
        u = `https://backend.blockadelabs.com` + u;
        u = new URL(u);
        u.searchParams.set('api_key', this.blockadelabsApiKey);
        u = u.href;

        await _proxy(req, res, u);
      } else if (match = req.url.match(/^\/api\/ai\/(claude\/complete)/)) {
        const proxyRes = await fetch('https://api.anthrophic.com/v1/complete' , {
          method: req.method,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Client: "anthropic-typescript/0.4.3",
            'x-api-key': this.anthropicApiKey,
          },
          body: req,
        });
        if (proxyRes.ok) {
          // proxy status
          res.status(proxyRes.status);
          // proxy headers
          [
            'content-type',
            'content-length',
          ].forEach(name => {
            const value = proxyRes.headers.get(name);
            if (value) {
              res.setHeader(name, value);
            }
          });
          // pipe the proxy response web stream to the nodejs response stream
          Readable.fromWeb(proxyRes.body).pipe(res);
        } else {
          const text = await proxyRes.text();
          console.warn('got api error response', text);
          res.status(500).send(text);
        }
      } else {
        console.warn('image client had no url match', req.url);
        res.send(404);
      }
    } catch (err) {
      console.warn('ai client error', err);
      res.status(500).send(err.stack);
    }
  }
}