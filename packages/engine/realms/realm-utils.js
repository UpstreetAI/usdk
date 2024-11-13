// import {
//   AppManager,
// } from '../app-manager.js';
// import {
//   SceneContextManager,
// } from '../scene-context-manager.js';
// import {makeId, parseQuery} from '../util.js';
import {scenesBaseUrl, defaultSceneName} from '../endpoints.js';

//

/* export const getSceneJson = async (o) => {
  const {
    start_url,
    type,
    content,
  } = o;
  if (typeof start_url === 'string') { // src load
    const res = await fetch(start_url);
    const json = await res.json();
    return json;
  } else if (start_url === '') { // blank load
    return null;
  } else if (type === 'application/scn' && typeof content === 'object') {
    return content;
  } else { // default load
    const start_url = SceneContextManager.getSceneUrl(defaultSceneName);
    const res = await fetch(start_url);
    const json = await res.json();
    return json;
  }
}; */

/* export const loadScene = async ({
  engine,
  src,
}) => {
  const appSpec = getAppSpec(src);
  if (appSpec !== null) {
    const app = await engine.createAppAsync(appSpec);
  }
} */