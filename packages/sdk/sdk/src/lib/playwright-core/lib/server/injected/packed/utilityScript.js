
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


// packages/playwright-core/src/server/injected/utilityScript.ts
var utilityScript_exports = {};
__export(utilityScript_exports, {
  UtilityScript: () => UtilityScript
});
module.exports = __toCommonJS(utilityScript_exports);

// packages/playwright-core/src/server/isomorphic/utilityScriptSerializers.ts
function source() {
  function isRegExp(obj) {
    try {
      return obj instanceof RegExp || Object.prototype.toString.call(obj) === "[object RegExp]";
    } catch (error) {
      return false;
    }
  }
  function isDate(obj) {
    try {
      return obj instanceof Date || Object.prototype.toString.call(obj) === "[object Date]";
    } catch (error) {
      return false;
    }
  }
  function isURL(obj) {
    try {
      return obj instanceof URL || Object.prototype.toString.call(obj) === "[object URL]";
    } catch (error) {
      return false;
    }
  }
  function isError(obj) {
    var _a;
    try {
      return obj instanceof Error || obj && ((_a = Object.getPrototypeOf(obj)) == null ? void 0 : _a.name) === "Error";
    } catch (error) {
      return false;
    }
  }
  function parseEvaluationResultValue2(value, handles = [], refs = /* @__PURE__ */ new Map()) {
    if (Object.is(value, void 0))
      return void 0;
    if (typeof value === "object" && value) {
      if ("ref" in value)
        return refs.get(value.ref);
      if ("v" in value) {
        if (value.v === "undefined")
          return void 0;
        if (value.v === "null")
          return null;
        if (value.v === "NaN")
          return NaN;
        if (value.v === "Infinity")
          return Infinity;
        if (value.v === "-Infinity")
          return -Infinity;
        if (value.v === "-0")
          return -0;
        return void 0;
      }
      if ("d" in value)
        return new Date(value.d);
      if ("u" in value)
        return new URL(value.u);
      if ("bi" in value)
        return BigInt(value.bi);
      if ("e" in value) {
        const error = new Error(value.e.m);
        error.name = value.e.n;
        error.stack = value.e.s;
        return error;
      }
      if ("r" in value)
        return new RegExp(value.r.p, value.r.f);
      if ("a" in value) {
        const result2 = [];
        refs.set(value.id, result2);
        for (const a of value.a)
          result2.push(parseEvaluationResultValue2(a, handles, refs));
        return result2;
      }
      if ("o" in value) {
        const result2 = {};
        refs.set(value.id, result2);
        for (const { k, v } of value.o)
          result2[k] = parseEvaluationResultValue2(v, handles, refs);
        return result2;
      }
      if ("h" in value)
        return handles[value.h];
    }
    return value;
  }
  function serializeAsCallArgument2(value, handleSerializer) {
    return serialize(value, handleSerializer, { visited: /* @__PURE__ */ new Map(), lastId: 0 });
  }
  function serialize(value, handleSerializer, visitorInfo) {
    if (value && typeof value === "object") {
      if (typeof globalThis.Window === "function" && value instanceof globalThis.Window)
        return "ref: <Window>";
      if (typeof globalThis.Document === "function" && value instanceof globalThis.Document)
        return "ref: <Document>";
      if (typeof globalThis.Node === "function" && value instanceof globalThis.Node)
        return "ref: <Node>";
    }
    return innerSerialize(value, handleSerializer, visitorInfo);
  }
  function innerSerialize(value, handleSerializer, visitorInfo) {
    var _a;
    const result2 = handleSerializer(value);
    if ("fallThrough" in result2)
      value = result2.fallThrough;
    else
      return result2;
    if (typeof value === "symbol")
      return { v: "undefined" };
    if (Object.is(value, void 0))
      return { v: "undefined" };
    if (Object.is(value, null))
      return { v: "null" };
    if (Object.is(value, NaN))
      return { v: "NaN" };
    if (Object.is(value, Infinity))
      return { v: "Infinity" };
    if (Object.is(value, -Infinity))
      return { v: "-Infinity" };
    if (Object.is(value, -0))
      return { v: "-0" };
    if (typeof value === "boolean")
      return value;
    if (typeof value === "number")
      return value;
    if (typeof value === "string")
      return value;
    if (typeof value === "bigint")
      return { bi: value.toString() };
    if (isError(value)) {
      let stack;
      if ((_a = value.stack) == null ? void 0 : _a.startsWith(value.name + ": " + value.message)) {
        stack = value.stack;
      } else {
        stack = `${value.name}: ${value.message}
${value.stack}`;
      }
      return { e: { n: value.name, m: value.message, s: stack } };
    }
    if (isDate(value))
      return { d: value.toJSON() };
    if (isURL(value))
      return { u: value.toJSON() };
    if (isRegExp(value))
      return { r: { p: value.source, f: value.flags } };
    const id = visitorInfo.visited.get(value);
    if (id)
      return { ref: id };
    if (Array.isArray(value)) {
      const a = [];
      const id2 = ++visitorInfo.lastId;
      visitorInfo.visited.set(value, id2);
      for (let i = 0; i < value.length; ++i)
        a.push(serialize(value[i], handleSerializer, visitorInfo));
      return { a, id: id2 };
    }
    if (typeof value === "object") {
      const o = [];
      const id2 = ++visitorInfo.lastId;
      visitorInfo.visited.set(value, id2);
      for (const name of Object.keys(value)) {
        let item;
        try {
          item = value[name];
        } catch (e) {
          continue;
        }
        if (name === "toJSON" && typeof item === "function")
          o.push({ k: name, v: { o: [], id: 0 } });
        else
          o.push({ k: name, v: serialize(item, handleSerializer, visitorInfo) });
      }
      let jsonWrapper;
      try {
        if (o.length === 0 && value.toJSON && typeof value.toJSON === "function")
          jsonWrapper = { value: value.toJSON() };
      } catch (e) {
      }
      if (jsonWrapper)
        return innerSerialize(jsonWrapper.value, handleSerializer, visitorInfo);
      return { o, id: id2 };
    }
  }
  return { parseEvaluationResultValue: parseEvaluationResultValue2, serializeAsCallArgument: serializeAsCallArgument2 };
}
var result = source();
var parseEvaluationResultValue = result.parseEvaluationResultValue;
var serializeAsCallArgument = result.serializeAsCallArgument;

