import * as THREE from 'three';
import React, {
  useState,
  useEffect,
} from 'react';
import {Text} from 'troika-three-text/src/Text.js';
import reactHelpers from '../react-helpers.js';
import {VqaStream} from '../vqa.js';

//

const {
  Fragment,
  div,
  span,
  label,
  input,
  textarea,
  button,
} = reactHelpers;

//

const planeWidth = 3;
const planeHeight = planeWidth;
const fontSize = 0.1;
const questionRows = 1;
const answerRows = 10;

//

const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
class StreamMesh extends THREE.Mesh {
  constructor() {
    const geometry = planeGeometry;
    const map = new THREE.Texture();
    map.minFilter = THREE.LinearFilter;
    map.magFilter = THREE.LinearFilter;
    const material = new THREE.ShaderMaterial({
      uniforms: {
        map: {
          value: null,
          needsUpdate: false,
        },
        enabled: {
          value: 0,
          needsUpdate: true,
        },
        planeSize: { // plane width, height
          value: new THREE.Vector2(planeWidth, planeHeight),
          needsUpdate: true,
        },
      },
      vertexShader: `\
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        }
      `,
      fragmentShader: `\
        uniform sampler2D map;
        uniform float enabled;
        uniform vec2 planeSize;
        
        varying vec2 vUv;

        void main() {
          if (enabled > 0.) {
            // use CSS-style 'contain' mode to bound the image to the plane's aspect ratio
            vec2 uv = vUv;
            const vec2 imageScale = vec2(1., 1.);

            vec2 planeAspect = planeSize.x > planeSize.y ? vec2(1., planeSize.y / planeSize.x) : vec2(planeSize.x / planeSize.y, 1.);
            vec2 imageAspect = imageScale.x > imageScale.y ? vec2(1., imageScale.y / imageScale.x) : vec2(imageScale.x / imageScale.y, 1.);
            vec2 aspect = planeAspect / imageAspect;

            vec2 offset = vec2(0.5) - vec2(0.5) * aspect;
            uv = uv * aspect + offset;

            // if in range
            if (uv.x >= 0. && uv.x <= 1. && uv.y >= 0. && uv.y <= 1.) {
              gl_FragColor = texture2D(map, uv);
            } else {
              gl_FragColor = vec4(0.);
            }
          } else {
            // black out backface
            // if (gl_FrontFacing == false) {
              gl_FragColor.rgb = vec3(0.);
            // }
            gl_FragColor.a = 1.;
          }

          // discard based on alpha
          // if (gl_FragColor.a < 0.5) {
          //   discard;
          // }
        }
      `,
      side: THREE.DoubleSide,
    });
    super(geometry, material);

    //

    this.stream = null;
    this.video = null;
    this.videoFrameCallback = null;
  }
  getStream() {
    return this.stream;
  }
  setStream(stream) {
    if (this.stream) {
      // close the old MediaStream
      const tracks = this.stream.getTracks();
      for (const track of tracks) {
        track.stop();
      }

      this.video.pause();
      this.video.cancelVideoFrameCallback(this.videoFrameCallback);
      this.video = null;
      this.videoFrameCallback = null;

      // this.material.uniforms.map.value.image = null;
      // this.material.uniforms.map.value.needsUpdate = false;
      this.material.uniforms.map.value.dispose();
      this.material.uniforms.map.value = null;
      this.material.uniforms.map.needsUpdate = true;

      this.material.uniforms.enabled.value = 0;
      this.material.uniforms.enabled.needsUpdate = true;
    }

    this.stream = stream;

    if (stream) {
      this.video = document.createElement('video');
      this.video.srcObject = stream;
      // this.video.src = URL.createObjectURL(stream);
      this.video.autoplay = true;
      // this.video.play();
      // this.video.addEventListener('loadedmetadata', e => {
      //   console.log('loaded metadata', [this.video.width, this.video.height]);
      // });
      this.video.addEventListener('canplaythrough', e => {
        // console.log('can play through', [this.video.width, this.video.height]);

        this.material.uniforms.map.value = new THREE.VideoTexture(this.video);
        this.material.uniforms.map.needsUpdate = true;

        this.material.uniforms.enabled.value = 1;
        this.material.uniforms.enabled.needsUpdate = true;

        const setScale = (w, h) => {
          // console.log('set scale', [w, h]);
          // set the plane scale to make the max dimension 1m, without changing the aspect ratio
          const maxDimension = Math.max(w, h);
          this.scale.set(
            w / maxDimension,
            h / maxDimension,
            1,
          );
          this.updateMatrixWorld();
        };
        setScale(this.video.videoWidth, this.video.videoHeight);
      });
    }

    this.dispatchEvent({
      type: 'streamchange',
      stream,
    });
  }
  destroy() {
    this.material.dispose();
  }
}

