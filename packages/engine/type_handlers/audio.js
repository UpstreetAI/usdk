import {
  useState,
  useEffect,
} from 'react';
import {
  makePromise,
} from '../util.js';
import reactHelpers from '../react-helpers.js';

const {
  div,
  span,
  label,
  input,
  button,
} = reactHelpers;

//

export default srcUrl => ctx => {
  const {
    useApp,
    useLoadingManager,
    useAudioManager,
    useComponentUi,
    useCleanup,
  } = ctx;
  const loadingManager = useLoadingManager();
  const audioManager = useAudioManager();

  const app = useApp();

  app.appType = 'audio';
 
  app.name = srcUrl.match(/([^\/]*)$/)[1];
  app.description = 'An audio file.';

  //

  const canPlayThroughPromise = makePromise();
  const waitForCanPlayThrough = () => canPlayThroughPromise;

  //

  ctx.waitUntil((async () => {
    const audio = new Audio(srcUrl);
    const volumeAttribute = app.getComponent('volume') ?? 1;
    audio.volume = volumeAttribute;
    audio.loop = app.getComponent('loop') ?? false;
    audio.oncanplaythrough = async () => {
      await Promise.all([
        loadingManager.waitForFinish(),
        audioManager.waitForStart(),
      ]);
      try {
        // await audio.play();
        canPlayThroughPromise.resolve(audio);
      } catch(err) {
        console.warn('audio play error', err.stack);
        // canPlayThroughPromise.reject(err);
      }
    };
    audio.onerror = err => {
      console.warn('audioload error', err.stack);
    };
    audio.style.cssText = `\
      position: absolute;
      visibility: hidden;
      pointer-events: none;
    `;
    document.body.appendChild(audio);

    app.addEventListener('componentsupdate', e => {
      const {keys} = e;
      if (keys.includes('volume')) {
        const volume = app.getComponent('volume');
        audio.volume = volume;
      }
      if (keys.includes('loop')) {
        const loop = app.getComponent('loop');
        audio.loop = loop;
      }
    });

    useCleanup(() => {
      document.body.removeChild(audio);
    });
  })());

  // register components ui
  useComponentUi(({
    contentPath,
    setContentPath,
  }) => {
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(() => app.getComponent('volume') ?? 1);
    const [loop, setLoop] = useState(() => !!app.getComponent('loop'));

    // listen for components
    useEffect(() => {
      const oldVolume = app.getComponent('volume');
      if (volume !== oldVolume) {
        app.setComponent('volume', volume);
      }
    }, [
      volume,
    ]);
    useEffect(() => {
      const oldLoop = app.getComponent('loop');
      if (loop !== oldLoop) {
        app.setComponent('loop', loop);
      }
    }, [
      loop,
    ]);

    // listen for audio play state change
    useEffect(() => {
      (async () => {
        const audio = await waitForCanPlayThrough();
        const _update = () => {
          setPlaying(!audio.paused);
        };
        audio.addEventListener('play', _update);
        audio.addEventListener('pause', _update);
      })();
    }, []);

    //

    return div([
      div([
        label([
          span('Play'),
          div([
            button({
              onClick: async () => {
                const audio = await waitForCanPlayThrough();
                if (!playing) {
                  audio.play();
                } else {
                  audio.pause();
                }
              },
            }, [
              !playing ? 'Play' : 'Pause',
            ]),
          ]),
        ]),
      ]),

      div([
        label([
          span('Volume'),
          input({
            type: 'number',
            min: 0,
            max: 1,
            step: 0.01,
            value: volume,
            onChange: e => {
              setVolume(e.target.value);
            },
          }),
        ]),
      ]),

      div([
        label([
          span('Loop'),
          input({
            type: 'checkbox',
            onChange: e => {
              setLoop(e.target.checked);
            },
            checked: loop,
          }),
        ]),
      ]),
    ]);
  });

  return app;
};