// packages/playwright-core/src/server/injected/utilityScript.ts
var UtilityScript = class {
  constructor(isUnderTest) {
    this.serializeAsCallArgument = serializeAsCallArgument;
    this.parseEvaluationResultValue = parseEvaluationResultValue;
    if (isUnderTest)
      this._setBuiltins();
  }
  evaluate(isFunction, returnByValue, expression, argCount, ...argsAndHandles) {
    const args = argsAndHandles.slice(0, argCount);
    const handles = argsAndHandles.slice(argCount);
    const parameters = [];
    for (let i = 0; i < args.length; i++)
      parameters[i] = this.parseEvaluationResultValue(args[i], handles);
    let result2 = globalThis.eval(expression);
    if (isFunction === true) {
      result2 = result2(...parameters);
    } else if (isFunction === false) {
      result2 = result2;
    } else {
      if (typeof result2 === "function")
        result2 = result2(...parameters);
    }
    return returnByValue ? this._promiseAwareJsonValueNoThrow(result2) : result2;
  }
  jsonValue(returnByValue, value) {
    if (Object.is(value, void 0))
      return void 0;
    return serializeAsCallArgument(value, (value2) => ({ fallThrough: value2 }));
  }
  _promiseAwareJsonValueNoThrow(value) {
    const safeJson = (value2) => {
      try {
        return this.jsonValue(true, value2);
      } catch (e) {
        return void 0;
      }
    };
    if (value && typeof value === "object" && typeof value.then === "function") {
      return (async () => {
        const promiseValue = await value;
        return safeJson(promiseValue);
      })();
    }
    return safeJson(value);
  }
  _setBuiltins() {
    var _a, _b;
    const window = globalThis;
    window.builtinSetTimeout = (callback, timeout) => {
      var _a2;
      if ((_a2 = window.__pwClock) == null ? void 0 : _a2.builtin)
        return window.__pwClock.builtin.setTimeout(callback, timeout);
      return setTimeout(callback, timeout);
    };
    window.builtinClearTimeout = (id) => {
      var _a2;
      if ((_a2 = window.__pwClock) == null ? void 0 : _a2.builtin)
        return window.__pwClock.builtin.clearTimeout(id);
      return clearTimeout(id);
    };
    window.builtinSetInterval = (callback, timeout) => {
      var _a2;
      if ((_a2 = window.__pwClock) == null ? void 0 : _a2.builtin)
        return window.__pwClock.builtin.setInterval(callback, timeout);
      return setInterval(callback, timeout);
    };
    window.builtinClearInterval = (id) => {
      var _a2;
      if ((_a2 = window.__pwClock) == null ? void 0 : _a2.builtin)
        return window.__pwClock.builtin.clearInterval(id);
      return clearInterval(id);
    };
    window.builtinRequestAnimationFrame = (callback) => {
      var _a2;
      if ((_a2 = window.__pwClock) == null ? void 0 : _a2.builtin)
        return window.__pwClock.builtin.requestAnimationFrame(callback);
      return requestAnimationFrame(callback);
    };
    window.builtinCancelAnimationFrame = (id) => {
      var _a2;
      if ((_a2 = window.__pwClock) == null ? void 0 : _a2.builtin)
        return window.__pwClock.builtin.cancelAnimationFrame(id);
      return cancelAnimationFrame(id);
    };
    window.builtinDate = ((_a = window.__pwClock) == null ? void 0 : _a.builtin.Date) || Date;
    window.builtinPerformance = ((_b = window.__pwClock) == null ? void 0 : _b.builtin.performance) || performance;
  }
};