class VqaMesh extends THREE.Object3D {
  constructor() {
    super();

    //

    this.topText = new Text();
    this.topText.anchorX = 'center';
    this.topText.anchorY = 'top';
    this.topText.fontSize = fontSize;
    this.topText.color = 0xFFFFFF;
    this.topText.maxWidth = planeWidth;
    this.topText.position.y = (planeHeight / 2) + (questionRows * fontSize) + (answerRows * fontSize);
    this.add(this.topText);
    this.topText.updateMatrixWorld();

    this.bottomText = new Text();
    this.bottomText.anchorX = 'center';
    this.bottomText.anchorY = 'top';
    this.bottomText.fontSize = fontSize;
    this.bottomText.color = 0xFFFFFF;
    this.bottomText.maxWidth = planeWidth;
    this.bottomText.position.y = (planeHeight / 2) + (answerRows * fontSize);
    this.add(this.bottomText);
    this.bottomText.updateMatrixWorld();

    //

    this.vqaStream = null;
  }
  getVqaStream() {
    return this.vqaStream;
  }
  setVqaStream(vqaStream) {
    if (this.vqaStream) {
      this.vqaStream.close();
      this.vqaStream = null;
    }

    this.vqaStream = vqaStream;

    if (this.vqaStream) {
      const updateQuestion = () => {
        this.topText.text = this.vqaStream.question;
        this.topText.sync();
      };
      this.vqaStream.addEventListener('questionchange', e => {
        updateQuestion();
      });
      updateQuestion();

      const updateAnswer = () => {
        this.bottomText.text = this.vqaStream.answer;
        this.bottomText.sync();
      };
      this.vqaStream.addEventListener('answerchange', e => {
        updateAnswer();
      });
      updateAnswer();
    }

    this.dispatchEvent({
      type: 'vqastreamchange',
      vqaStream: this.vqaStream,
    });
  }
  destroy() {
    this.topText.dispose();
    this.bottomText.dispose();
  }
}

//

