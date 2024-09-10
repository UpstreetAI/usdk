
var __commonJS = obj => {
  let required = false;
  let result;
  return function __require() {
    if (!required) {
      required = true;
      let fn;
      for (const name in obj) { fn = obj[name]; break; }
      const module = { exports: {} };
      fn(module.exports, module);
      result = module.exports;
    }
    return result;
  }
};
var __export = (target, all) => {for (var name in all) target[name] = all[name];};
var __toESM = mod => ({ ...mod, 'default': mod });
var __toCommonJS = mod => ({ ...mod, __esModule: true });


// packages/playwright-core/src/server/injected/recorder/recorder.ts
var recorder_exports = {};
__export(recorder_exports, {
  PollingRecorder: () => PollingRecorder,
  Recorder: () => Recorder,
  default: () => recorder_default
});
module.exports = __toCommonJS(recorder_exports);

// packages/playwright-core/src/server/injected/recorder/clipPaths.ts
var svgJson = { "tagName": "svg", "children": [{ "tagName": "defs", "children": [{ "tagName": "clipPath", "attrs": { "width": "16", "height": "16", "viewBox": "0 0 16 16", "fill": "currentColor", "id": "icon-gripper" }, "children": [{ "tagName": "path", "attrs": { "d": "M5 3h2v2H5zm0 4h2v2H5zm0 4h2v2H5zm4-8h2v2H9zm0 4h2v2H9zm0 4h2v2H9z" } }] }, { "tagName": "clipPath", "attrs": { "width": "16", "height": "16", "viewBox": "0 0 16 16", "fill": "currentColor", "id": "icon-circle-large-filled" }, "children": [{ "tagName": "path", "attrs": { "d": "M8 1a6.8 6.8 0 0 1 1.86.253 6.899 6.899 0 0 1 3.083 1.805 6.903 6.903 0 0 1 1.804 3.083C14.916 6.738 15 7.357 15 8s-.084 1.262-.253 1.86a6.9 6.9 0 0 1-.704 1.674 7.157 7.157 0 0 1-2.516 2.509 6.966 6.966 0 0 1-1.668.71A6.984 6.984 0 0 1 8 15a6.984 6.984 0 0 1-1.86-.246 7.098 7.098 0 0 1-1.674-.711 7.3 7.3 0 0 1-1.415-1.094 7.295 7.295 0 0 1-1.094-1.415 7.098 7.098 0 0 1-.71-1.675A6.985 6.985 0 0 1 1 8c0-.643.082-1.262.246-1.86a6.968 6.968 0 0 1 .711-1.667 7.156 7.156 0 0 1 2.509-2.516 6.895 6.895 0 0 1 1.675-.704A6.808 6.808 0 0 1 8 1z" } }] }, { "tagName": "clipPath", "attrs": { "width": "16", "height": "16", "viewBox": "0 0 16 16", "fill": "currentColor", "id": "icon-inspect" }, "children": [{ "tagName": "path", "attrs": { "fill-rule": "evenodd", "clip-rule": "evenodd", "d": "M1 3l1-1h12l1 1v6h-1V3H2v8h5v1H2l-1-1V3zm14.707 9.707L9 6v9.414l2.707-2.707h4zM10 13V8.414l3.293 3.293h-2L10 13z" } }] }, { "tagName": "clipPath", "attrs": { "width": "16", "height": "16", "viewBox": "0 0 16 16", "fill": "currentColor", "id": "icon-whole-word" }, "children": [{ "tagName": "path", "attrs": { "fill-rule": "evenodd", "clip-rule": "evenodd", "d": "M0 11H1V13H15V11H16V14H15H1H0V11Z" } }, { "tagName": "path", "attrs": { "d": "M6.84048 11H5.95963V10.1406H5.93814C5.555 10.7995 4.99104 11.1289 4.24625 11.1289C3.69839 11.1289 3.26871 10.9839 2.95718 10.6938C2.64924 10.4038 2.49527 10.0189 2.49527 9.53906C2.49527 8.51139 3.10041 7.91341 4.3107 7.74512L5.95963 7.51416C5.95963 6.57959 5.58186 6.1123 4.82632 6.1123C4.16389 6.1123 3.56591 6.33789 3.03238 6.78906V5.88672C3.57307 5.54297 4.19612 5.37109 4.90152 5.37109C6.19416 5.37109 6.84048 6.05501 6.84048 7.42285V11ZM5.95963 8.21777L4.63297 8.40039C4.22476 8.45768 3.91682 8.55973 3.70914 8.70654C3.50145 8.84977 3.39761 9.10579 3.39761 9.47461C3.39761 9.74316 3.4925 9.96338 3.68228 10.1353C3.87564 10.3035 4.13166 10.3877 4.45035 10.3877C4.8872 10.3877 5.24706 10.2355 5.52994 9.93115C5.8164 9.62321 5.95963 9.2347 5.95963 8.76562V8.21777Z" } }, { "tagName": "path", "attrs": { "d": "M9.3475 10.2051H9.32601V11H8.44515V2.85742H9.32601V6.4668H9.3475C9.78076 5.73633 10.4146 5.37109 11.2489 5.37109C11.9543 5.37109 12.5057 5.61816 12.9032 6.1123C13.3042 6.60286 13.5047 7.26172 13.5047 8.08887C13.5047 9.00911 13.2809 9.74674 12.8333 10.3018C12.3857 10.8532 11.7734 11.1289 10.9964 11.1289C10.2695 11.1289 9.71989 10.821 9.3475 10.2051ZM9.32601 7.98682V8.75488C9.32601 9.20964 9.47282 9.59635 9.76644 9.91504C10.0636 10.2301 10.4396 10.3877 10.8944 10.3877C11.4279 10.3877 11.8451 10.1836 12.1458 9.77539C12.4502 9.36719 12.6024 8.79964 12.6024 8.07275C12.6024 7.46045 12.4609 6.98063 12.1781 6.6333C11.8952 6.28597 11.512 6.1123 11.0286 6.1123C10.5166 6.1123 10.1048 6.29134 9.7933 6.64941C9.48177 7.00391 9.32601 7.44971 9.32601 7.98682Z" } }] }, { "tagName": "clipPath", "attrs": { "width": "16", "height": "16", "viewBox": "0 0 16 16", "fill": "currentColor", "id": "icon-eye" }, "children": [{ "tagName": "path", "attrs": { "d": "M7.99993 6.00316C9.47266 6.00316 10.6666 7.19708 10.6666 8.66981C10.6666 10.1426 9.47266 11.3365 7.99993 11.3365C6.52715 11.3365 5.33324 10.1426 5.33324 8.66981C5.33324 7.19708 6.52715 6.00316 7.99993 6.00316ZM7.99993 7.00315C7.07946 7.00315 6.33324 7.74935 6.33324 8.66981C6.33324 9.59028 7.07946 10.3365 7.99993 10.3365C8.9204 10.3365 9.6666 9.59028 9.6666 8.66981C9.6666 7.74935 8.9204 7.00315 7.99993 7.00315ZM7.99993 3.66675C11.0756 3.66675 13.7307 5.76675 14.4673 8.70968C14.5344 8.97755 14.3716 9.24908 14.1037 9.31615C13.8358 9.38315 13.5643 9.22041 13.4973 8.95248C12.8713 6.45205 10.6141 4.66675 7.99993 4.66675C5.38454 4.66675 3.12664 6.45359 2.50182 8.95555C2.43491 9.22341 2.16348 9.38635 1.89557 9.31948C1.62766 9.25255 1.46471 8.98115 1.53162 8.71321C2.26701 5.76856 4.9229 3.66675 7.99993 3.66675Z" } }] }, { "tagName": "clipPath", "attrs": { "width": "16", "height": "16", "viewBox": "0 0 16 16", "fill": "currentColor", "id": "icon-symbol-constant" }, "children": [{ "tagName": "path", "attrs": { "fill-rule": "evenodd", "clip-rule": "evenodd", "d": "M4 6h8v1H4V6zm8 3H4v1h8V9z" } }, { "tagName": "path", "attrs": { "fill-rule": "evenodd", "clip-rule": "evenodd", "d": "M1 4l1-1h12l1 1v8l-1 1H2l-1-1V4zm1 0v8h12V4H2z" } }] }, { "tagName": "clipPath", "attrs": { "width": "16", "height": "16", "viewBox": "0 0 16 16", "fill": "currentColor", "id": "icon-check" }, "children": [{ "tagName": "path", "attrs": { "fill-rule": "evenodd", "clip-rule": "evenodd", "d": "M14.431 3.323l-8.47 10-.79-.036-3.35-4.77.818-.574 2.978 4.24 8.051-9.506.764.646z" } }] }, { "tagName": "clipPath", "attrs": { "width": "16", "height": "16", "viewBox": "0 0 16 16", "fill": "currentColor", "id": "icon-close" }, "children": [{ "tagName": "path", "attrs": { "fill-rule": "evenodd", "clip-rule": "evenodd", "d": "M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z" } }] }, { "tagName": "clipPath", "attrs": { "width": "16", "height": "16", "viewBox": "0 0 16 16", "fill": "currentColor", "id": "icon-pass" }, "children": [{ "tagName": "path", "attrs": { "d": "M6.27 10.87h.71l4.56-4.56-.71-.71-4.2 4.21-1.92-1.92L4 8.6l2.27 2.27z" } }, { "tagName": "path", "attrs": { "fill-rule": "evenodd", "clip-rule": "evenodd", "d": "M8.6 1c1.6.1 3.1.9 4.2 2 1.3 1.4 2 3.1 2 5.1 0 1.6-.6 3.1-1.6 4.4-1 1.2-2.4 2.1-4 2.4-1.6.3-3.2.1-4.6-.7-1.4-.8-2.5-2-3.1-3.5C.9 9.2.8 7.5 1.3 6c.5-1.6 1.4-2.9 2.8-3.8C5.4 1.3 7 .9 8.6 1zm.5 12.9c1.3-.3 2.5-1 3.4-2.1.8-1.1 1.3-2.4 1.2-3.8 0-1.6-.6-3.2-1.7-4.3-1-1-2.2-1.6-3.6-1.7-1.3-.1-2.7.2-3.8 1-1.1.8-1.9 1.9-2.3 3.3-.4 1.3-.4 2.7.2 4 .6 1.3 1.5 2.3 2.7 3 1.2.7 2.6.9 3.9.6z" } }] }] }] };
var clipPaths_default = svgJson;

