import {
  ArrowLoaderMesh,
} from '../../meshes/arrow-loader/ArrowLoaderMesh.js';
import {
  DropTargetMesh,
} from '../../meshes/drop-target/DropTargetMesh.js';

//

const widgetSpecs = {
  'arrowLoader': () => new ArrowLoaderMesh(),
  'dropTarget': () => new DropTargetMesh(),
};

//

export class WidgetManager extends EventTarget {
  constructor() {
    super();

    this.widgetCache = {};
  }

  getOrCreateWidget(name) {
    let widgets = this.widgetCache[name];
    if (!widgets) {
      widgets = [];
      this.widgetCache[name] = widgets;
    }

    if (widgets.length > 0) {
      return widgets.pop();
    } else {
      const widgetSpec = widgetSpecs[name];
      const widget = widgetSpec();
      return widget;
    }
  }
  releaseWidget(name, widget) {
    let widgets = this.widgetCache[name];
    if (!widgets) {
      widgets = [];
      this.widgetCache[name] = widgets;
    }
    widgets.push(widget);
  }
  update(timestamp, timeDiff) {
    for (const k in this.widgetCache) {
      const widgets = this.widgetCache[k];
      for (let i = 0; i < widgets.length; i++) {
        const widget = widgets[i];
        widget.update(timestamp);
      }
    }
  }
}