export default srcUrl => ctx => {
  const {
    useApp,
    // usePhysics,
    // usePhysicsTracker,
    // useFrame,
    useComponentUi,
    useCleanup,
  } = ctx;

  const app = useApp();
  // const physicsScene = usePhysics();
  // const physicsTracker = usePhysicsTracker();

  app.appType = 'stream';
  app.name = srcUrl.match(/([^\/]*)$/)[1];
  app.description = 'A video stream.';

  //

  const streamMesh = new StreamMesh();
  app.add(streamMesh);
  streamMesh.updateMatrixWorld();
  app.streamMesh = streamMesh;

  //

  const vqaMesh = new VqaMesh();
  streamMesh.add(vqaMesh);
  vqaMesh.updateMatrixWorld();
  app.vqaMesh = vqaMesh;

  //

  let modelCleanupFns = [];
  useCleanup(() => {
    for (const fn of modelCleanupFns) {
      fn();
    }
  });

  //

  // register components ui
  useComponentUi(({
    contentPath,
    setContentPath,
  }) => {
    const [stream, setStream] = useState(() => app.streamMesh.getStream());
    const [vqaStream, setVqaStream] = useState(() => app.vqaMesh.getVqaStream());
    const [vqaQuestion, setVqaQuestion] = useState(() => app.vqaMesh.getVqaStream()?.question ?? '');
    const [vqaAnswer, setVqaAnswer] = useState(() => app.vqaMesh.getVqaStream()?.answer ?? '');
    const [vqaText, setVqaText] = useState(() => app.vqaMesh.getVqaStream()?.text ?? '');
    const [vqaEnabled, setVqaEnabled] = useState(false);
    const [ocrEnabled, setOcrEnabled] = useState(false);

    //

    useEffect(() => {
      const streamchange = e => {
        setStream(e.stream);
      };
      app.streamMesh.addEventListener('streamchange', streamchange);
      
      return () => {
        app.streamMesh.removeEventListener('streamchange', streamchange);  
      };
    }, []);

    //

    useEffect(() => {
      const vqastreamchange = e => {
        setVqaStream(e.vqaStream);
      };
      app.vqaMesh.addEventListener('vqastreamchange', vqastreamchange);
      
      return () => {
        app.vqaMesh.removeEventListener('vqastreamchange', vqastreamchange); 
      };
    }, []);

    useEffect(() => {
      if (vqaStream) {
        const enabledchange = e => {
          console.log('enabled change', e.data);
          if (e.data.key === 'vqa') {
            setVqaEnabled(e.data.value);
          } else if (e.data.key === 'ocr') {
            setOcrEnabled(e.data.value);
          }
        };
        vqaStream.addEventListener('enabledchange', enabledchange);
        setVqaEnabled(vqaStream.getEnabled('vqa'));
        setOcrEnabled(vqaStream.getEnabled('ocr'));
        
        return () => {
          vqaStream.removeEventListener('enabledchange', enabledchange); 
        };
      }
    }, [
      vqaStream,
    ]);
    useEffect(() => {
      if (vqaStream) {
        const questionchange = e => {
          setVqaQuestion(e.data.question);
        };
        vqaStream.addEventListener('questionchange', questionchange);
        setVqaQuestion(vqaStream.question);
        
        return () => {
          vqaStream.removeEventListener('questionchange', questionchange); 
        };
      } else {
        setVqaQuestion('');
      }
    }, [
      vqaStream,
    ]);
    useEffect(() => {
      if (vqaStream) {
        const textchange = e => {
          setVqaText(e.data.text);
        };
        vqaStream.addEventListener('textchange', textchange);
        setVqaText(vqaStream.text);
        
        return () => {
          vqaStream.removeEventListener('textchange', textchange); 
        };
      } else {
        setVqaText('');
      }
    }, [
      vqaStream,
    ]);
    useEffect(() => {
      if (vqaStream) {
        const answerchange = e => {
          setVqaAnswer(e.data.answer);
        };
        vqaStream.addEventListener('answerchange', answerchange);
        setVqaAnswer(vqaStream.answer);
        
        return () => {
          vqaStream.removeEventListener('answerchange', answerchange); 
        };
      } else {
        setVqaAnswer('');
      }
    }, [
      vqaStream,
    ]);

    //

    return div([
      div([
        !stream ? Fragment([
          label([
            span('Stream'),
            div([
              button({
                onClick: async () => {
                  const controller = new CaptureController();
                  controller.setFocusBehavior('no-focus-change');
                  const mediaStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    controller,
                  });
                  app.streamMesh.setStream(mediaStream);
                },
              }, [
                'Display',
              ]),
              button({
                onClick: async () => {
                  const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                  });
                  app.streamMesh.setStream(mediaStream);
                },
              }, [
                'Camera',
              ]),
            ]),
          ])
        ]) : label([
          span('Stream'),
          div([
            button({
              onClick: async () => {
                app.streamMesh.setStream(null);
              },
            }, [
              'Stop',
            ]),
          ]),
        ]),

        label([
          span('Analysis'),
          div([
            button({
              onClick: () => {
                const {stream, video} = app.streamMesh;
                if (video) {
                  const vqaStream = new VqaStream({
                    // question: 'In one paragraph, what is on the screen?',
                    // question: 'In one paragraph, describe what is on the screen.',
                    // question: `What is the title of this web page?`,
                    video,
                    // enable: {
                    //   vqa: true,
                    //   ocr: true,
                    // },
                  });
                  vqaStream.setEnabled('vqa', vqaEnabled);
                  vqaStream.setEnabled('ocr', ocrEnabled);
                  app.vqaMesh.setVqaStream(vqaStream);

                  // wait for video track to end
                  const videoTrack = stream.getVideoTracks()[0];
                  videoTrack.addEventListener('ended', e => {
                    app.vqaMesh.setVqaStream(null);
                  }, {once: true});
                } else {
                  app.vqaMesh.setVqaStream(null);
                }
              },
              disabled: !stream,
            }, [
              !vqaStream ? 'Enable' : 'Disable',
            ]),
          ]),
        ]),
        div([
          label([
            span('VQA'),
            input({
              type: 'checkbox',
              onChange: e => {
                const vqaStream = app.vqaMesh.getVqaStream();
                console.log('set vqa enabled', vqaStream);
                if (vqaStream) {
                  vqaStream.setEnabled('vqa', e.target.value);
                }
              },
              checked: vqaEnabled,
            }),
          ]),
        ]),
        div([
          label([
            span('OCR'),
            input({
              type: 'checkbox',
              onChange: e => {
                const vqaStream = app.vqaMesh.getVqaStream();
                console.log('set ocr enabled', vqaStream);
                if (vqaStream) {
                  vqaStream.setEnabled('ocr', e.target.value);
                }
              },
              checked: ocrEnabled,
            }),
          ]),
        ]),
        label([
          span('Question'),
          div([
            input({
              type: 'text',
              value: vqaQuestion,
              onChange: (e) => {
                const vqaStream = app.vqaMesh.getVqaStream();
                vqaStream.setQuestion(e.target.value);
              },
              disabled: !vqaStream,
            }),
          ]),
        ]),
        label([
          span('Answer'),
          div([
            textarea({
              type: 'text',
              value: vqaAnswer,
              onChange: (e) => {
                setVqaAnswer(e.target.value);
              },
              disabled: true,
            }),
          ]),
        ]),
        label([
          span('Text'),
          div([
            textarea({
              type: 'text',
              value: vqaText,
              onChange: (e) => {
                setVqaText(e.target.value);
              },
              disabled: true,
            }),
          ]),
        ]),
      ]),
    ]);
  });

  //

  return app;
};