// packages/playwright-core/src/server/injected/recorder/recorder.ts
var NoneTool = class {
  cursor() {
    return "default";
  }
};
var InspectTool = class {
  constructor(recorder, assertVisibility) {
    this._hoveredModel = null;
    this._hoveredElement = null;
    this._hoveredSelectors = null;
    this._recorder = recorder;
    this._assertVisibility = assertVisibility;
  }
  cursor() {
    return "pointer";
  }
  cleanup() {
    this._hoveredModel = null;
    this._hoveredElement = null;
    this._hoveredSelectors = null;
  }
  onClick(event) {
    var _a;
    consumeEvent(event);
    if (event.button !== 0)
      return;
    if ((_a = this._hoveredModel) == null ? void 0 : _a.selector)
      this._commit(this._hoveredModel.selector);
  }
  onContextMenu(event) {
    if (this._hoveredModel && !this._hoveredModel.tooltipListItemSelected && this._hoveredSelectors && this._hoveredSelectors.length > 1) {
      consumeEvent(event);
      const selectors = this._hoveredSelectors;
      this._hoveredModel.tooltipFooter = void 0;
      this._hoveredModel.tooltipList = selectors.map((selector) => this._recorder.injectedScript.utils.asLocator(this._recorder.state.language, selector));
      this._hoveredModel.tooltipListItemSelected = (index) => {
        if (index === void 0)
          this._reset(true);
        else
          this._commit(selectors[index]);
      };
      this._recorder.updateHighlight(this._hoveredModel, true);
    }
  }
  onPointerDown(event) {
    consumeEvent(event);
  }
  onPointerUp(event) {
    consumeEvent(event);
  }
  onMouseDown(event) {
    consumeEvent(event);
  }
  onMouseUp(event) {
    consumeEvent(event);
  }
  onMouseMove(event) {
    var _a;
    consumeEvent(event);
    let target = this._recorder.deepEventTarget(event);
    if (!target.isConnected)
      target = null;
    if (this._hoveredElement === target)
      return;
    this._hoveredElement = target;
    let model = null;
    let selectors = [];
    if (this._hoveredElement) {
      const generated = this._recorder.injectedScript.generateSelector(this._hoveredElement, { testIdAttributeName: this._recorder.state.testIdAttributeName, multiple: false });
      selectors = generated.selectors;
      model = {
        selector: generated.selector,
        elements: generated.elements,
        tooltipText: this._recorder.injectedScript.utils.asLocator(this._recorder.state.language, generated.selector),
        tooltipFooter: selectors.length > 1 ? `Click to select, right-click for more options` : void 0,
        color: this._assertVisibility ? "#8acae480" : void 0
      };
    }
    if (((_a = this._hoveredModel) == null ? void 0 : _a.selector) === (model == null ? void 0 : model.selector))
      return;
    this._hoveredModel = model;
    this._hoveredSelectors = selectors;
    this._recorder.updateHighlight(model, true);
  }
  onMouseEnter(event) {
    consumeEvent(event);
  }
  onMouseLeave(event) {
    consumeEvent(event);
    const window = this._recorder.injectedScript.window;
    if (window.top !== window && this._recorder.deepEventTarget(event).nodeType === Node.DOCUMENT_NODE)
      this._reset(true);
  }
  onKeyDown(event) {
    var _a;
    consumeEvent(event);
    if (event.key === "Escape") {
      if ((_a = this._hoveredModel) == null ? void 0 : _a.tooltipListItemSelected)
        this._reset(true);
      else if (this._assertVisibility)
        this._recorder.setMode("recording");
    }
  }
  onKeyUp(event) {
    consumeEvent(event);
  }
  onScroll(event) {
    this._reset(false);
  }
  _commit(selector) {
    var _a;
    if (this._assertVisibility) {
      this._recorder.recordAction({
        name: "assertVisible",
        selector,
        signals: []
      });
      this._recorder.setMode("recording");
      (_a = this._recorder.overlay) == null ? void 0 : _a.flashToolSucceeded("assertingVisibility");
    } else {
      this._recorder.setSelector(selector);
    }
  }
  _reset(userGesture) {
    this._hoveredElement = null;
    this._hoveredModel = null;
    this._hoveredSelectors = null;
    this._recorder.updateHighlight(null, userGesture);
  }
};
var RecordActionTool = class {
  constructor(recorder) {
    this._performingAction = false;
    this._hoveredModel = null;
    this._hoveredElement = null;
    this._activeModel = null;
    this._expectProgrammaticKeyUp = false;
    this._recorder = recorder;
  }
  cursor() {
    return "pointer";
  }
  cleanup() {
    this._hoveredModel = null;
    this._hoveredElement = null;
    this._activeModel = null;
    this._expectProgrammaticKeyUp = false;
  }
  onClick(event) {
    if (isRangeInput(this._hoveredElement))
      return;
    if (event.button === 2 && event.type === "auxclick")
      return;
    if (this._shouldIgnoreMouseEvent(event))
      return;
    if (this._actionInProgress(event))
      return;
    if (this._consumedDueToNoModel(event, this._hoveredModel))
      return;
    const checkbox = asCheckbox(this._recorder.deepEventTarget(event));
    if (checkbox) {
      this._performAction({
        name: checkbox.checked ? "check" : "uncheck",
        selector: this._hoveredModel.selector,
        signals: []
      });
      return;
    }
    this._performAction({
      name: "click",
      selector: this._hoveredModel.selector,
      position: positionForEvent(event),
      signals: [],
      button: buttonForEvent(event),
      modifiers: modifiersForEvent(event),
      clickCount: event.detail
    });
  }
  onContextMenu(event) {
    if (this._shouldIgnoreMouseEvent(event))
      return;
    if (this._actionInProgress(event))
      return;
    if (this._consumedDueToNoModel(event, this._hoveredModel))
      return;
    this._performAction({
      name: "click",
      selector: this._hoveredModel.selector,
      position: positionForEvent(event),
      signals: [],
      button: "right",
      modifiers: 0,
      clickCount: 0
    });
  }
  onPointerDown(event) {
    if (this._shouldIgnoreMouseEvent(event))
      return;
    if (!this._performingAction)
      consumeEvent(event);
  }
  onPointerUp(event) {
    if (this._shouldIgnoreMouseEvent(event))
      return;
    if (!this._performingAction)
      consumeEvent(event);
  }
  onMouseDown(event) {
    if (this._shouldIgnoreMouseEvent(event))
      return;
    if (!this._performingAction)
      consumeEvent(event);
    this._activeModel = this._hoveredModel;
  }
  onMouseUp(event) {
    if (this._shouldIgnoreMouseEvent(event))
      return;
    if (!this._performingAction)
      consumeEvent(event);
  }
  onMouseMove(event) {
    const target = this._recorder.deepEventTarget(event);
    if (this._hoveredElement === target)
      return;
    this._hoveredElement = target;
    this._updateModelForHoveredElement();
  }
  onMouseLeave(event) {
    const window = this._recorder.injectedScript.window;
    if (window.top !== window && this._recorder.deepEventTarget(event).nodeType === Node.DOCUMENT_NODE) {
      this._hoveredElement = null;
      this._updateModelForHoveredElement();
    }
  }
  onFocus(event) {
    this._onFocus(true);
  }
  onInput(event) {
    const target = this._recorder.deepEventTarget(event);
    if (target.nodeName === "INPUT" && target.type.toLowerCase() === "file") {
      this._recorder.recordAction({
        name: "setInputFiles",
        selector: this._activeModel.selector,
        signals: [],
        files: [...target.files || []].map((file) => file.name)
      });
      return;
    }
    if (isRangeInput(target)) {
      this._recorder.recordAction({
        name: "fill",
        // must use hoveredModel instead of activeModel for it to work in webkit
        selector: this._hoveredModel.selector,
        signals: [],
        text: target.value
      });
      return;
    }
    if (["INPUT", "TEXTAREA"].includes(target.nodeName) || target.isContentEditable) {
      if (target.nodeName === "INPUT" && ["checkbox", "radio"].includes(target.type.toLowerCase())) {
        return;
      }
      if (this._consumedDueWrongTarget(event))
        return;
      this._recorder.recordAction({
        name: "fill",
        selector: this._activeModel.selector,
        signals: [],
        text: target.isContentEditable ? target.innerText : target.value
      });
    }
    if (target.nodeName === "SELECT") {
      const selectElement = target;
      if (this._actionInProgress(event))
        return;
      this._performAction({
        name: "select",
        selector: this._activeModel.selector,
        options: [...selectElement.selectedOptions].map((option) => option.value),
        signals: []
      });
    }
  }
  onKeyDown(event) {
    if (!this._shouldGenerateKeyPressFor(event))
      return;
    if (this._actionInProgress(event)) {
      this._expectProgrammaticKeyUp = true;
      return;
    }
    if (this._consumedDueWrongTarget(event))
      return;
    if (event.key === " ") {
      const checkbox = asCheckbox(this._recorder.deepEventTarget(event));
      if (checkbox) {
        this._performAction({
          name: checkbox.checked ? "uncheck" : "check",
          selector: this._activeModel.selector,
          signals: []
        });
        return;
      }
    }
    this._performAction({
      name: "press",
      selector: this._activeModel.selector,
      signals: [],
      key: event.key,
      modifiers: modifiersForEvent(event)
    });
  }
  onKeyUp(event) {
    if (!this._shouldGenerateKeyPressFor(event))
      return;
    if (!this._expectProgrammaticKeyUp) {
      consumeEvent(event);
      return;
    }
    this._expectProgrammaticKeyUp = false;
  }
  onScroll(event) {
    this._hoveredModel = null;
    this._hoveredElement = null;
    this._recorder.updateHighlight(null, false);
  }
  _onFocus(userGesture) {
    const activeElement = deepActiveElement(this._recorder.document);
    if (userGesture && activeElement === this._recorder.document.body)
      return;
    const result = activeElement ? this._recorder.injectedScript.generateSelector(activeElement, { testIdAttributeName: this._recorder.state.testIdAttributeName }) : null;
    this._activeModel = result && result.selector ? result : null;
    if (userGesture)
      this._hoveredElement = activeElement;
    this._updateModelForHoveredElement();
  }
  _shouldIgnoreMouseEvent(event) {
    const target = this._recorder.deepEventTarget(event);
    const nodeName = target.nodeName;
    if (nodeName === "SELECT" || nodeName === "OPTION")
      return true;
    if (nodeName === "INPUT" && ["date", "range"].includes(target.type))
      return true;
    return false;
  }
  _actionInProgress(event) {
    if (this._performingAction)
      return true;
    consumeEvent(event);
    return false;
  }
  _consumedDueToNoModel(event, model) {
    if (model)
      return false;
    consumeEvent(event);
    return true;
  }
  _consumedDueWrongTarget(event) {
    if (this._activeModel && this._activeModel.elements[0] === this._recorder.deepEventTarget(event))
      return false;
    consumeEvent(event);
    return true;
  }
  _performAction(action) {
    this._hoveredElement = null;
    this._hoveredModel = null;
    this._activeModel = null;
    this._recorder.updateHighlight(null, false);
    this._performingAction = true;
    void this._recorder.performAction(action).then(() => {
      this._performingAction = false;
      this._onFocus(false);
      if (this._recorder.injectedScript.isUnderTest) {
        console.error("Action performed for test: " + JSON.stringify({
          // eslint-disable-line no-console
          hovered: this._hoveredModel ? this._hoveredModel.selector : null,
          active: this._activeModel ? this._activeModel.selector : null
        }));
      }
    });
  }
  _shouldGenerateKeyPressFor(event) {
    if (event.key === "Enter" && (this._recorder.deepEventTarget(event).nodeName === "TEXTAREA" || this._recorder.deepEventTarget(event).isContentEditable))
      return false;
    if (["Backspace", "Delete", "AltGraph"].includes(event.key))
      return false;
    if (event.key === "@" && event.code === "KeyL")
      return false;
    if (navigator.platform.includes("Mac")) {
      if (event.key === "v" && event.metaKey)
        return false;
    } else {
      if (event.key === "v" && event.ctrlKey)
        return false;
      if (event.key === "Insert" && event.shiftKey)
        return false;
    }
    if (["Shift", "Control", "Meta", "Alt", "Process"].includes(event.key))
      return false;
    const hasModifier = event.ctrlKey || event.altKey || event.metaKey;
    if (event.key.length === 1 && !hasModifier)
      return !!asCheckbox(this._recorder.deepEventTarget(event));
    return true;
  }
  _updateModelForHoveredElement() {
    if (!this._hoveredElement || !this._hoveredElement.isConnected) {
      this._hoveredModel = null;
      this._hoveredElement = null;
      this._recorder.updateHighlight(null, true);
      return;
    }
    const { selector, elements } = this._recorder.injectedScript.generateSelector(this._hoveredElement, { testIdAttributeName: this._recorder.state.testIdAttributeName });
    if (this._hoveredModel && this._hoveredModel.selector === selector)
      return;
    this._hoveredModel = selector ? { selector, elements, color: "#dc6f6f7f" } : null;
    this._recorder.updateHighlight(this._hoveredModel, true);
  }
};
var TextAssertionTool = class {
  constructor(recorder, kind) {
    this._hoverHighlight = null;
    this._action = null;
    this._textCache = /* @__PURE__ */ new Map();
    this._recorder = recorder;
    this._kind = kind;
    this._dialog = new Dialog(recorder);
  }
  cursor() {
    return "pointer";
  }
  cleanup() {
    this._dialog.close();
    this._hoverHighlight = null;
  }
  onClick(event) {
    consumeEvent(event);
    if (this._kind === "value") {
      this._commitAssertValue();
    } else {
      if (!this._dialog.isShowing())
        this._showDialog();
    }
  }
  onMouseDown(event) {
    const target = this._recorder.deepEventTarget(event);
    if (this._elementHasValue(target))
      event.preventDefault();
  }
  onPointerUp(event) {
    var _a;
    const target = (_a = this._hoverHighlight) == null ? void 0 : _a.elements[0];
    if (this._kind === "value" && target && (target.nodeName === "INPUT" || target.nodeName === "SELECT") && target.disabled) {
      this._commitAssertValue();
    }
  }
  onMouseMove(event) {
    var _a;
    if (this._dialog.isShowing())
      return;
    const target = this._recorder.deepEventTarget(event);
    if (((_a = this._hoverHighlight) == null ? void 0 : _a.elements[0]) === target)
      return;
    if (this._kind === "text")
      this._hoverHighlight = this._recorder.injectedScript.utils.elementText(this._textCache, target).full ? { elements: [target], selector: "" } : null;
    else
      this._hoverHighlight = this._elementHasValue(target) ? this._recorder.injectedScript.generateSelector(target, { testIdAttributeName: this._recorder.state.testIdAttributeName }) : null;
    if (this._hoverHighlight)
      this._hoverHighlight.color = "#8acae480";
    this._recorder.updateHighlight(this._hoverHighlight, true);
  }
  onKeyDown(event) {
    if (event.key === "Escape")
      this._recorder.setMode("recording");
    consumeEvent(event);
  }
  onScroll(event) {
    this._recorder.updateHighlight(this._hoverHighlight, false);
  }
  _elementHasValue(element) {
    return element.nodeName === "TEXTAREA" || element.nodeName === "SELECT" || element.nodeName === "INPUT" && !["button", "image", "reset", "submit"].includes(element.type);
  }
  _generateAction() {
    var _a;
    this._textCache.clear();
    const target = (_a = this._hoverHighlight) == null ? void 0 : _a.elements[0];
    if (!target)
      return null;
    if (this._kind === "value") {
      if (!this._elementHasValue(target))
        return null;
      const { selector } = this._recorder.injectedScript.generateSelector(target, { testIdAttributeName: this._recorder.state.testIdAttributeName });
      if (target.nodeName === "INPUT" && ["checkbox", "radio"].includes(target.type.toLowerCase())) {
        return {
          name: "assertChecked",
          selector,
          signals: [],
          // Interestingly, inputElement.checked is reversed inside this event handler.
          checked: !target.checked
        };
      } else {
        return {
          name: "assertValue",
          selector,
          signals: [],
          value: target.value
        };
      }
    } else {
      this._hoverHighlight = this._recorder.injectedScript.generateSelector(target, { testIdAttributeName: this._recorder.state.testIdAttributeName, forTextExpect: true });
      this._hoverHighlight.color = "#8acae480";
      this._recorder.updateHighlight(this._hoverHighlight, true);
      return {
        name: "assertText",
        selector: this._hoverHighlight.selector,
        signals: [],
        text: this._recorder.injectedScript.utils.elementText(this._textCache, target).normalized,
        substring: true
      };
    }
  }
  _renderValue(action) {
    if ((action == null ? void 0 : action.name) === "assertText")
      return this._recorder.injectedScript.utils.normalizeWhiteSpace(action.text);
    if ((action == null ? void 0 : action.name) === "assertChecked")
      return String(action.checked);
    if ((action == null ? void 0 : action.name) === "assertValue")
      return action.value;
    return "";
  }
  _commit() {
    if (!this._action || !this._dialog.isShowing())
      return;
    this._dialog.close();
    this._recorder.recordAction(this._action);
    this._recorder.setMode("recording");
  }
  _showDialog() {
    var _a;
    if (!((_a = this._hoverHighlight) == null ? void 0 : _a.elements[0]))
      return;
    this._action = this._generateAction();
    if (!this._action || this._action.name !== "assertText")
      return;
    const action = this._action;
    const textElement = this._recorder.document.createElement("textarea");
    textElement.setAttribute("spellcheck", "false");
    textElement.value = this._renderValue(this._action);
    textElement.classList.add("text-editor");
    const updateAndValidate = () => {
      var _a2;
      const newValue = this._recorder.injectedScript.utils.normalizeWhiteSpace(textElement.value);
      const target = (_a2 = this._hoverHighlight) == null ? void 0 : _a2.elements[0];
      if (!target)
        return;
      action.text = newValue;
      const targetText = this._recorder.injectedScript.utils.elementText(this._textCache, target).normalized;
      const matches = newValue && targetText.includes(newValue);
      textElement.classList.toggle("does-not-match", !matches);
    };
    textElement.addEventListener("input", updateAndValidate);
    const label = "Assert that element contains text";
    const dialogElement = this._dialog.show({
      label,
      body: textElement,
      onCommit: () => this._commit()
    });
    const position = this._recorder.highlight.tooltipPosition(this._recorder.highlight.firstBox(), dialogElement);
    this._dialog.moveTo(position.anchorTop, position.anchorLeft);
    textElement.focus();
  }
  _commitAssertValue() {
    var _a;
    if (this._kind !== "value")
      return;
    const action = this._generateAction();
    if (!action)
      return;
    this._recorder.recordAction(action);
    this._recorder.setMode("recording");
    (_a = this._recorder.overlay) == null ? void 0 : _a.flashToolSucceeded("assertingValue");
  }
};
var Overlay = class {
  constructor(recorder) {
    this._listeners = [];
    this._offsetX = 0;
    this._measure = { width: 0, height: 0 };
    this._recorder = recorder;
    const document = this._recorder.document;
    this._overlayElement = document.createElement("x-pw-overlay");
    this._overlayElement.appendChild(createSvgElement(this._recorder.document, clipPaths_default));
    const toolsListElement = document.createElement("x-pw-tools-list");
    this._overlayElement.appendChild(toolsListElement);
    this._dragHandle = document.createElement("x-pw-tool-gripper");
    this._dragHandle.appendChild(document.createElement("x-div"));
    toolsListElement.appendChild(this._dragHandle);
    this._recordToggle = this._recorder.document.createElement("x-pw-tool-item");
    this._recordToggle.title = "Record";
    this._recordToggle.classList.add("record");
    this._recordToggle.appendChild(this._recorder.document.createElement("x-div"));
    toolsListElement.appendChild(this._recordToggle);
    this._pickLocatorToggle = this._recorder.document.createElement("x-pw-tool-item");
    this._pickLocatorToggle.title = "Pick locator";
    this._pickLocatorToggle.classList.add("pick-locator");
    this._pickLocatorToggle.appendChild(this._recorder.document.createElement("x-div"));
    toolsListElement.appendChild(this._pickLocatorToggle);
    this._assertVisibilityToggle = this._recorder.document.createElement("x-pw-tool-item");
    this._assertVisibilityToggle.title = "Assert visibility";
    this._assertVisibilityToggle.classList.add("visibility");
    this._assertVisibilityToggle.appendChild(this._recorder.document.createElement("x-div"));
    toolsListElement.appendChild(this._assertVisibilityToggle);
    this._assertTextToggle = this._recorder.document.createElement("x-pw-tool-item");
    this._assertTextToggle.title = "Assert text";
    this._assertTextToggle.classList.add("text");
    this._assertTextToggle.appendChild(this._recorder.document.createElement("x-div"));
    toolsListElement.appendChild(this._assertTextToggle);
    this._assertValuesToggle = this._recorder.document.createElement("x-pw-tool-item");
    this._assertValuesToggle.title = "Assert value";
    this._assertValuesToggle.classList.add("value");
    this._assertValuesToggle.appendChild(this._recorder.document.createElement("x-div"));
    toolsListElement.appendChild(this._assertValuesToggle);
    this._updateVisualPosition();
    this._refreshListeners();
  }
  _refreshListeners() {
    removeEventListeners(this._listeners);
    this._listeners = [
      addEventListener(this._dragHandle, "mousedown", (event) => {
        this._dragState = { offsetX: this._offsetX, dragStart: { x: event.clientX, y: 0 } };
      }),
      addEventListener(this._recordToggle, "click", () => {
        this._recorder.setMode(this._recorder.state.mode === "none" || this._recorder.state.mode === "standby" || this._recorder.state.mode === "inspecting" ? "recording" : "standby");
      }),
      addEventListener(this._pickLocatorToggle, "click", () => {
        const newMode = {
          "inspecting": "standby",
          "none": "inspecting",
          "standby": "inspecting",
          "recording": "recording-inspecting",
          "recording-inspecting": "recording",
          "assertingText": "recording-inspecting",
          "assertingVisibility": "recording-inspecting",
          "assertingValue": "recording-inspecting"
        };
        this._recorder.setMode(newMode[this._recorder.state.mode]);
      }),
      addEventListener(this._assertVisibilityToggle, "click", () => {
        if (!this._assertVisibilityToggle.classList.contains("disabled"))
          this._recorder.setMode(this._recorder.state.mode === "assertingVisibility" ? "recording" : "assertingVisibility");
      }),
      addEventListener(this._assertTextToggle, "click", () => {
        if (!this._assertTextToggle.classList.contains("disabled"))
          this._recorder.setMode(this._recorder.state.mode === "assertingText" ? "recording" : "assertingText");
      }),
      addEventListener(this._assertValuesToggle, "click", () => {
        if (!this._assertValuesToggle.classList.contains("disabled"))
          this._recorder.setMode(this._recorder.state.mode === "assertingValue" ? "recording" : "assertingValue");
      })
    ];
  }
  install() {
    this._recorder.highlight.appendChild(this._overlayElement);
    this._refreshListeners();
    this._updateVisualPosition();
  }
  contains(element) {
    return this._recorder.injectedScript.utils.isInsideScope(this._overlayElement, element);
  }
  setUIState(state) {
    this._recordToggle.classList.toggle("active", state.mode === "recording" || state.mode === "assertingText" || state.mode === "assertingVisibility" || state.mode === "assertingValue" || state.mode === "recording-inspecting");
    this._pickLocatorToggle.classList.toggle("active", state.mode === "inspecting" || state.mode === "recording-inspecting");
    this._assertVisibilityToggle.classList.toggle("active", state.mode === "assertingVisibility");
    this._assertVisibilityToggle.classList.toggle("disabled", state.mode === "none" || state.mode === "standby" || state.mode === "inspecting");
    this._assertTextToggle.classList.toggle("active", state.mode === "assertingText");
    this._assertTextToggle.classList.toggle("disabled", state.mode === "none" || state.mode === "standby" || state.mode === "inspecting");
    this._assertValuesToggle.classList.toggle("active", state.mode === "assertingValue");
    this._assertValuesToggle.classList.toggle("disabled", state.mode === "none" || state.mode === "standby" || state.mode === "inspecting");
    if (this._offsetX !== state.overlay.offsetX) {
      this._offsetX = state.overlay.offsetX;
      this._updateVisualPosition();
    }
    if (state.mode === "none")
      this._hideOverlay();
    else
      this._showOverlay();
  }
  flashToolSucceeded(tool) {
    const element = tool === "assertingVisibility" ? this._assertVisibilityToggle : this._assertValuesToggle;
    element.classList.add("succeeded");
    this._recorder.injectedScript.builtinSetTimeout(() => element.classList.remove("succeeded"), 2e3);
  }
  _hideOverlay() {
    this._overlayElement.setAttribute("hidden", "true");
  }
  _showOverlay() {
    if (!this._overlayElement.hasAttribute("hidden"))
      return;
    this._overlayElement.removeAttribute("hidden");
    this._updateVisualPosition();
  }
  _updateVisualPosition() {
    this._measure = this._overlayElement.getBoundingClientRect();
    this._overlayElement.style.left = (this._recorder.injectedScript.window.innerWidth - this._measure.width) / 2 + this._offsetX + "px";
  }
  onMouseMove(event) {
    if (!event.buttons) {
      this._dragState = void 0;
      return false;
    }
    if (this._dragState) {
      this._offsetX = this._dragState.offsetX + event.clientX - this._dragState.dragStart.x;
      const halfGapSize = (this._recorder.injectedScript.window.innerWidth - this._measure.width) / 2 - 10;
      this._offsetX = Math.max(-halfGapSize, Math.min(halfGapSize, this._offsetX));
      this._updateVisualPosition();
      this._recorder.setOverlayState({ offsetX: this._offsetX });
      consumeEvent(event);
      return true;
    }
    return false;
  }
  onMouseUp(event) {
    if (this._dragState) {
      consumeEvent(event);
      return true;
    }
    return false;
  }
  onClick(event) {
    if (this._dragState) {
      this._dragState = void 0;
      consumeEvent(event);
      return true;
    }
    return false;
  }
};
var Recorder = class {
  constructor(injectedScript) {
    this._listeners = [];
    this._actionSelectorModel = null;
    this.state = {
      mode: "none",
      testIdAttributeName: "data-testid",
      language: "javascript",
      overlay: { offsetX: 0 }
    };
    this._delegate = {};
    this.document = injectedScript.document;
    this.injectedScript = injectedScript;
    this.highlight = injectedScript.createHighlight();
    this._tools = {
      "none": new NoneTool(),
      "standby": new NoneTool(),
      "inspecting": new InspectTool(this, false),
      "recording": new RecordActionTool(this),
      "recording-inspecting": new InspectTool(this, false),
      "assertingText": new TextAssertionTool(this, "text"),
      "assertingVisibility": new InspectTool(this, true),
      "assertingValue": new TextAssertionTool(this, "value")
    };
    this._currentTool = this._tools.none;
    if (injectedScript.window.top === injectedScript.window) {
      this.overlay = new Overlay(this);
      this.overlay.setUIState(this.state);
    }
    this._stylesheet = new injectedScript.window.CSSStyleSheet();
    this._stylesheet.replaceSync(`
      body[data-pw-cursor=pointer] *, body[data-pw-cursor=pointer] *::after { cursor: pointer !important; }
      body[data-pw-cursor=text] *, body[data-pw-cursor=text] *::after { cursor: text !important; }
    `);
    this.installListeners();
    injectedScript.utils.cacheNormalizedWhitespaces();
    if (injectedScript.isUnderTest)
      console.error("Recorder script ready for test");
  }
  installListeners() {
    var _a;
    removeEventListeners(this._listeners);
    this._listeners = [
      addEventListener(this.document, "click", (event) => this._onClick(event), true),
      addEventListener(this.document, "auxclick", (event) => this._onClick(event), true),
      addEventListener(this.document, "contextmenu", (event) => this._onContextMenu(event), true),
      addEventListener(this.document, "dragstart", (event) => this._onDragStart(event), true),
      addEventListener(this.document, "input", (event) => this._onInput(event), true),
      addEventListener(this.document, "keydown", (event) => this._onKeyDown(event), true),
      addEventListener(this.document, "keyup", (event) => this._onKeyUp(event), true),
      addEventListener(this.document, "pointerdown", (event) => this._onPointerDown(event), true),
      addEventListener(this.document, "pointerup", (event) => this._onPointerUp(event), true),
      addEventListener(this.document, "mousedown", (event) => this._onMouseDown(event), true),
      addEventListener(this.document, "mouseup", (event) => this._onMouseUp(event), true),
      addEventListener(this.document, "mousemove", (event) => this._onMouseMove(event), true),
      addEventListener(this.document, "mouseleave", (event) => this._onMouseLeave(event), true),
      addEventListener(this.document, "mouseenter", (event) => this._onMouseEnter(event), true),
      addEventListener(this.document, "focus", (event) => this._onFocus(event), true),
      addEventListener(this.document, "scroll", (event) => this._onScroll(event), true)
    ];
    this.highlight.install();
    (_a = this.overlay) == null ? void 0 : _a.install();
    this.document.adoptedStyleSheets.push(this._stylesheet);
  }
  _switchCurrentTool() {
    var _a, _b, _c;
    const newTool = this._tools[this.state.mode];
    if (newTool === this._currentTool)
      return;
    (_b = (_a = this._currentTool).cleanup) == null ? void 0 : _b.call(_a);
    this.clearHighlight();
    this._currentTool = newTool;
    (_c = this.injectedScript.document.body) == null ? void 0 : _c.setAttribute("data-pw-cursor", newTool.cursor());
  }
  setUIState(state, delegate) {
    var _a, _b, _c, _d;
    this._delegate = delegate;
    if (state.actionPoint && this.state.actionPoint && state.actionPoint.x === this.state.actionPoint.x && state.actionPoint.y === this.state.actionPoint.y) {
    } else if (!state.actionPoint && !this.state.actionPoint) {
    } else {
      if (state.actionPoint)
        this.highlight.showActionPoint(state.actionPoint.x, state.actionPoint.y);
      else
        this.highlight.hideActionPoint();
    }
    this.state = state;
    this.highlight.setLanguage(state.language);
    this._switchCurrentTool();
    (_a = this.overlay) == null ? void 0 : _a.setUIState(state);
    if (((_b = this._actionSelectorModel) == null ? void 0 : _b.selector) && !((_c = this._actionSelectorModel) == null ? void 0 : _c.elements.length))
      this._actionSelectorModel = null;
    if (state.actionSelector !== ((_d = this._actionSelectorModel) == null ? void 0 : _d.selector))
      this._actionSelectorModel = state.actionSelector ? querySelector(this.injectedScript, state.actionSelector, this.document) : null;
    if (this.state.mode === "none" || this.state.mode === "standby")
      this.updateHighlight(this._actionSelectorModel, false);
  }
  clearHighlight() {
    var _a, _b;
    (_b = (_a = this._currentTool).cleanup) == null ? void 0 : _b.call(_a);
    this.updateHighlight(null, false);
  }
  _onClick(event) {
    var _a, _b, _c;
    if (!event.isTrusted)
      return;
    if ((_a = this.overlay) == null ? void 0 : _a.onClick(event))
      return;
    if (this._ignoreOverlayEvent(event))
      return;
    (_c = (_b = this._currentTool).onClick) == null ? void 0 : _c.call(_b, event);
  }
  _onContextMenu(event) {
    var _a, _b;
    if (!event.isTrusted)
      return;
    if (this._ignoreOverlayEvent(event))
      return;
    (_b = (_a = this._currentTool).onContextMenu) == null ? void 0 : _b.call(_a, event);
  }
  _onDragStart(event) {
    var _a, _b;
    if (!event.isTrusted)
      return;
    if (this._ignoreOverlayEvent(event))
      return;
    (_b = (_a = this._currentTool).onDragStart) == null ? void 0 : _b.call(_a, event);
  }
  _onPointerDown(event) {
    var _a, _b;
    if (!event.isTrusted)
      return;
    if (this._ignoreOverlayEvent(event))
      return;
    (_b = (_a = this._currentTool).onPointerDown) == null ? void 0 : _b.call(_a, event);
  }
  _onPointerUp(event) {
    var _a, _b;
    if (!event.isTrusted)
      return;
    if (this._ignoreOverlayEvent(event))
      return;
    (_b = (_a = this._currentTool).onPointerUp) == null ? void 0 : _b.call(_a, event);
  }
  _onMouseDown(event) {
    var _a, _b;
    if (!event.isTrusted)
      return;
    if (this._ignoreOverlayEvent(event))
      return;
    (_b = (_a = this._currentTool).onMouseDown) == null ? void 0 : _b.call(_a, event);
  }
  _onMouseUp(event) {
    var _a, _b, _c;
    if (!event.isTrusted)
      return;
    if ((_a = this.overlay) == null ? void 0 : _a.onMouseUp(event))
      return;
    if (this._ignoreOverlayEvent(event))
      return;
    (_c = (_b = this._currentTool).onMouseUp) == null ? void 0 : _c.call(_b, event);
  }
  _onMouseMove(event) {
    var _a, _b, _c;
    if (!event.isTrusted)
      return;
    if ((_a = this.overlay) == null ? void 0 : _a.onMouseMove(event))
      return;
    if (this._ignoreOverlayEvent(event))
      return;
    (_c = (_b = this._currentTool).onMouseMove) == null ? void 0 : _c.call(_b, event);
  }
  _onMouseEnter(event) {
    var _a, _b;
    if (!event.isTrusted)
      return;
    if (this._ignoreOverlayEvent(event))
      return;
    (_b = (_a = this._currentTool).onMouseEnter) == null ? void 0 : _b.call(_a, event);
  }
  _onMouseLeave(event) {
    var _a, _b;
    if (!event.isTrusted)
      return;
    if (this._ignoreOverlayEvent(event))
      return;
    (_b = (_a = this._currentTool).onMouseLeave) == null ? void 0 : _b.call(_a, event);
  }
  _onFocus(event) {
    var _a, _b;
    if (!event.isTrusted)
      return;
    if (this._ignoreOverlayEvent(event))
      return;
    (_b = (_a = this._currentTool).onFocus) == null ? void 0 : _b.call(_a, event);
  }
  _onScroll(event) {
    var _a, _b;
    if (!event.isTrusted)
      return;
    this.highlight.hideActionPoint();
    (_b = (_a = this._currentTool).onScroll) == null ? void 0 : _b.call(_a, event);
  }
  _onInput(event) {
    var _a, _b;
    if (this._ignoreOverlayEvent(event))
      return;
    (_b = (_a = this._currentTool).onInput) == null ? void 0 : _b.call(_a, event);
  }
  _onKeyDown(event) {
    var _a, _b;
    if (!event.isTrusted)
      return;
    if (this._ignoreOverlayEvent(event))
      return;
    (_b = (_a = this._currentTool).onKeyDown) == null ? void 0 : _b.call(_a, event);
  }
  _onKeyUp(event) {
    var _a, _b;
    if (!event.isTrusted)
      return;
    if (this._ignoreOverlayEvent(event))
      return;
    (_b = (_a = this._currentTool).onKeyUp) == null ? void 0 : _b.call(_a, event);
  }
  updateHighlight(model, userGesture) {
    var _a, _b;
    let tooltipText = model == null ? void 0 : model.tooltipText;
    if (tooltipText === void 0 && !(model == null ? void 0 : model.tooltipList) && (model == null ? void 0 : model.selector))
      tooltipText = this.injectedScript.utils.asLocator(this.state.language, model.selector);
    this.highlight.updateHighlight((model == null ? void 0 : model.elements) || [], { ...model, tooltipText });
    if (userGesture)
      (_b = (_a = this._delegate).highlightUpdated) == null ? void 0 : _b.call(_a);
  }
  _ignoreOverlayEvent(event) {
    return event.composedPath().some((e) => {
      const nodeName = e.nodeName || "";
      return nodeName.toLowerCase() === "x-pw-glass";
    });
  }
  deepEventTarget(event) {
    var _a;
    for (const element of event.composedPath()) {
      if (!((_a = this.overlay) == null ? void 0 : _a.contains(element)))
        return element;
    }
    return event.composedPath()[0];
  }
  setMode(mode) {
    var _a, _b;
    void ((_b = (_a = this._delegate).setMode) == null ? void 0 : _b.call(_a, mode));
  }
  async performAction(action) {
    var _a, _b;
    await ((_b = (_a = this._delegate).performAction) == null ? void 0 : _b.call(_a, action).catch(() => {
    }));
  }
  recordAction(action) {
    var _a, _b;
    void ((_b = (_a = this._delegate).recordAction) == null ? void 0 : _b.call(_a, action));
  }
  setOverlayState(state) {
    var _a, _b;
    void ((_b = (_a = this._delegate).setOverlayState) == null ? void 0 : _b.call(_a, state));
  }
  setSelector(selector) {
    var _a, _b;
    void ((_b = (_a = this._delegate).setSelector) == null ? void 0 : _b.call(_a, selector));
  }
};
var Dialog = class {
  constructor(recorder) {
    this._dialogElement = null;
    this._recorder = recorder;
  }
  isShowing() {
    return !!this._dialogElement;
  }
  show(options) {
    const acceptButton = this._recorder.document.createElement("x-pw-tool-item");
    acceptButton.title = "Accept";
    acceptButton.classList.add("accept");
    acceptButton.appendChild(this._recorder.document.createElement("x-div"));
    acceptButton.addEventListener("click", () => options.onCommit());
    const cancelButton = this._recorder.document.createElement("x-pw-tool-item");
    cancelButton.title = "Close";
    cancelButton.classList.add("cancel");
    cancelButton.appendChild(this._recorder.document.createElement("x-div"));
    cancelButton.addEventListener("click", () => {
      var _a;
      this.close();
      (_a = options.onCancel) == null ? void 0 : _a.call(options);
    });
    this._dialogElement = this._recorder.document.createElement("x-pw-dialog");
    this._keyboardListener = (event) => {
      var _a;
      if (event.key === "Escape") {
        this.close();
        (_a = options.onCancel) == null ? void 0 : _a.call(options);
        return;
      }
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        if (this._dialogElement)
          options.onCommit();
        return;
      }
    };
    this._recorder.document.addEventListener("keydown", this._keyboardListener, true);
    const toolbarElement = this._recorder.document.createElement("x-pw-tools-list");
    const labelElement = this._recorder.document.createElement("label");
    labelElement.textContent = options.label;
    toolbarElement.appendChild(labelElement);
    toolbarElement.appendChild(this._recorder.document.createElement("x-spacer"));
    toolbarElement.appendChild(acceptButton);
    toolbarElement.appendChild(cancelButton);
    this._dialogElement.appendChild(toolbarElement);
    const bodyElement = this._recorder.document.createElement("x-pw-dialog-body");
    bodyElement.appendChild(options.body);
    this._dialogElement.appendChild(bodyElement);
    this._recorder.highlight.appendChild(this._dialogElement);
    return this._dialogElement;
  }
  moveTo(top, left) {
    if (!this._dialogElement)
      return;
    this._dialogElement.style.top = top + "px";
    this._dialogElement.style.left = left + "px";
  }
  close() {
    if (!this._dialogElement)
      return;
    this._dialogElement.remove();
    this._recorder.document.removeEventListener("keydown", this._keyboardListener);
    this._dialogElement = null;
  }
};
function deepActiveElement(document) {
  let activeElement = document.activeElement;
  while (activeElement && activeElement.shadowRoot && activeElement.shadowRoot.activeElement)
    activeElement = activeElement.shadowRoot.activeElement;
  return activeElement;
}
function modifiersForEvent(event) {
  return (event.altKey ? 1 : 0) | (event.ctrlKey ? 2 : 0) | (event.metaKey ? 4 : 0) | (event.shiftKey ? 8 : 0);
}
function buttonForEvent(event) {
  switch (event.which) {
    case 1:
      return "left";
    case 2:
      return "middle";
    case 3:
      return "right";
  }
  return "left";
}
function positionForEvent(event) {
  const targetElement = event.target;
  if (targetElement.nodeName !== "CANVAS")
    return;
  return {
    x: event.offsetX,
    y: event.offsetY
  };
}
function consumeEvent(e) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
}
function asCheckbox(node) {
  if (!node || node.nodeName !== "INPUT")
    return null;
  const inputElement = node;
  return ["checkbox", "radio"].includes(inputElement.type) ? inputElement : null;
}
function isRangeInput(node) {
  if (!node || node.nodeName !== "INPUT")
    return false;
  const inputElement = node;
  return inputElement.type.toLowerCase() === "range";
}
function addEventListener(target, eventName, listener, useCapture) {
  target.addEventListener(eventName, listener, useCapture);
  const remove = () => {
    target.removeEventListener(eventName, listener, useCapture);
  };
  return remove;
}
function removeEventListeners(listeners) {
  for (const listener of listeners)
    listener();
  listeners.splice(0, listeners.length);
}
function querySelector(injectedScript, selector, ownerDocument) {
  try {
    const parsedSelector = injectedScript.parseSelector(selector);
    return {
      selector,
      elements: injectedScript.querySelectorAll(parsedSelector, ownerDocument)
    };
  } catch (e) {
    return {
      selector,
      elements: []
    };
  }
}
function createSvgElement(doc, { tagName, attrs, children }) {
  const elem = doc.createElementNS("http://www.w3.org/2000/svg", tagName);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs))
      elem.setAttribute(k, v);
  }
  if (children) {
    for (const c of children)
      elem.appendChild(createSvgElement(doc, c));
  }
  return elem;
}
var PollingRecorder = class {
  constructor(injectedScript) {
    this._recorder = new Recorder(injectedScript);
    this._embedder = injectedScript.window;
    injectedScript.onGlobalListenersRemoved.add(() => this._recorder.installListeners());
    const refreshOverlay = () => {
      this._pollRecorderMode().catch((e) => console.log(e));
    };
    this._embedder.__pw_refreshOverlay = refreshOverlay;
    refreshOverlay();
  }
  async _pollRecorderMode() {
    const pollPeriod = 1e3;
    if (this._pollRecorderModeTimer)
      clearTimeout(this._pollRecorderModeTimer);
    const state = await this._embedder.__pw_recorderState().catch(() => {
    });
    if (!state) {
      this._pollRecorderModeTimer = this._recorder.injectedScript.builtinSetTimeout(() => this._pollRecorderMode(), pollPeriod);
      return;
    }
    const win = this._recorder.document.defaultView;
    if (win.top !== win) {
      state.actionPoint = void 0;
    }
    this._recorder.setUIState(state, this);
    this._pollRecorderModeTimer = this._recorder.injectedScript.builtinSetTimeout(() => this._pollRecorderMode(), pollPeriod);
  }
  async performAction(action, simpleDomNode) {
    await this._embedder.__pw_recorderPerformAction(action, simpleDomNode);
  }
  async recordAction(action, simpleDomNode) {
    await this._embedder.__pw_recorderRecordAction(action, simpleDomNode);
  }
  async setSelector(selector) {
    await this._embedder.__pw_recorderSetSelector(selector);
  }
  async setMode(mode) {
    await this._embedder.__pw_recorderSetMode(mode);
  }
  async setOverlayState(state) {
    await this._embedder.__pw_recorderSetOverlayState(state);
  }
};
var recorder_default = PollingRecorder;
