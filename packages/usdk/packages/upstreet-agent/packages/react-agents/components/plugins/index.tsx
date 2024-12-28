import { ThreeDGenerationPlugin } from './plugin-3d-generation/src/index.ts';

// XXX finish this
type IPlugin = {};

const pluginWrap = (IPlugin: any) => (props: any) => {
  console.log('render plugin', ThreeDGenerationPlugin);
  return null;
};

export const plugins = {
  plugin3dGeneration: pluginWrap(ThreeDGenerationPlugin),
};