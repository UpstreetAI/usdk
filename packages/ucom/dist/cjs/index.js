'use strict';

var jsxRuntime = {exports: {}};

var reactJsxRuntime_production_min = {};

var react = {exports: {}};

var react_production_min = {};

/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReact_production_min;

function requireReact_production_min () {
	if (hasRequiredReact_production_min) return react_production_min;
	hasRequiredReact_production_min = 1;
var l=Symbol.for("react.element"),n=Symbol.for("react.portal"),p=Symbol.for("react.fragment"),q=Symbol.for("react.strict_mode"),r=Symbol.for("react.profiler"),t=Symbol.for("react.provider"),u=Symbol.for("react.context"),v=Symbol.for("react.forward_ref"),w=Symbol.for("react.suspense"),x=Symbol.for("react.memo"),y=Symbol.for("react.lazy"),z=Symbol.iterator;function A(a){if(null===a||"object"!==typeof a)return null;a=z&&a[z]||a["@@iterator"];return "function"===typeof a?a:null}
	var B={isMounted:function(){return !1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},C=Object.assign,D={};function E(a,b,e){this.props=a;this.context=b;this.refs=D;this.updater=e||B;}E.prototype.isReactComponent={};
	E.prototype.setState=function(a,b){if("object"!==typeof a&&"function"!==typeof a&&null!=a)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,a,b,"setState");};E.prototype.forceUpdate=function(a){this.updater.enqueueForceUpdate(this,a,"forceUpdate");};function F(){}F.prototype=E.prototype;function G(a,b,e){this.props=a;this.context=b;this.refs=D;this.updater=e||B;}var H=G.prototype=new F;
	H.constructor=G;C(H,E.prototype);H.isPureReactComponent=!0;var I=Array.isArray,J=Object.prototype.hasOwnProperty,K={current:null},L={key:!0,ref:!0,__self:!0,__source:!0};
	function M(a,b,e){var d,c={},k=null,h=null;if(null!=b)for(d in void 0!==b.ref&&(h=b.ref),void 0!==b.key&&(k=""+b.key),b)J.call(b,d)&&!L.hasOwnProperty(d)&&(c[d]=b[d]);var g=arguments.length-2;if(1===g)c.children=e;else if(1<g){for(var f=Array(g),m=0;m<g;m++)f[m]=arguments[m+2];c.children=f;}if(a&&a.defaultProps)for(d in g=a.defaultProps,g)void 0===c[d]&&(c[d]=g[d]);return {$$typeof:l,type:a,key:k,ref:h,props:c,_owner:K.current}}
	function N(a,b){return {$$typeof:l,type:a.type,key:b,ref:a.ref,props:a.props,_owner:a._owner}}function O(a){return "object"===typeof a&&null!==a&&a.$$typeof===l}function escape(a){var b={"=":"=0",":":"=2"};return "$"+a.replace(/[=:]/g,function(a){return b[a]})}var P=/\/+/g;function Q(a,b){return "object"===typeof a&&null!==a&&null!=a.key?escape(""+a.key):b.toString(36)}
	function R(a,b,e,d,c){var k=typeof a;if("undefined"===k||"boolean"===k)a=null;var h=!1;if(null===a)h=!0;else switch(k){case "string":case "number":h=!0;break;case "object":switch(a.$$typeof){case l:case n:h=!0;}}if(h)return h=a,c=c(h),a=""===d?"."+Q(h,0):d,I(c)?(e="",null!=a&&(e=a.replace(P,"$&/")+"/"),R(c,b,e,"",function(a){return a})):null!=c&&(O(c)&&(c=N(c,e+(!c.key||h&&h.key===c.key?"":(""+c.key).replace(P,"$&/")+"/")+a)),b.push(c)),1;h=0;d=""===d?".":d+":";if(I(a))for(var g=0;g<a.length;g++){k=
	a[g];var f=d+Q(k,g);h+=R(k,b,e,f,c);}else if(f=A(a),"function"===typeof f)for(a=f.call(a),g=0;!(k=a.next()).done;)k=k.value,f=d+Q(k,g++),h+=R(k,b,e,f,c);else if("object"===k)throw b=String(a),Error("Objects are not valid as a React child (found: "+("[object Object]"===b?"object with keys {"+Object.keys(a).join(", ")+"}":b)+"). If you meant to render a collection of children, use an array instead.");return h}
	function S(a,b,e){if(null==a)return a;var d=[],c=0;R(a,d,"","",function(a){return b.call(e,a,c++)});return d}function T(a){if(-1===a._status){var b=a._result;b=b();b.then(function(b){if(0===a._status||-1===a._status)a._status=1,a._result=b;},function(b){if(0===a._status||-1===a._status)a._status=2,a._result=b;});-1===a._status&&(a._status=0,a._result=b);}if(1===a._status)return a._result.default;throw a._result;}
	var U={current:null},V={transition:null},W={ReactCurrentDispatcher:U,ReactCurrentBatchConfig:V,ReactCurrentOwner:K};react_production_min.Children={map:S,forEach:function(a,b,e){S(a,function(){b.apply(this,arguments);},e);},count:function(a){var b=0;S(a,function(){b++;});return b},toArray:function(a){return S(a,function(a){return a})||[]},only:function(a){if(!O(a))throw Error("React.Children.only expected to receive a single React element child.");return a}};react_production_min.Component=E;react_production_min.Fragment=p;
	react_production_min.Profiler=r;react_production_min.PureComponent=G;react_production_min.StrictMode=q;react_production_min.Suspense=w;react_production_min.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=W;
	react_production_min.cloneElement=function(a,b,e){if(null===a||void 0===a)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+a+".");var d=C({},a.props),c=a.key,k=a.ref,h=a._owner;if(null!=b){void 0!==b.ref&&(k=b.ref,h=K.current);void 0!==b.key&&(c=""+b.key);if(a.type&&a.type.defaultProps)var g=a.type.defaultProps;for(f in b)J.call(b,f)&&!L.hasOwnProperty(f)&&(d[f]=void 0===b[f]&&void 0!==g?g[f]:b[f]);}var f=arguments.length-2;if(1===f)d.children=e;else if(1<f){g=Array(f);
	for(var m=0;m<f;m++)g[m]=arguments[m+2];d.children=g;}return {$$typeof:l,type:a.type,key:c,ref:k,props:d,_owner:h}};react_production_min.createContext=function(a){a={$$typeof:u,_currentValue:a,_currentValue2:a,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null};a.Provider={$$typeof:t,_context:a};return a.Consumer=a};react_production_min.createElement=M;react_production_min.createFactory=function(a){var b=M.bind(null,a);b.type=a;return b};react_production_min.createRef=function(){return {current:null}};
	react_production_min.forwardRef=function(a){return {$$typeof:v,render:a}};react_production_min.isValidElement=O;react_production_min.lazy=function(a){return {$$typeof:y,_payload:{_status:-1,_result:a},_init:T}};react_production_min.memo=function(a,b){return {$$typeof:x,type:a,compare:void 0===b?null:b}};react_production_min.startTransition=function(a){var b=V.transition;V.transition={};try{a();}finally{V.transition=b;}};react_production_min.unstable_act=function(){throw Error("act(...) is not supported in production builds of React.");};
	react_production_min.useCallback=function(a,b){return U.current.useCallback(a,b)};react_production_min.useContext=function(a){return U.current.useContext(a)};react_production_min.useDebugValue=function(){};react_production_min.useDeferredValue=function(a){return U.current.useDeferredValue(a)};react_production_min.useEffect=function(a,b){return U.current.useEffect(a,b)};react_production_min.useId=function(){return U.current.useId()};react_production_min.useImperativeHandle=function(a,b,e){return U.current.useImperativeHandle(a,b,e)};
	react_production_min.useInsertionEffect=function(a,b){return U.current.useInsertionEffect(a,b)};react_production_min.useLayoutEffect=function(a,b){return U.current.useLayoutEffect(a,b)};react_production_min.useMemo=function(a,b){return U.current.useMemo(a,b)};react_production_min.useReducer=function(a,b,e){return U.current.useReducer(a,b,e)};react_production_min.useRef=function(a){return U.current.useRef(a)};react_production_min.useState=function(a){return U.current.useState(a)};react_production_min.useSyncExternalStore=function(a,b,e){return U.current.useSyncExternalStore(a,b,e)};
	react_production_min.useTransition=function(){return U.current.useTransition()};react_production_min.version="18.2.0";
	return react_production_min;
}

var react_development = {exports: {}};

/**
 * @license React
 * react.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
react_development.exports;

var hasRequiredReact_development;

function requireReact_development () {
	if (hasRequiredReact_development) return react_development.exports;
	hasRequiredReact_development = 1;
	(function (module, exports) {

		if (process.env.NODE_ENV !== "production") {
		  (function() {

		/* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
		if (
		  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' &&
		  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart ===
		    'function'
		) {
		  __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
		}
		          var ReactVersion = '18.2.0';

		// ATTENTION
		// When adding new symbols to this file,
		// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
		// The Symbol used to tag the ReactElement-like types.
		var REACT_ELEMENT_TYPE = Symbol.for('react.element');
		var REACT_PORTAL_TYPE = Symbol.for('react.portal');
		var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
		var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
		var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
		var REACT_PROVIDER_TYPE = Symbol.for('react.provider');
		var REACT_CONTEXT_TYPE = Symbol.for('react.context');
		var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
		var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
		var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
		var REACT_MEMO_TYPE = Symbol.for('react.memo');
		var REACT_LAZY_TYPE = Symbol.for('react.lazy');
		var REACT_OFFSCREEN_TYPE = Symbol.for('react.offscreen');
		var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
		var FAUX_ITERATOR_SYMBOL = '@@iterator';
		function getIteratorFn(maybeIterable) {
		  if (maybeIterable === null || typeof maybeIterable !== 'object') {
		    return null;
		  }

		  var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];

		  if (typeof maybeIterator === 'function') {
		    return maybeIterator;
		  }

		  return null;
		}

		/**
		 * Keeps track of the current dispatcher.
		 */
		var ReactCurrentDispatcher = {
		  /**
		   * @internal
		   * @type {ReactComponent}
		   */
		  current: null
		};

		/**
		 * Keeps track of the current batch's configuration such as how long an update
		 * should suspend for if it needs to.
		 */
		var ReactCurrentBatchConfig = {
		  transition: null
		};

		var ReactCurrentActQueue = {
		  current: null,
		  // Used to reproduce behavior of `batchedUpdates` in legacy mode.
		  isBatchingLegacy: false,
		  didScheduleLegacyUpdate: false
		};

		/**
		 * Keeps track of the current owner.
		 *
		 * The current owner is the component who should own any components that are
		 * currently being constructed.
		 */
		var ReactCurrentOwner = {
		  /**
		   * @internal
		   * @type {ReactComponent}
		   */
		  current: null
		};

		var ReactDebugCurrentFrame = {};
		var currentExtraStackFrame = null;
		function setExtraStackFrame(stack) {
		  {
		    currentExtraStackFrame = stack;
		  }
		}

		{
		  ReactDebugCurrentFrame.setExtraStackFrame = function (stack) {
		    {
		      currentExtraStackFrame = stack;
		    }
		  }; // Stack implementation injected by the current renderer.


		  ReactDebugCurrentFrame.getCurrentStack = null;

		  ReactDebugCurrentFrame.getStackAddendum = function () {
		    var stack = ''; // Add an extra top frame while an element is being validated

		    if (currentExtraStackFrame) {
		      stack += currentExtraStackFrame;
		    } // Delegate to the injected renderer-specific implementation


		    var impl = ReactDebugCurrentFrame.getCurrentStack;

		    if (impl) {
		      stack += impl() || '';
		    }

		    return stack;
		  };
		}

		// -----------------------------------------------------------------------------

		var enableScopeAPI = false; // Experimental Create Event Handle API.
		var enableCacheElement = false;
		var enableTransitionTracing = false; // No known bugs, but needs performance testing

		var enableLegacyHidden = false; // Enables unstable_avoidThisFallback feature in Fiber
		// stuff. Intended to enable React core members to more easily debug scheduling
		// issues in DEV builds.

		var enableDebugTracing = false; // Track which Fiber(s) schedule render work.

		var ReactSharedInternals = {
		  ReactCurrentDispatcher: ReactCurrentDispatcher,
		  ReactCurrentBatchConfig: ReactCurrentBatchConfig,
		  ReactCurrentOwner: ReactCurrentOwner
		};

		{
		  ReactSharedInternals.ReactDebugCurrentFrame = ReactDebugCurrentFrame;
		  ReactSharedInternals.ReactCurrentActQueue = ReactCurrentActQueue;
		}

		// by calls to these methods by a Babel plugin.
		//
		// In PROD (or in packages without access to React internals),
		// they are left as they are instead.

		function warn(format) {
		  {
		    {
		      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		        args[_key - 1] = arguments[_key];
		      }

		      printWarning('warn', format, args);
		    }
		  }
		}
		function error(format) {
		  {
		    {
		      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
		        args[_key2 - 1] = arguments[_key2];
		      }

		      printWarning('error', format, args);
		    }
		  }
		}

		function printWarning(level, format, args) {
		  // When changing this logic, you might want to also
		  // update consoleWithStackDev.www.js as well.
		  {
		    var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
		    var stack = ReactDebugCurrentFrame.getStackAddendum();

		    if (stack !== '') {
		      format += '%s';
		      args = args.concat([stack]);
		    } // eslint-disable-next-line react-internal/safe-string-coercion


		    var argsWithFormat = args.map(function (item) {
		      return String(item);
		    }); // Careful: RN currently depends on this prefix

		    argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
		    // breaks IE9: https://github.com/facebook/react/issues/13610
		    // eslint-disable-next-line react-internal/no-production-logging

		    Function.prototype.apply.call(console[level], console, argsWithFormat);
		  }
		}

		var didWarnStateUpdateForUnmountedComponent = {};

		function warnNoop(publicInstance, callerName) {
		  {
		    var _constructor = publicInstance.constructor;
		    var componentName = _constructor && (_constructor.displayName || _constructor.name) || 'ReactClass';
		    var warningKey = componentName + "." + callerName;

		    if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
		      return;
		    }

		    error("Can't call %s on a component that is not yet mounted. " + 'This is a no-op, but it might indicate a bug in your application. ' + 'Instead, assign to `this.state` directly or define a `state = {};` ' + 'class property with the desired state in the %s component.', callerName, componentName);

		    didWarnStateUpdateForUnmountedComponent[warningKey] = true;
		  }
		}
		/**
		 * This is the abstract API for an update queue.
		 */


		var ReactNoopUpdateQueue = {
		  /**
		   * Checks whether or not this composite component is mounted.
		   * @param {ReactClass} publicInstance The instance we want to test.
		   * @return {boolean} True if mounted, false otherwise.
		   * @protected
		   * @final
		   */
		  isMounted: function (publicInstance) {
		    return false;
		  },

		  /**
		   * Forces an update. This should only be invoked when it is known with
		   * certainty that we are **not** in a DOM transaction.
		   *
		   * You may want to call this when you know that some deeper aspect of the
		   * component's state has changed but `setState` was not called.
		   *
		   * This will not invoke `shouldComponentUpdate`, but it will invoke
		   * `componentWillUpdate` and `componentDidUpdate`.
		   *
		   * @param {ReactClass} publicInstance The instance that should rerender.
		   * @param {?function} callback Called after component is updated.
		   * @param {?string} callerName name of the calling function in the public API.
		   * @internal
		   */
		  enqueueForceUpdate: function (publicInstance, callback, callerName) {
		    warnNoop(publicInstance, 'forceUpdate');
		  },

		  /**
		   * Replaces all of the state. Always use this or `setState` to mutate state.
		   * You should treat `this.state` as immutable.
		   *
		   * There is no guarantee that `this.state` will be immediately updated, so
		   * accessing `this.state` after calling this method may return the old value.
		   *
		   * @param {ReactClass} publicInstance The instance that should rerender.
		   * @param {object} completeState Next state.
		   * @param {?function} callback Called after component is updated.
		   * @param {?string} callerName name of the calling function in the public API.
		   * @internal
		   */
		  enqueueReplaceState: function (publicInstance, completeState, callback, callerName) {
		    warnNoop(publicInstance, 'replaceState');
		  },

		  /**
		   * Sets a subset of the state. This only exists because _pendingState is
		   * internal. This provides a merging strategy that is not available to deep
		   * properties which is confusing. TODO: Expose pendingState or don't use it
		   * during the merge.
		   *
		   * @param {ReactClass} publicInstance The instance that should rerender.
		   * @param {object} partialState Next partial state to be merged with state.
		   * @param {?function} callback Called after component is updated.
		   * @param {?string} Name of the calling function in the public API.
		   * @internal
		   */
		  enqueueSetState: function (publicInstance, partialState, callback, callerName) {
		    warnNoop(publicInstance, 'setState');
		  }
		};

		var assign = Object.assign;

		var emptyObject = {};

		{
		  Object.freeze(emptyObject);
		}
		/**
		 * Base class helpers for the updating state of a component.
		 */


		function Component(props, context, updater) {
		  this.props = props;
		  this.context = context; // If a component has string refs, we will assign a different object later.

		  this.refs = emptyObject; // We initialize the default updater but the real one gets injected by the
		  // renderer.

		  this.updater = updater || ReactNoopUpdateQueue;
		}

		Component.prototype.isReactComponent = {};
		/**
		 * Sets a subset of the state. Always use this to mutate
		 * state. You should treat `this.state` as immutable.
		 *
		 * There is no guarantee that `this.state` will be immediately updated, so
		 * accessing `this.state` after calling this method may return the old value.
		 *
		 * There is no guarantee that calls to `setState` will run synchronously,
		 * as they may eventually be batched together.  You can provide an optional
		 * callback that will be executed when the call to setState is actually
		 * completed.
		 *
		 * When a function is provided to setState, it will be called at some point in
		 * the future (not synchronously). It will be called with the up to date
		 * component arguments (state, props, context). These values can be different
		 * from this.* because your function may be called after receiveProps but before
		 * shouldComponentUpdate, and this new state, props, and context will not yet be
		 * assigned to this.
		 *
		 * @param {object|function} partialState Next partial state or function to
		 *        produce next partial state to be merged with current state.
		 * @param {?function} callback Called after state is updated.
		 * @final
		 * @protected
		 */

		Component.prototype.setState = function (partialState, callback) {
		  if (typeof partialState !== 'object' && typeof partialState !== 'function' && partialState != null) {
		    throw new Error('setState(...): takes an object of state variables to update or a ' + 'function which returns an object of state variables.');
		  }

		  this.updater.enqueueSetState(this, partialState, callback, 'setState');
		};
		/**
		 * Forces an update. This should only be invoked when it is known with
		 * certainty that we are **not** in a DOM transaction.
		 *
		 * You may want to call this when you know that some deeper aspect of the
		 * component's state has changed but `setState` was not called.
		 *
		 * This will not invoke `shouldComponentUpdate`, but it will invoke
		 * `componentWillUpdate` and `componentDidUpdate`.
		 *
		 * @param {?function} callback Called after update is complete.
		 * @final
		 * @protected
		 */


		Component.prototype.forceUpdate = function (callback) {
		  this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
		};
		/**
		 * Deprecated APIs. These APIs used to exist on classic React classes but since
		 * we would like to deprecate them, we're not going to move them over to this
		 * modern base class. Instead, we define a getter that warns if it's accessed.
		 */


		{
		  var deprecatedAPIs = {
		    isMounted: ['isMounted', 'Instead, make sure to clean up subscriptions and pending requests in ' + 'componentWillUnmount to prevent memory leaks.'],
		    replaceState: ['replaceState', 'Refactor your code to use setState instead (see ' + 'https://github.com/facebook/react/issues/3236).']
		  };

		  var defineDeprecationWarning = function (methodName, info) {
		    Object.defineProperty(Component.prototype, methodName, {
		      get: function () {
		        warn('%s(...) is deprecated in plain JavaScript React classes. %s', info[0], info[1]);

		        return undefined;
		      }
		    });
		  };

		  for (var fnName in deprecatedAPIs) {
		    if (deprecatedAPIs.hasOwnProperty(fnName)) {
		      defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
		    }
		  }
		}

		function ComponentDummy() {}

		ComponentDummy.prototype = Component.prototype;
		/**
		 * Convenience component with default shallow equality check for sCU.
		 */

		function PureComponent(props, context, updater) {
		  this.props = props;
		  this.context = context; // If a component has string refs, we will assign a different object later.

		  this.refs = emptyObject;
		  this.updater = updater || ReactNoopUpdateQueue;
		}

		var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
		pureComponentPrototype.constructor = PureComponent; // Avoid an extra prototype jump for these methods.

		assign(pureComponentPrototype, Component.prototype);
		pureComponentPrototype.isPureReactComponent = true;

		// an immutable object with a single mutable value
		function createRef() {
		  var refObject = {
		    current: null
		  };

		  {
		    Object.seal(refObject);
		  }

		  return refObject;
		}

		var isArrayImpl = Array.isArray; // eslint-disable-next-line no-redeclare

		function isArray(a) {
		  return isArrayImpl(a);
		}

		/*
		 * The `'' + value` pattern (used in in perf-sensitive code) throws for Symbol
		 * and Temporal.* types. See https://github.com/facebook/react/pull/22064.
		 *
		 * The functions in this module will throw an easier-to-understand,
		 * easier-to-debug exception with a clear errors message message explaining the
		 * problem. (Instead of a confusing exception thrown inside the implementation
		 * of the `value` object).
		 */
		// $FlowFixMe only called in DEV, so void return is not possible.
		function typeName(value) {
		  {
		    // toStringTag is needed for namespaced types like Temporal.Instant
		    var hasToStringTag = typeof Symbol === 'function' && Symbol.toStringTag;
		    var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || 'Object';
		    return type;
		  }
		} // $FlowFixMe only called in DEV, so void return is not possible.


		function willCoercionThrow(value) {
		  {
		    try {
		      testStringCoercion(value);
		      return false;
		    } catch (e) {
		      return true;
		    }
		  }
		}

		function testStringCoercion(value) {
		  // If you ended up here by following an exception call stack, here's what's
		  // happened: you supplied an object or symbol value to React (as a prop, key,
		  // DOM attribute, CSS property, string ref, etc.) and when React tried to
		  // coerce it to a string using `'' + value`, an exception was thrown.
		  //
		  // The most common types that will cause this exception are `Symbol` instances
		  // and Temporal objects like `Temporal.Instant`. But any object that has a
		  // `valueOf` or `[Symbol.toPrimitive]` method that throws will also cause this
		  // exception. (Library authors do this to prevent users from using built-in
		  // numeric operators like `+` or comparison operators like `>=` because custom
		  // methods are needed to perform accurate arithmetic or comparison.)
		  //
		  // To fix the problem, coerce this object or symbol value to a string before
		  // passing it to React. The most reliable way is usually `String(value)`.
		  //
		  // To find which value is throwing, check the browser or debugger console.
		  // Before this exception was thrown, there should be `console.error` output
		  // that shows the type (Symbol, Temporal.PlainDate, etc.) that caused the
		  // problem and how that type was used: key, atrribute, input value prop, etc.
		  // In most cases, this console output also shows the component and its
		  // ancestor components where the exception happened.
		  //
		  // eslint-disable-next-line react-internal/safe-string-coercion
		  return '' + value;
		}
		function checkKeyStringCoercion(value) {
		  {
		    if (willCoercionThrow(value)) {
		      error('The provided key is an unsupported type %s.' + ' This value must be coerced to a string before before using it here.', typeName(value));

		      return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
		    }
		  }
		}

		function getWrappedName(outerType, innerType, wrapperName) {
		  var displayName = outerType.displayName;

		  if (displayName) {
		    return displayName;
		  }

		  var functionName = innerType.displayName || innerType.name || '';
		  return functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName;
		} // Keep in sync with react-reconciler/getComponentNameFromFiber


		function getContextName(type) {
		  return type.displayName || 'Context';
		} // Note that the reconciler package should generally prefer to use getComponentNameFromFiber() instead.


		function getComponentNameFromType(type) {
		  if (type == null) {
		    // Host root, text node or just invalid type.
		    return null;
		  }

		  {
		    if (typeof type.tag === 'number') {
		      error('Received an unexpected object in getComponentNameFromType(). ' + 'This is likely a bug in React. Please file an issue.');
		    }
		  }

		  if (typeof type === 'function') {
		    return type.displayName || type.name || null;
		  }

		  if (typeof type === 'string') {
		    return type;
		  }

		  switch (type) {
		    case REACT_FRAGMENT_TYPE:
		      return 'Fragment';

		    case REACT_PORTAL_TYPE:
		      return 'Portal';

		    case REACT_PROFILER_TYPE:
		      return 'Profiler';

		    case REACT_STRICT_MODE_TYPE:
		      return 'StrictMode';

		    case REACT_SUSPENSE_TYPE:
		      return 'Suspense';

		    case REACT_SUSPENSE_LIST_TYPE:
		      return 'SuspenseList';

		  }

		  if (typeof type === 'object') {
		    switch (type.$$typeof) {
		      case REACT_CONTEXT_TYPE:
		        var context = type;
		        return getContextName(context) + '.Consumer';

		      case REACT_PROVIDER_TYPE:
		        var provider = type;
		        return getContextName(provider._context) + '.Provider';

		      case REACT_FORWARD_REF_TYPE:
		        return getWrappedName(type, type.render, 'ForwardRef');

		      case REACT_MEMO_TYPE:
		        var outerName = type.displayName || null;

		        if (outerName !== null) {
		          return outerName;
		        }

		        return getComponentNameFromType(type.type) || 'Memo';

		      case REACT_LAZY_TYPE:
		        {
		          var lazyComponent = type;
		          var payload = lazyComponent._payload;
		          var init = lazyComponent._init;

		          try {
		            return getComponentNameFromType(init(payload));
		          } catch (x) {
		            return null;
		          }
		        }

		      // eslint-disable-next-line no-fallthrough
		    }
		  }

		  return null;
		}

		var hasOwnProperty = Object.prototype.hasOwnProperty;

		var RESERVED_PROPS = {
		  key: true,
		  ref: true,
		  __self: true,
		  __source: true
		};
		var specialPropKeyWarningShown, specialPropRefWarningShown, didWarnAboutStringRefs;

		{
		  didWarnAboutStringRefs = {};
		}

		function hasValidRef(config) {
		  {
		    if (hasOwnProperty.call(config, 'ref')) {
		      var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;

		      if (getter && getter.isReactWarning) {
		        return false;
		      }
		    }
		  }

		  return config.ref !== undefined;
		}

		function hasValidKey(config) {
		  {
		    if (hasOwnProperty.call(config, 'key')) {
		      var getter = Object.getOwnPropertyDescriptor(config, 'key').get;

		      if (getter && getter.isReactWarning) {
		        return false;
		      }
		    }
		  }

		  return config.key !== undefined;
		}

		function defineKeyPropWarningGetter(props, displayName) {
		  var warnAboutAccessingKey = function () {
		    {
		      if (!specialPropKeyWarningShown) {
		        specialPropKeyWarningShown = true;

		        error('%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
		      }
		    }
		  };

		  warnAboutAccessingKey.isReactWarning = true;
		  Object.defineProperty(props, 'key', {
		    get: warnAboutAccessingKey,
		    configurable: true
		  });
		}

		function defineRefPropWarningGetter(props, displayName) {
		  var warnAboutAccessingRef = function () {
		    {
		      if (!specialPropRefWarningShown) {
		        specialPropRefWarningShown = true;

		        error('%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
		      }
		    }
		  };

		  warnAboutAccessingRef.isReactWarning = true;
		  Object.defineProperty(props, 'ref', {
		    get: warnAboutAccessingRef,
		    configurable: true
		  });
		}

		function warnIfStringRefCannotBeAutoConverted(config) {
		  {
		    if (typeof config.ref === 'string' && ReactCurrentOwner.current && config.__self && ReactCurrentOwner.current.stateNode !== config.__self) {
		      var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);

		      if (!didWarnAboutStringRefs[componentName]) {
		        error('Component "%s" contains the string ref "%s". ' + 'Support for string refs will be removed in a future major release. ' + 'This case cannot be automatically converted to an arrow function. ' + 'We ask you to manually fix this case by using useRef() or createRef() instead. ' + 'Learn more about using refs safely here: ' + 'https://reactjs.org/link/strict-mode-string-ref', componentName, config.ref);

		        didWarnAboutStringRefs[componentName] = true;
		      }
		    }
		  }
		}
		/**
		 * Factory method to create a new React element. This no longer adheres to
		 * the class pattern, so do not use new to call it. Also, instanceof check
		 * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
		 * if something is a React Element.
		 *
		 * @param {*} type
		 * @param {*} props
		 * @param {*} key
		 * @param {string|object} ref
		 * @param {*} owner
		 * @param {*} self A *temporary* helper to detect places where `this` is
		 * different from the `owner` when React.createElement is called, so that we
		 * can warn. We want to get rid of owner and replace string `ref`s with arrow
		 * functions, and as long as `this` and owner are the same, there will be no
		 * change in behavior.
		 * @param {*} source An annotation object (added by a transpiler or otherwise)
		 * indicating filename, line number, and/or other information.
		 * @internal
		 */


		var ReactElement = function (type, key, ref, self, source, owner, props) {
		  var element = {
		    // This tag allows us to uniquely identify this as a React Element
		    $$typeof: REACT_ELEMENT_TYPE,
		    // Built-in properties that belong on the element
		    type: type,
		    key: key,
		    ref: ref,
		    props: props,
		    // Record the component responsible for creating this element.
		    _owner: owner
		  };

		  {
		    // The validation flag is currently mutative. We put it on
		    // an external backing store so that we can freeze the whole object.
		    // This can be replaced with a WeakMap once they are implemented in
		    // commonly used development environments.
		    element._store = {}; // To make comparing ReactElements easier for testing purposes, we make
		    // the validation flag non-enumerable (where possible, which should
		    // include every environment we run tests in), so the test framework
		    // ignores it.

		    Object.defineProperty(element._store, 'validated', {
		      configurable: false,
		      enumerable: false,
		      writable: true,
		      value: false
		    }); // self and source are DEV only properties.

		    Object.defineProperty(element, '_self', {
		      configurable: false,
		      enumerable: false,
		      writable: false,
		      value: self
		    }); // Two elements created in two different places should be considered
		    // equal for testing purposes and therefore we hide it from enumeration.

		    Object.defineProperty(element, '_source', {
		      configurable: false,
		      enumerable: false,
		      writable: false,
		      value: source
		    });

		    if (Object.freeze) {
		      Object.freeze(element.props);
		      Object.freeze(element);
		    }
		  }

		  return element;
		};
		/**
		 * Create and return a new ReactElement of the given type.
		 * See https://reactjs.org/docs/react-api.html#createelement
		 */

		function createElement(type, config, children) {
		  var propName; // Reserved names are extracted

		  var props = {};
		  var key = null;
		  var ref = null;
		  var self = null;
		  var source = null;

		  if (config != null) {
		    if (hasValidRef(config)) {
		      ref = config.ref;

		      {
		        warnIfStringRefCannotBeAutoConverted(config);
		      }
		    }

		    if (hasValidKey(config)) {
		      {
		        checkKeyStringCoercion(config.key);
		      }

		      key = '' + config.key;
		    }

		    self = config.__self === undefined ? null : config.__self;
		    source = config.__source === undefined ? null : config.__source; // Remaining properties are added to a new props object

		    for (propName in config) {
		      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
		        props[propName] = config[propName];
		      }
		    }
		  } // Children can be more than one argument, and those are transferred onto
		  // the newly allocated props object.


		  var childrenLength = arguments.length - 2;

		  if (childrenLength === 1) {
		    props.children = children;
		  } else if (childrenLength > 1) {
		    var childArray = Array(childrenLength);

		    for (var i = 0; i < childrenLength; i++) {
		      childArray[i] = arguments[i + 2];
		    }

		    {
		      if (Object.freeze) {
		        Object.freeze(childArray);
		      }
		    }

		    props.children = childArray;
		  } // Resolve default props


		  if (type && type.defaultProps) {
		    var defaultProps = type.defaultProps;

		    for (propName in defaultProps) {
		      if (props[propName] === undefined) {
		        props[propName] = defaultProps[propName];
		      }
		    }
		  }

		  {
		    if (key || ref) {
		      var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;

		      if (key) {
		        defineKeyPropWarningGetter(props, displayName);
		      }

		      if (ref) {
		        defineRefPropWarningGetter(props, displayName);
		      }
		    }
		  }

		  return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
		}
		function cloneAndReplaceKey(oldElement, newKey) {
		  var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);
		  return newElement;
		}
		/**
		 * Clone and return a new ReactElement using element as the starting point.
		 * See https://reactjs.org/docs/react-api.html#cloneelement
		 */

		function cloneElement(element, config, children) {
		  if (element === null || element === undefined) {
		    throw new Error("React.cloneElement(...): The argument must be a React element, but you passed " + element + ".");
		  }

		  var propName; // Original props are copied

		  var props = assign({}, element.props); // Reserved names are extracted

		  var key = element.key;
		  var ref = element.ref; // Self is preserved since the owner is preserved.

		  var self = element._self; // Source is preserved since cloneElement is unlikely to be targeted by a
		  // transpiler, and the original source is probably a better indicator of the
		  // true owner.

		  var source = element._source; // Owner will be preserved, unless ref is overridden

		  var owner = element._owner;

		  if (config != null) {
		    if (hasValidRef(config)) {
		      // Silently steal the ref from the parent.
		      ref = config.ref;
		      owner = ReactCurrentOwner.current;
		    }

		    if (hasValidKey(config)) {
		      {
		        checkKeyStringCoercion(config.key);
		      }

		      key = '' + config.key;
		    } // Remaining properties override existing props


		    var defaultProps;

		    if (element.type && element.type.defaultProps) {
		      defaultProps = element.type.defaultProps;
		    }

		    for (propName in config) {
		      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
		        if (config[propName] === undefined && defaultProps !== undefined) {
		          // Resolve default props
		          props[propName] = defaultProps[propName];
		        } else {
		          props[propName] = config[propName];
		        }
		      }
		    }
		  } // Children can be more than one argument, and those are transferred onto
		  // the newly allocated props object.


		  var childrenLength = arguments.length - 2;

		  if (childrenLength === 1) {
		    props.children = children;
		  } else if (childrenLength > 1) {
		    var childArray = Array(childrenLength);

		    for (var i = 0; i < childrenLength; i++) {
		      childArray[i] = arguments[i + 2];
		    }

		    props.children = childArray;
		  }

		  return ReactElement(element.type, key, ref, self, source, owner, props);
		}
		/**
		 * Verifies the object is a ReactElement.
		 * See https://reactjs.org/docs/react-api.html#isvalidelement
		 * @param {?object} object
		 * @return {boolean} True if `object` is a ReactElement.
		 * @final
		 */

		function isValidElement(object) {
		  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
		}

		var SEPARATOR = '.';
		var SUBSEPARATOR = ':';
		/**
		 * Escape and wrap key so it is safe to use as a reactid
		 *
		 * @param {string} key to be escaped.
		 * @return {string} the escaped key.
		 */

		function escape(key) {
		  var escapeRegex = /[=:]/g;
		  var escaperLookup = {
		    '=': '=0',
		    ':': '=2'
		  };
		  var escapedString = key.replace(escapeRegex, function (match) {
		    return escaperLookup[match];
		  });
		  return '$' + escapedString;
		}
		/**
		 * TODO: Test that a single child and an array with one item have the same key
		 * pattern.
		 */


		var didWarnAboutMaps = false;
		var userProvidedKeyEscapeRegex = /\/+/g;

		function escapeUserProvidedKey(text) {
		  return text.replace(userProvidedKeyEscapeRegex, '$&/');
		}
		/**
		 * Generate a key string that identifies a element within a set.
		 *
		 * @param {*} element A element that could contain a manual key.
		 * @param {number} index Index that is used if a manual key is not provided.
		 * @return {string}
		 */


		function getElementKey(element, index) {
		  // Do some typechecking here since we call this blindly. We want to ensure
		  // that we don't block potential future ES APIs.
		  if (typeof element === 'object' && element !== null && element.key != null) {
		    // Explicit key
		    {
		      checkKeyStringCoercion(element.key);
		    }

		    return escape('' + element.key);
		  } // Implicit key determined by the index in the set


		  return index.toString(36);
		}

		function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
		  var type = typeof children;

		  if (type === 'undefined' || type === 'boolean') {
		    // All of the above are perceived as null.
		    children = null;
		  }

		  var invokeCallback = false;

		  if (children === null) {
		    invokeCallback = true;
		  } else {
		    switch (type) {
		      case 'string':
		      case 'number':
		        invokeCallback = true;
		        break;

		      case 'object':
		        switch (children.$$typeof) {
		          case REACT_ELEMENT_TYPE:
		          case REACT_PORTAL_TYPE:
		            invokeCallback = true;
		        }

		    }
		  }

		  if (invokeCallback) {
		    var _child = children;
		    var mappedChild = callback(_child); // If it's the only child, treat the name as if it was wrapped in an array
		    // so that it's consistent if the number of children grows:

		    var childKey = nameSoFar === '' ? SEPARATOR + getElementKey(_child, 0) : nameSoFar;

		    if (isArray(mappedChild)) {
		      var escapedChildKey = '';

		      if (childKey != null) {
		        escapedChildKey = escapeUserProvidedKey(childKey) + '/';
		      }

		      mapIntoArray(mappedChild, array, escapedChildKey, '', function (c) {
		        return c;
		      });
		    } else if (mappedChild != null) {
		      if (isValidElement(mappedChild)) {
		        {
		          // The `if` statement here prevents auto-disabling of the safe
		          // coercion ESLint rule, so we must manually disable it below.
		          // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
		          if (mappedChild.key && (!_child || _child.key !== mappedChild.key)) {
		            checkKeyStringCoercion(mappedChild.key);
		          }
		        }

		        mappedChild = cloneAndReplaceKey(mappedChild, // Keep both the (mapped) and old keys if they differ, just as
		        // traverseAllChildren used to do for objects as children
		        escapedPrefix + ( // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
		        mappedChild.key && (!_child || _child.key !== mappedChild.key) ? // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
		        // eslint-disable-next-line react-internal/safe-string-coercion
		        escapeUserProvidedKey('' + mappedChild.key) + '/' : '') + childKey);
		      }

		      array.push(mappedChild);
		    }

		    return 1;
		  }

		  var child;
		  var nextName;
		  var subtreeCount = 0; // Count of children found in the current subtree.

		  var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

		  if (isArray(children)) {
		    for (var i = 0; i < children.length; i++) {
		      child = children[i];
		      nextName = nextNamePrefix + getElementKey(child, i);
		      subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
		    }
		  } else {
		    var iteratorFn = getIteratorFn(children);

		    if (typeof iteratorFn === 'function') {
		      var iterableChildren = children;

		      {
		        // Warn about using Maps as children
		        if (iteratorFn === iterableChildren.entries) {
		          if (!didWarnAboutMaps) {
		            warn('Using Maps as children is not supported. ' + 'Use an array of keyed ReactElements instead.');
		          }

		          didWarnAboutMaps = true;
		        }
		      }

		      var iterator = iteratorFn.call(iterableChildren);
		      var step;
		      var ii = 0;

		      while (!(step = iterator.next()).done) {
		        child = step.value;
		        nextName = nextNamePrefix + getElementKey(child, ii++);
		        subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
		      }
		    } else if (type === 'object') {
		      // eslint-disable-next-line react-internal/safe-string-coercion
		      var childrenString = String(children);
		      throw new Error("Objects are not valid as a React child (found: " + (childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString) + "). " + 'If you meant to render a collection of children, use an array ' + 'instead.');
		    }
		  }

		  return subtreeCount;
		}

		/**
		 * Maps children that are typically specified as `props.children`.
		 *
		 * See https://reactjs.org/docs/react-api.html#reactchildrenmap
		 *
		 * The provided mapFunction(child, index) will be called for each
		 * leaf child.
		 *
		 * @param {?*} children Children tree container.
		 * @param {function(*, int)} func The map function.
		 * @param {*} context Context for mapFunction.
		 * @return {object} Object containing the ordered map of results.
		 */
		function mapChildren(children, func, context) {
		  if (children == null) {
		    return children;
		  }

		  var result = [];
		  var count = 0;
		  mapIntoArray(children, result, '', '', function (child) {
		    return func.call(context, child, count++);
		  });
		  return result;
		}
		/**
		 * Count the number of children that are typically specified as
		 * `props.children`.
		 *
		 * See https://reactjs.org/docs/react-api.html#reactchildrencount
		 *
		 * @param {?*} children Children tree container.
		 * @return {number} The number of children.
		 */


		function countChildren(children) {
		  var n = 0;
		  mapChildren(children, function () {
		    n++; // Don't return anything
		  });
		  return n;
		}

		/**
		 * Iterates through children that are typically specified as `props.children`.
		 *
		 * See https://reactjs.org/docs/react-api.html#reactchildrenforeach
		 *
		 * The provided forEachFunc(child, index) will be called for each
		 * leaf child.
		 *
		 * @param {?*} children Children tree container.
		 * @param {function(*, int)} forEachFunc
		 * @param {*} forEachContext Context for forEachContext.
		 */
		function forEachChildren(children, forEachFunc, forEachContext) {
		  mapChildren(children, function () {
		    forEachFunc.apply(this, arguments); // Don't return anything.
		  }, forEachContext);
		}
		/**
		 * Flatten a children object (typically specified as `props.children`) and
		 * return an array with appropriately re-keyed children.
		 *
		 * See https://reactjs.org/docs/react-api.html#reactchildrentoarray
		 */


		function toArray(children) {
		  return mapChildren(children, function (child) {
		    return child;
		  }) || [];
		}
		/**
		 * Returns the first child in a collection of children and verifies that there
		 * is only one child in the collection.
		 *
		 * See https://reactjs.org/docs/react-api.html#reactchildrenonly
		 *
		 * The current implementation of this function assumes that a single child gets
		 * passed without a wrapper, but the purpose of this helper function is to
		 * abstract away the particular structure of children.
		 *
		 * @param {?object} children Child collection structure.
		 * @return {ReactElement} The first and only `ReactElement` contained in the
		 * structure.
		 */


		function onlyChild(children) {
		  if (!isValidElement(children)) {
		    throw new Error('React.Children.only expected to receive a single React element child.');
		  }

		  return children;
		}

		function createContext(defaultValue) {
		  // TODO: Second argument used to be an optional `calculateChangedBits`
		  // function. Warn to reserve for future use?
		  var context = {
		    $$typeof: REACT_CONTEXT_TYPE,
		    // As a workaround to support multiple concurrent renderers, we categorize
		    // some renderers as primary and others as secondary. We only expect
		    // there to be two concurrent renderers at most: React Native (primary) and
		    // Fabric (secondary); React DOM (primary) and React ART (secondary).
		    // Secondary renderers store their context values on separate fields.
		    _currentValue: defaultValue,
		    _currentValue2: defaultValue,
		    // Used to track how many concurrent renderers this context currently
		    // supports within in a single renderer. Such as parallel server rendering.
		    _threadCount: 0,
		    // These are circular
		    Provider: null,
		    Consumer: null,
		    // Add these to use same hidden class in VM as ServerContext
		    _defaultValue: null,
		    _globalName: null
		  };
		  context.Provider = {
		    $$typeof: REACT_PROVIDER_TYPE,
		    _context: context
		  };
		  var hasWarnedAboutUsingNestedContextConsumers = false;
		  var hasWarnedAboutUsingConsumerProvider = false;
		  var hasWarnedAboutDisplayNameOnConsumer = false;

		  {
		    // A separate object, but proxies back to the original context object for
		    // backwards compatibility. It has a different $$typeof, so we can properly
		    // warn for the incorrect usage of Context as a Consumer.
		    var Consumer = {
		      $$typeof: REACT_CONTEXT_TYPE,
		      _context: context
		    }; // $FlowFixMe: Flow complains about not setting a value, which is intentional here

		    Object.defineProperties(Consumer, {
		      Provider: {
		        get: function () {
		          if (!hasWarnedAboutUsingConsumerProvider) {
		            hasWarnedAboutUsingConsumerProvider = true;

		            error('Rendering <Context.Consumer.Provider> is not supported and will be removed in ' + 'a future major release. Did you mean to render <Context.Provider> instead?');
		          }

		          return context.Provider;
		        },
		        set: function (_Provider) {
		          context.Provider = _Provider;
		        }
		      },
		      _currentValue: {
		        get: function () {
		          return context._currentValue;
		        },
		        set: function (_currentValue) {
		          context._currentValue = _currentValue;
		        }
		      },
		      _currentValue2: {
		        get: function () {
		          return context._currentValue2;
		        },
		        set: function (_currentValue2) {
		          context._currentValue2 = _currentValue2;
		        }
		      },
		      _threadCount: {
		        get: function () {
		          return context._threadCount;
		        },
		        set: function (_threadCount) {
		          context._threadCount = _threadCount;
		        }
		      },
		      Consumer: {
		        get: function () {
		          if (!hasWarnedAboutUsingNestedContextConsumers) {
		            hasWarnedAboutUsingNestedContextConsumers = true;

		            error('Rendering <Context.Consumer.Consumer> is not supported and will be removed in ' + 'a future major release. Did you mean to render <Context.Consumer> instead?');
		          }

		          return context.Consumer;
		        }
		      },
		      displayName: {
		        get: function () {
		          return context.displayName;
		        },
		        set: function (displayName) {
		          if (!hasWarnedAboutDisplayNameOnConsumer) {
		            warn('Setting `displayName` on Context.Consumer has no effect. ' + "You should set it directly on the context with Context.displayName = '%s'.", displayName);

		            hasWarnedAboutDisplayNameOnConsumer = true;
		          }
		        }
		      }
		    }); // $FlowFixMe: Flow complains about missing properties because it doesn't understand defineProperty

		    context.Consumer = Consumer;
		  }

		  {
		    context._currentRenderer = null;
		    context._currentRenderer2 = null;
		  }

		  return context;
		}

		var Uninitialized = -1;
		var Pending = 0;
		var Resolved = 1;
		var Rejected = 2;

		function lazyInitializer(payload) {
		  if (payload._status === Uninitialized) {
		    var ctor = payload._result;
		    var thenable = ctor(); // Transition to the next state.
		    // This might throw either because it's missing or throws. If so, we treat it
		    // as still uninitialized and try again next time. Which is the same as what
		    // happens if the ctor or any wrappers processing the ctor throws. This might
		    // end up fixing it if the resolution was a concurrency bug.

		    thenable.then(function (moduleObject) {
		      if (payload._status === Pending || payload._status === Uninitialized) {
		        // Transition to the next state.
		        var resolved = payload;
		        resolved._status = Resolved;
		        resolved._result = moduleObject;
		      }
		    }, function (error) {
		      if (payload._status === Pending || payload._status === Uninitialized) {
		        // Transition to the next state.
		        var rejected = payload;
		        rejected._status = Rejected;
		        rejected._result = error;
		      }
		    });

		    if (payload._status === Uninitialized) {
		      // In case, we're still uninitialized, then we're waiting for the thenable
		      // to resolve. Set it as pending in the meantime.
		      var pending = payload;
		      pending._status = Pending;
		      pending._result = thenable;
		    }
		  }

		  if (payload._status === Resolved) {
		    var moduleObject = payload._result;

		    {
		      if (moduleObject === undefined) {
		        error('lazy: Expected the result of a dynamic imp' + 'ort() call. ' + 'Instead received: %s\n\nYour code should look like: \n  ' + // Break up imports to avoid accidentally parsing them as dependencies.
		        'const MyComponent = lazy(() => imp' + "ort('./MyComponent'))\n\n" + 'Did you accidentally put curly braces around the import?', moduleObject);
		      }
		    }

		    {
		      if (!('default' in moduleObject)) {
		        error('lazy: Expected the result of a dynamic imp' + 'ort() call. ' + 'Instead received: %s\n\nYour code should look like: \n  ' + // Break up imports to avoid accidentally parsing them as dependencies.
		        'const MyComponent = lazy(() => imp' + "ort('./MyComponent'))", moduleObject);
		      }
		    }

		    return moduleObject.default;
		  } else {
		    throw payload._result;
		  }
		}

		function lazy(ctor) {
		  var payload = {
		    // We use these fields to store the result.
		    _status: Uninitialized,
		    _result: ctor
		  };
		  var lazyType = {
		    $$typeof: REACT_LAZY_TYPE,
		    _payload: payload,
		    _init: lazyInitializer
		  };

		  {
		    // In production, this would just set it on the object.
		    var defaultProps;
		    var propTypes; // $FlowFixMe

		    Object.defineProperties(lazyType, {
		      defaultProps: {
		        configurable: true,
		        get: function () {
		          return defaultProps;
		        },
		        set: function (newDefaultProps) {
		          error('React.lazy(...): It is not supported to assign `defaultProps` to ' + 'a lazy component import. Either specify them where the component ' + 'is defined, or create a wrapping component around it.');

		          defaultProps = newDefaultProps; // Match production behavior more closely:
		          // $FlowFixMe

		          Object.defineProperty(lazyType, 'defaultProps', {
		            enumerable: true
		          });
		        }
		      },
		      propTypes: {
		        configurable: true,
		        get: function () {
		          return propTypes;
		        },
		        set: function (newPropTypes) {
		          error('React.lazy(...): It is not supported to assign `propTypes` to ' + 'a lazy component import. Either specify them where the component ' + 'is defined, or create a wrapping component around it.');

		          propTypes = newPropTypes; // Match production behavior more closely:
		          // $FlowFixMe

		          Object.defineProperty(lazyType, 'propTypes', {
		            enumerable: true
		          });
		        }
		      }
		    });
		  }

		  return lazyType;
		}

		function forwardRef(render) {
		  {
		    if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
		      error('forwardRef requires a render function but received a `memo` ' + 'component. Instead of forwardRef(memo(...)), use ' + 'memo(forwardRef(...)).');
		    } else if (typeof render !== 'function') {
		      error('forwardRef requires a render function but was given %s.', render === null ? 'null' : typeof render);
		    } else {
		      if (render.length !== 0 && render.length !== 2) {
		        error('forwardRef render functions accept exactly two parameters: props and ref. %s', render.length === 1 ? 'Did you forget to use the ref parameter?' : 'Any additional parameter will be undefined.');
		      }
		    }

		    if (render != null) {
		      if (render.defaultProps != null || render.propTypes != null) {
		        error('forwardRef render functions do not support propTypes or defaultProps. ' + 'Did you accidentally pass a React component?');
		      }
		    }
		  }

		  var elementType = {
		    $$typeof: REACT_FORWARD_REF_TYPE,
		    render: render
		  };

		  {
		    var ownName;
		    Object.defineProperty(elementType, 'displayName', {
		      enumerable: false,
		      configurable: true,
		      get: function () {
		        return ownName;
		      },
		      set: function (name) {
		        ownName = name; // The inner component shouldn't inherit this display name in most cases,
		        // because the component may be used elsewhere.
		        // But it's nice for anonymous functions to inherit the name,
		        // so that our component-stack generation logic will display their frames.
		        // An anonymous function generally suggests a pattern like:
		        //   React.forwardRef((props, ref) => {...});
		        // This kind of inner function is not used elsewhere so the side effect is okay.

		        if (!render.name && !render.displayName) {
		          render.displayName = name;
		        }
		      }
		    });
		  }

		  return elementType;
		}

		var REACT_MODULE_REFERENCE;

		{
		  REACT_MODULE_REFERENCE = Symbol.for('react.module.reference');
		}

		function isValidElementType(type) {
		  if (typeof type === 'string' || typeof type === 'function') {
		    return true;
		  } // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).


		  if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing  || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden  || type === REACT_OFFSCREEN_TYPE || enableScopeAPI  || enableCacheElement  || enableTransitionTracing ) {
		    return true;
		  }

		  if (typeof type === 'object' && type !== null) {
		    if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
		    // types supported by any Flight configuration anywhere since
		    // we don't know which Flight build this will end up being used
		    // with.
		    type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== undefined) {
		      return true;
		    }
		  }

		  return false;
		}

		function memo(type, compare) {
		  {
		    if (!isValidElementType(type)) {
		      error('memo: The first argument must be a component. Instead ' + 'received: %s', type === null ? 'null' : typeof type);
		    }
		  }

		  var elementType = {
		    $$typeof: REACT_MEMO_TYPE,
		    type: type,
		    compare: compare === undefined ? null : compare
		  };

		  {
		    var ownName;
		    Object.defineProperty(elementType, 'displayName', {
		      enumerable: false,
		      configurable: true,
		      get: function () {
		        return ownName;
		      },
		      set: function (name) {
		        ownName = name; // The inner component shouldn't inherit this display name in most cases,
		        // because the component may be used elsewhere.
		        // But it's nice for anonymous functions to inherit the name,
		        // so that our component-stack generation logic will display their frames.
		        // An anonymous function generally suggests a pattern like:
		        //   React.memo((props) => {...});
		        // This kind of inner function is not used elsewhere so the side effect is okay.

		        if (!type.name && !type.displayName) {
		          type.displayName = name;
		        }
		      }
		    });
		  }

		  return elementType;
		}

		function resolveDispatcher() {
		  var dispatcher = ReactCurrentDispatcher.current;

		  {
		    if (dispatcher === null) {
		      error('Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for' + ' one of the following reasons:\n' + '1. You might have mismatching versions of React and the renderer (such as React DOM)\n' + '2. You might be breaking the Rules of Hooks\n' + '3. You might have more than one copy of React in the same app\n' + 'See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.');
		    }
		  } // Will result in a null access error if accessed outside render phase. We
		  // intentionally don't throw our own error because this is in a hot path.
		  // Also helps ensure this is inlined.


		  return dispatcher;
		}
		function useContext(Context) {
		  var dispatcher = resolveDispatcher();

		  {
		    // TODO: add a more generic warning for invalid values.
		    if (Context._context !== undefined) {
		      var realContext = Context._context; // Don't deduplicate because this legitimately causes bugs
		      // and nobody should be using this in existing code.

		      if (realContext.Consumer === Context) {
		        error('Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be ' + 'removed in a future major release. Did you mean to call useContext(Context) instead?');
		      } else if (realContext.Provider === Context) {
		        error('Calling useContext(Context.Provider) is not supported. ' + 'Did you mean to call useContext(Context) instead?');
		      }
		    }
		  }

		  return dispatcher.useContext(Context);
		}
		function useState(initialState) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useState(initialState);
		}
		function useReducer(reducer, initialArg, init) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useReducer(reducer, initialArg, init);
		}
		function useRef(initialValue) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useRef(initialValue);
		}
		function useEffect(create, deps) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useEffect(create, deps);
		}
		function useInsertionEffect(create, deps) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useInsertionEffect(create, deps);
		}
		function useLayoutEffect(create, deps) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useLayoutEffect(create, deps);
		}
		function useCallback(callback, deps) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useCallback(callback, deps);
		}
		function useMemo(create, deps) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useMemo(create, deps);
		}
		function useImperativeHandle(ref, create, deps) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useImperativeHandle(ref, create, deps);
		}
		function useDebugValue(value, formatterFn) {
		  {
		    var dispatcher = resolveDispatcher();
		    return dispatcher.useDebugValue(value, formatterFn);
		  }
		}
		function useTransition() {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useTransition();
		}
		function useDeferredValue(value) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useDeferredValue(value);
		}
		function useId() {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useId();
		}
		function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
		}

		// Helpers to patch console.logs to avoid logging during side-effect free
		// replaying on render function. This currently only patches the object
		// lazily which won't cover if the log function was extracted eagerly.
		// We could also eagerly patch the method.
		var disabledDepth = 0;
		var prevLog;
		var prevInfo;
		var prevWarn;
		var prevError;
		var prevGroup;
		var prevGroupCollapsed;
		var prevGroupEnd;

		function disabledLog() {}

		disabledLog.__reactDisabledLog = true;
		function disableLogs() {
		  {
		    if (disabledDepth === 0) {
		      /* eslint-disable react-internal/no-production-logging */
		      prevLog = console.log;
		      prevInfo = console.info;
		      prevWarn = console.warn;
		      prevError = console.error;
		      prevGroup = console.group;
		      prevGroupCollapsed = console.groupCollapsed;
		      prevGroupEnd = console.groupEnd; // https://github.com/facebook/react/issues/19099

		      var props = {
		        configurable: true,
		        enumerable: true,
		        value: disabledLog,
		        writable: true
		      }; // $FlowFixMe Flow thinks console is immutable.

		      Object.defineProperties(console, {
		        info: props,
		        log: props,
		        warn: props,
		        error: props,
		        group: props,
		        groupCollapsed: props,
		        groupEnd: props
		      });
		      /* eslint-enable react-internal/no-production-logging */
		    }

		    disabledDepth++;
		  }
		}
		function reenableLogs() {
		  {
		    disabledDepth--;

		    if (disabledDepth === 0) {
		      /* eslint-disable react-internal/no-production-logging */
		      var props = {
		        configurable: true,
		        enumerable: true,
		        writable: true
		      }; // $FlowFixMe Flow thinks console is immutable.

		      Object.defineProperties(console, {
		        log: assign({}, props, {
		          value: prevLog
		        }),
		        info: assign({}, props, {
		          value: prevInfo
		        }),
		        warn: assign({}, props, {
		          value: prevWarn
		        }),
		        error: assign({}, props, {
		          value: prevError
		        }),
		        group: assign({}, props, {
		          value: prevGroup
		        }),
		        groupCollapsed: assign({}, props, {
		          value: prevGroupCollapsed
		        }),
		        groupEnd: assign({}, props, {
		          value: prevGroupEnd
		        })
		      });
		      /* eslint-enable react-internal/no-production-logging */
		    }

		    if (disabledDepth < 0) {
		      error('disabledDepth fell below zero. ' + 'This is a bug in React. Please file an issue.');
		    }
		  }
		}

		var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;
		var prefix;
		function describeBuiltInComponentFrame(name, source, ownerFn) {
		  {
		    if (prefix === undefined) {
		      // Extract the VM specific prefix used by each line.
		      try {
		        throw Error();
		      } catch (x) {
		        var match = x.stack.trim().match(/\n( *(at )?)/);
		        prefix = match && match[1] || '';
		      }
		    } // We use the prefix to ensure our stacks line up with native stack frames.


		    return '\n' + prefix + name;
		  }
		}
		var reentry = false;
		var componentFrameCache;

		{
		  var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
		  componentFrameCache = new PossiblyWeakMap();
		}

		function describeNativeComponentFrame(fn, construct) {
		  // If something asked for a stack inside a fake render, it should get ignored.
		  if ( !fn || reentry) {
		    return '';
		  }

		  {
		    var frame = componentFrameCache.get(fn);

		    if (frame !== undefined) {
		      return frame;
		    }
		  }

		  var control;
		  reentry = true;
		  var previousPrepareStackTrace = Error.prepareStackTrace; // $FlowFixMe It does accept undefined.

		  Error.prepareStackTrace = undefined;
		  var previousDispatcher;

		  {
		    previousDispatcher = ReactCurrentDispatcher$1.current; // Set the dispatcher in DEV because this might be call in the render function
		    // for warnings.

		    ReactCurrentDispatcher$1.current = null;
		    disableLogs();
		  }

		  try {
		    // This should throw.
		    if (construct) {
		      // Something should be setting the props in the constructor.
		      var Fake = function () {
		        throw Error();
		      }; // $FlowFixMe


		      Object.defineProperty(Fake.prototype, 'props', {
		        set: function () {
		          // We use a throwing setter instead of frozen or non-writable props
		          // because that won't throw in a non-strict mode function.
		          throw Error();
		        }
		      });

		      if (typeof Reflect === 'object' && Reflect.construct) {
		        // We construct a different control for this case to include any extra
		        // frames added by the construct call.
		        try {
		          Reflect.construct(Fake, []);
		        } catch (x) {
		          control = x;
		        }

		        Reflect.construct(fn, [], Fake);
		      } else {
		        try {
		          Fake.call();
		        } catch (x) {
		          control = x;
		        }

		        fn.call(Fake.prototype);
		      }
		    } else {
		      try {
		        throw Error();
		      } catch (x) {
		        control = x;
		      }

		      fn();
		    }
		  } catch (sample) {
		    // This is inlined manually because closure doesn't do it for us.
		    if (sample && control && typeof sample.stack === 'string') {
		      // This extracts the first frame from the sample that isn't also in the control.
		      // Skipping one frame that we assume is the frame that calls the two.
		      var sampleLines = sample.stack.split('\n');
		      var controlLines = control.stack.split('\n');
		      var s = sampleLines.length - 1;
		      var c = controlLines.length - 1;

		      while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
		        // We expect at least one stack frame to be shared.
		        // Typically this will be the root most one. However, stack frames may be
		        // cut off due to maximum stack limits. In this case, one maybe cut off
		        // earlier than the other. We assume that the sample is longer or the same
		        // and there for cut off earlier. So we should find the root most frame in
		        // the sample somewhere in the control.
		        c--;
		      }

		      for (; s >= 1 && c >= 0; s--, c--) {
		        // Next we find the first one that isn't the same which should be the
		        // frame that called our sample function and the control.
		        if (sampleLines[s] !== controlLines[c]) {
		          // In V8, the first line is describing the message but other VMs don't.
		          // If we're about to return the first line, and the control is also on the same
		          // line, that's a pretty good indicator that our sample threw at same line as
		          // the control. I.e. before we entered the sample frame. So we ignore this result.
		          // This can happen if you passed a class to function component, or non-function.
		          if (s !== 1 || c !== 1) {
		            do {
		              s--;
		              c--; // We may still have similar intermediate frames from the construct call.
		              // The next one that isn't the same should be our match though.

		              if (c < 0 || sampleLines[s] !== controlLines[c]) {
		                // V8 adds a "new" prefix for native classes. Let's remove it to make it prettier.
		                var _frame = '\n' + sampleLines[s].replace(' at new ', ' at '); // If our component frame is labeled "<anonymous>"
		                // but we have a user-provided "displayName"
		                // splice it in to make the stack more readable.


		                if (fn.displayName && _frame.includes('<anonymous>')) {
		                  _frame = _frame.replace('<anonymous>', fn.displayName);
		                }

		                {
		                  if (typeof fn === 'function') {
		                    componentFrameCache.set(fn, _frame);
		                  }
		                } // Return the line we found.


		                return _frame;
		              }
		            } while (s >= 1 && c >= 0);
		          }

		          break;
		        }
		      }
		    }
		  } finally {
		    reentry = false;

		    {
		      ReactCurrentDispatcher$1.current = previousDispatcher;
		      reenableLogs();
		    }

		    Error.prepareStackTrace = previousPrepareStackTrace;
		  } // Fallback to just using the name if we couldn't make it throw.


		  var name = fn ? fn.displayName || fn.name : '';
		  var syntheticFrame = name ? describeBuiltInComponentFrame(name) : '';

		  {
		    if (typeof fn === 'function') {
		      componentFrameCache.set(fn, syntheticFrame);
		    }
		  }

		  return syntheticFrame;
		}
		function describeFunctionComponentFrame(fn, source, ownerFn) {
		  {
		    return describeNativeComponentFrame(fn, false);
		  }
		}

		function shouldConstruct(Component) {
		  var prototype = Component.prototype;
		  return !!(prototype && prototype.isReactComponent);
		}

		function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {

		  if (type == null) {
		    return '';
		  }

		  if (typeof type === 'function') {
		    {
		      return describeNativeComponentFrame(type, shouldConstruct(type));
		    }
		  }

		  if (typeof type === 'string') {
		    return describeBuiltInComponentFrame(type);
		  }

		  switch (type) {
		    case REACT_SUSPENSE_TYPE:
		      return describeBuiltInComponentFrame('Suspense');

		    case REACT_SUSPENSE_LIST_TYPE:
		      return describeBuiltInComponentFrame('SuspenseList');
		  }

		  if (typeof type === 'object') {
		    switch (type.$$typeof) {
		      case REACT_FORWARD_REF_TYPE:
		        return describeFunctionComponentFrame(type.render);

		      case REACT_MEMO_TYPE:
		        // Memo may contain any component type so we recursively resolve it.
		        return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);

		      case REACT_LAZY_TYPE:
		        {
		          var lazyComponent = type;
		          var payload = lazyComponent._payload;
		          var init = lazyComponent._init;

		          try {
		            // Lazy may contain any component type so we recursively resolve it.
		            return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
		          } catch (x) {}
		        }
		    }
		  }

		  return '';
		}

		var loggedTypeFailures = {};
		var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;

		function setCurrentlyValidatingElement(element) {
		  {
		    if (element) {
		      var owner = element._owner;
		      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
		      ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
		    } else {
		      ReactDebugCurrentFrame$1.setExtraStackFrame(null);
		    }
		  }
		}

		function checkPropTypes(typeSpecs, values, location, componentName, element) {
		  {
		    // $FlowFixMe This is okay but Flow doesn't know it.
		    var has = Function.call.bind(hasOwnProperty);

		    for (var typeSpecName in typeSpecs) {
		      if (has(typeSpecs, typeSpecName)) {
		        var error$1 = void 0; // Prop type validation may throw. In case they do, we don't want to
		        // fail the render phase where it didn't fail before. So we log it.
		        // After these have been cleaned up, we'll let them throw.

		        try {
		          // This is intentionally an invariant that gets caught. It's the same
		          // behavior as without this statement except with a better message.
		          if (typeof typeSpecs[typeSpecName] !== 'function') {
		            // eslint-disable-next-line react-internal/prod-error-codes
		            var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' + 'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.');
		            err.name = 'Invariant Violation';
		            throw err;
		          }

		          error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED');
		        } catch (ex) {
		          error$1 = ex;
		        }

		        if (error$1 && !(error$1 instanceof Error)) {
		          setCurrentlyValidatingElement(element);

		          error('%s: type specification of %s' + ' `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error$1);

		          setCurrentlyValidatingElement(null);
		        }

		        if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
		          // Only monitor this failure once because there tends to be a lot of the
		          // same error.
		          loggedTypeFailures[error$1.message] = true;
		          setCurrentlyValidatingElement(element);

		          error('Failed %s type: %s', location, error$1.message);

		          setCurrentlyValidatingElement(null);
		        }
		      }
		    }
		  }
		}

		function setCurrentlyValidatingElement$1(element) {
		  {
		    if (element) {
		      var owner = element._owner;
		      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
		      setExtraStackFrame(stack);
		    } else {
		      setExtraStackFrame(null);
		    }
		  }
		}

		var propTypesMisspellWarningShown;

		{
		  propTypesMisspellWarningShown = false;
		}

		function getDeclarationErrorAddendum() {
		  if (ReactCurrentOwner.current) {
		    var name = getComponentNameFromType(ReactCurrentOwner.current.type);

		    if (name) {
		      return '\n\nCheck the render method of `' + name + '`.';
		    }
		  }

		  return '';
		}

		function getSourceInfoErrorAddendum(source) {
		  if (source !== undefined) {
		    var fileName = source.fileName.replace(/^.*[\\\/]/, '');
		    var lineNumber = source.lineNumber;
		    return '\n\nCheck your code at ' + fileName + ':' + lineNumber + '.';
		  }

		  return '';
		}

		function getSourceInfoErrorAddendumForProps(elementProps) {
		  if (elementProps !== null && elementProps !== undefined) {
		    return getSourceInfoErrorAddendum(elementProps.__source);
		  }

		  return '';
		}
		/**
		 * Warn if there's no key explicitly set on dynamic arrays of children or
		 * object keys are not valid. This allows us to keep track of children between
		 * updates.
		 */


		var ownerHasKeyUseWarning = {};

		function getCurrentComponentErrorInfo(parentType) {
		  var info = getDeclarationErrorAddendum();

		  if (!info) {
		    var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;

		    if (parentName) {
		      info = "\n\nCheck the top-level render call using <" + parentName + ">.";
		    }
		  }

		  return info;
		}
		/**
		 * Warn if the element doesn't have an explicit key assigned to it.
		 * This element is in an array. The array could grow and shrink or be
		 * reordered. All children that haven't already been validated are required to
		 * have a "key" property assigned to it. Error statuses are cached so a warning
		 * will only be shown once.
		 *
		 * @internal
		 * @param {ReactElement} element Element that requires a key.
		 * @param {*} parentType element's parent's type.
		 */


		function validateExplicitKey(element, parentType) {
		  if (!element._store || element._store.validated || element.key != null) {
		    return;
		  }

		  element._store.validated = true;
		  var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);

		  if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
		    return;
		  }

		  ownerHasKeyUseWarning[currentComponentErrorInfo] = true; // Usually the current owner is the offender, but if it accepts children as a
		  // property, it may be the creator of the child that's responsible for
		  // assigning it a key.

		  var childOwner = '';

		  if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
		    // Give the component that originally created this child.
		    childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
		  }

		  {
		    setCurrentlyValidatingElement$1(element);

		    error('Each child in a list should have a unique "key" prop.' + '%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);

		    setCurrentlyValidatingElement$1(null);
		  }
		}
		/**
		 * Ensure that every element either is passed in a static location, in an
		 * array with an explicit keys property defined, or in an object literal
		 * with valid key property.
		 *
		 * @internal
		 * @param {ReactNode} node Statically passed child of any type.
		 * @param {*} parentType node's parent's type.
		 */


		function validateChildKeys(node, parentType) {
		  if (typeof node !== 'object') {
		    return;
		  }

		  if (isArray(node)) {
		    for (var i = 0; i < node.length; i++) {
		      var child = node[i];

		      if (isValidElement(child)) {
		        validateExplicitKey(child, parentType);
		      }
		    }
		  } else if (isValidElement(node)) {
		    // This element was passed in a valid location.
		    if (node._store) {
		      node._store.validated = true;
		    }
		  } else if (node) {
		    var iteratorFn = getIteratorFn(node);

		    if (typeof iteratorFn === 'function') {
		      // Entry iterators used to provide implicit keys,
		      // but now we print a separate warning for them later.
		      if (iteratorFn !== node.entries) {
		        var iterator = iteratorFn.call(node);
		        var step;

		        while (!(step = iterator.next()).done) {
		          if (isValidElement(step.value)) {
		            validateExplicitKey(step.value, parentType);
		          }
		        }
		      }
		    }
		  }
		}
		/**
		 * Given an element, validate that its props follow the propTypes definition,
		 * provided by the type.
		 *
		 * @param {ReactElement} element
		 */


		function validatePropTypes(element) {
		  {
		    var type = element.type;

		    if (type === null || type === undefined || typeof type === 'string') {
		      return;
		    }

		    var propTypes;

		    if (typeof type === 'function') {
		      propTypes = type.propTypes;
		    } else if (typeof type === 'object' && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
		    // Inner props are checked in the reconciler.
		    type.$$typeof === REACT_MEMO_TYPE)) {
		      propTypes = type.propTypes;
		    } else {
		      return;
		    }

		    if (propTypes) {
		      // Intentionally inside to avoid triggering lazy initializers:
		      var name = getComponentNameFromType(type);
		      checkPropTypes(propTypes, element.props, 'prop', name, element);
		    } else if (type.PropTypes !== undefined && !propTypesMisspellWarningShown) {
		      propTypesMisspellWarningShown = true; // Intentionally inside to avoid triggering lazy initializers:

		      var _name = getComponentNameFromType(type);

		      error('Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', _name || 'Unknown');
		    }

		    if (typeof type.getDefaultProps === 'function' && !type.getDefaultProps.isReactClassApproved) {
		      error('getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.');
		    }
		  }
		}
		/**
		 * Given a fragment, validate that it can only be provided with fragment props
		 * @param {ReactElement} fragment
		 */


		function validateFragmentProps(fragment) {
		  {
		    var keys = Object.keys(fragment.props);

		    for (var i = 0; i < keys.length; i++) {
		      var key = keys[i];

		      if (key !== 'children' && key !== 'key') {
		        setCurrentlyValidatingElement$1(fragment);

		        error('Invalid prop `%s` supplied to `React.Fragment`. ' + 'React.Fragment can only have `key` and `children` props.', key);

		        setCurrentlyValidatingElement$1(null);
		        break;
		      }
		    }

		    if (fragment.ref !== null) {
		      setCurrentlyValidatingElement$1(fragment);

		      error('Invalid attribute `ref` supplied to `React.Fragment`.');

		      setCurrentlyValidatingElement$1(null);
		    }
		  }
		}
		function createElementWithValidation(type, props, children) {
		  var validType = isValidElementType(type); // We warn in this case but don't throw. We expect the element creation to
		  // succeed and there will likely be errors in render.

		  if (!validType) {
		    var info = '';

		    if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
		      info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and named imports.";
		    }

		    var sourceInfo = getSourceInfoErrorAddendumForProps(props);

		    if (sourceInfo) {
		      info += sourceInfo;
		    } else {
		      info += getDeclarationErrorAddendum();
		    }

		    var typeString;

		    if (type === null) {
		      typeString = 'null';
		    } else if (isArray(type)) {
		      typeString = 'array';
		    } else if (type !== undefined && type.$$typeof === REACT_ELEMENT_TYPE) {
		      typeString = "<" + (getComponentNameFromType(type.type) || 'Unknown') + " />";
		      info = ' Did you accidentally export a JSX literal instead of a component?';
		    } else {
		      typeString = typeof type;
		    }

		    {
		      error('React.createElement: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', typeString, info);
		    }
		  }

		  var element = createElement.apply(this, arguments); // The result can be nullish if a mock or a custom function is used.
		  // TODO: Drop this when these are no longer allowed as the type argument.

		  if (element == null) {
		    return element;
		  } // Skip key warning if the type isn't valid since our key validation logic
		  // doesn't expect a non-string/function type and can throw confusing errors.
		  // We don't want exception behavior to differ between dev and prod.
		  // (Rendering will throw with a helpful message and as soon as the type is
		  // fixed, the key warnings will appear.)


		  if (validType) {
		    for (var i = 2; i < arguments.length; i++) {
		      validateChildKeys(arguments[i], type);
		    }
		  }

		  if (type === REACT_FRAGMENT_TYPE) {
		    validateFragmentProps(element);
		  } else {
		    validatePropTypes(element);
		  }

		  return element;
		}
		var didWarnAboutDeprecatedCreateFactory = false;
		function createFactoryWithValidation(type) {
		  var validatedFactory = createElementWithValidation.bind(null, type);
		  validatedFactory.type = type;

		  {
		    if (!didWarnAboutDeprecatedCreateFactory) {
		      didWarnAboutDeprecatedCreateFactory = true;

		      warn('React.createFactory() is deprecated and will be removed in ' + 'a future major release. Consider using JSX ' + 'or use React.createElement() directly instead.');
		    } // Legacy hook: remove it


		    Object.defineProperty(validatedFactory, 'type', {
		      enumerable: false,
		      get: function () {
		        warn('Factory.type is deprecated. Access the class directly ' + 'before passing it to createFactory.');

		        Object.defineProperty(this, 'type', {
		          value: type
		        });
		        return type;
		      }
		    });
		  }

		  return validatedFactory;
		}
		function cloneElementWithValidation(element, props, children) {
		  var newElement = cloneElement.apply(this, arguments);

		  for (var i = 2; i < arguments.length; i++) {
		    validateChildKeys(arguments[i], newElement.type);
		  }

		  validatePropTypes(newElement);
		  return newElement;
		}

		function startTransition(scope, options) {
		  var prevTransition = ReactCurrentBatchConfig.transition;
		  ReactCurrentBatchConfig.transition = {};
		  var currentTransition = ReactCurrentBatchConfig.transition;

		  {
		    ReactCurrentBatchConfig.transition._updatedFibers = new Set();
		  }

		  try {
		    scope();
		  } finally {
		    ReactCurrentBatchConfig.transition = prevTransition;

		    {
		      if (prevTransition === null && currentTransition._updatedFibers) {
		        var updatedFibersCount = currentTransition._updatedFibers.size;

		        if (updatedFibersCount > 10) {
		          warn('Detected a large number of updates inside startTransition. ' + 'If this is due to a subscription please re-write it to use React provided hooks. ' + 'Otherwise concurrent mode guarantees are off the table.');
		        }

		        currentTransition._updatedFibers.clear();
		      }
		    }
		  }
		}

		var didWarnAboutMessageChannel = false;
		var enqueueTaskImpl = null;
		function enqueueTask(task) {
		  if (enqueueTaskImpl === null) {
		    try {
		      // read require off the module object to get around the bundlers.
		      // we don't want them to detect a require and bundle a Node polyfill.
		      var requireString = ('require' + Math.random()).slice(0, 7);
		      var nodeRequire = module && module[requireString]; // assuming we're in node, let's try to get node's
		      // version of setImmediate, bypassing fake timers if any.

		      enqueueTaskImpl = nodeRequire.call(module, 'timers').setImmediate;
		    } catch (_err) {
		      // we're in a browser
		      // we can't use regular timers because they may still be faked
		      // so we try MessageChannel+postMessage instead
		      enqueueTaskImpl = function (callback) {
		        {
		          if (didWarnAboutMessageChannel === false) {
		            didWarnAboutMessageChannel = true;

		            if (typeof MessageChannel === 'undefined') {
		              error('This browser does not have a MessageChannel implementation, ' + 'so enqueuing tasks via await act(async () => ...) will fail. ' + 'Please file an issue at https://github.com/facebook/react/issues ' + 'if you encounter this warning.');
		            }
		          }
		        }

		        var channel = new MessageChannel();
		        channel.port1.onmessage = callback;
		        channel.port2.postMessage(undefined);
		      };
		    }
		  }

		  return enqueueTaskImpl(task);
		}

		var actScopeDepth = 0;
		var didWarnNoAwaitAct = false;
		function act(callback) {
		  {
		    // `act` calls can be nested, so we track the depth. This represents the
		    // number of `act` scopes on the stack.
		    var prevActScopeDepth = actScopeDepth;
		    actScopeDepth++;

		    if (ReactCurrentActQueue.current === null) {
		      // This is the outermost `act` scope. Initialize the queue. The reconciler
		      // will detect the queue and use it instead of Scheduler.
		      ReactCurrentActQueue.current = [];
		    }

		    var prevIsBatchingLegacy = ReactCurrentActQueue.isBatchingLegacy;
		    var result;

		    try {
		      // Used to reproduce behavior of `batchedUpdates` in legacy mode. Only
		      // set to `true` while the given callback is executed, not for updates
		      // triggered during an async event, because this is how the legacy
		      // implementation of `act` behaved.
		      ReactCurrentActQueue.isBatchingLegacy = true;
		      result = callback(); // Replicate behavior of original `act` implementation in legacy mode,
		      // which flushed updates immediately after the scope function exits, even
		      // if it's an async function.

		      if (!prevIsBatchingLegacy && ReactCurrentActQueue.didScheduleLegacyUpdate) {
		        var queue = ReactCurrentActQueue.current;

		        if (queue !== null) {
		          ReactCurrentActQueue.didScheduleLegacyUpdate = false;
		          flushActQueue(queue);
		        }
		      }
		    } catch (error) {
		      popActScope(prevActScopeDepth);
		      throw error;
		    } finally {
		      ReactCurrentActQueue.isBatchingLegacy = prevIsBatchingLegacy;
		    }

		    if (result !== null && typeof result === 'object' && typeof result.then === 'function') {
		      var thenableResult = result; // The callback is an async function (i.e. returned a promise). Wait
		      // for it to resolve before exiting the current scope.

		      var wasAwaited = false;
		      var thenable = {
		        then: function (resolve, reject) {
		          wasAwaited = true;
		          thenableResult.then(function (returnValue) {
		            popActScope(prevActScopeDepth);

		            if (actScopeDepth === 0) {
		              // We've exited the outermost act scope. Recursively flush the
		              // queue until there's no remaining work.
		              recursivelyFlushAsyncActWork(returnValue, resolve, reject);
		            } else {
		              resolve(returnValue);
		            }
		          }, function (error) {
		            // The callback threw an error.
		            popActScope(prevActScopeDepth);
		            reject(error);
		          });
		        }
		      };

		      {
		        if (!didWarnNoAwaitAct && typeof Promise !== 'undefined') {
		          // eslint-disable-next-line no-undef
		          Promise.resolve().then(function () {}).then(function () {
		            if (!wasAwaited) {
		              didWarnNoAwaitAct = true;

		              error('You called act(async () => ...) without await. ' + 'This could lead to unexpected testing behaviour, ' + 'interleaving multiple act calls and mixing their ' + 'scopes. ' + 'You should - await act(async () => ...);');
		            }
		          });
		        }
		      }

		      return thenable;
		    } else {
		      var returnValue = result; // The callback is not an async function. Exit the current scope
		      // immediately, without awaiting.

		      popActScope(prevActScopeDepth);

		      if (actScopeDepth === 0) {
		        // Exiting the outermost act scope. Flush the queue.
		        var _queue = ReactCurrentActQueue.current;

		        if (_queue !== null) {
		          flushActQueue(_queue);
		          ReactCurrentActQueue.current = null;
		        } // Return a thenable. If the user awaits it, we'll flush again in
		        // case additional work was scheduled by a microtask.


		        var _thenable = {
		          then: function (resolve, reject) {
		            // Confirm we haven't re-entered another `act` scope, in case
		            // the user does something weird like await the thenable
		            // multiple times.
		            if (ReactCurrentActQueue.current === null) {
		              // Recursively flush the queue until there's no remaining work.
		              ReactCurrentActQueue.current = [];
		              recursivelyFlushAsyncActWork(returnValue, resolve, reject);
		            } else {
		              resolve(returnValue);
		            }
		          }
		        };
		        return _thenable;
		      } else {
		        // Since we're inside a nested `act` scope, the returned thenable
		        // immediately resolves. The outer scope will flush the queue.
		        var _thenable2 = {
		          then: function (resolve, reject) {
		            resolve(returnValue);
		          }
		        };
		        return _thenable2;
		      }
		    }
		  }
		}

		function popActScope(prevActScopeDepth) {
		  {
		    if (prevActScopeDepth !== actScopeDepth - 1) {
		      error('You seem to have overlapping act() calls, this is not supported. ' + 'Be sure to await previous act() calls before making a new one. ');
		    }

		    actScopeDepth = prevActScopeDepth;
		  }
		}

		function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
		  {
		    var queue = ReactCurrentActQueue.current;

		    if (queue !== null) {
		      try {
		        flushActQueue(queue);
		        enqueueTask(function () {
		          if (queue.length === 0) {
		            // No additional work was scheduled. Finish.
		            ReactCurrentActQueue.current = null;
		            resolve(returnValue);
		          } else {
		            // Keep flushing work until there's none left.
		            recursivelyFlushAsyncActWork(returnValue, resolve, reject);
		          }
		        });
		      } catch (error) {
		        reject(error);
		      }
		    } else {
		      resolve(returnValue);
		    }
		  }
		}

		var isFlushing = false;

		function flushActQueue(queue) {
		  {
		    if (!isFlushing) {
		      // Prevent re-entrance.
		      isFlushing = true;
		      var i = 0;

		      try {
		        for (; i < queue.length; i++) {
		          var callback = queue[i];

		          do {
		            callback = callback(true);
		          } while (callback !== null);
		        }

		        queue.length = 0;
		      } catch (error) {
		        // If something throws, leave the remaining callbacks on the queue.
		        queue = queue.slice(i + 1);
		        throw error;
		      } finally {
		        isFlushing = false;
		      }
		    }
		  }
		}

		var createElement$1 =  createElementWithValidation ;
		var cloneElement$1 =  cloneElementWithValidation ;
		var createFactory =  createFactoryWithValidation ;
		var Children = {
		  map: mapChildren,
		  forEach: forEachChildren,
		  count: countChildren,
		  toArray: toArray,
		  only: onlyChild
		};

		exports.Children = Children;
		exports.Component = Component;
		exports.Fragment = REACT_FRAGMENT_TYPE;
		exports.Profiler = REACT_PROFILER_TYPE;
		exports.PureComponent = PureComponent;
		exports.StrictMode = REACT_STRICT_MODE_TYPE;
		exports.Suspense = REACT_SUSPENSE_TYPE;
		exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternals;
		exports.cloneElement = cloneElement$1;
		exports.createContext = createContext;
		exports.createElement = createElement$1;
		exports.createFactory = createFactory;
		exports.createRef = createRef;
		exports.forwardRef = forwardRef;
		exports.isValidElement = isValidElement;
		exports.lazy = lazy;
		exports.memo = memo;
		exports.startTransition = startTransition;
		exports.unstable_act = act;
		exports.useCallback = useCallback;
		exports.useContext = useContext;
		exports.useDebugValue = useDebugValue;
		exports.useDeferredValue = useDeferredValue;
		exports.useEffect = useEffect;
		exports.useId = useId;
		exports.useImperativeHandle = useImperativeHandle;
		exports.useInsertionEffect = useInsertionEffect;
		exports.useLayoutEffect = useLayoutEffect;
		exports.useMemo = useMemo;
		exports.useReducer = useReducer;
		exports.useRef = useRef;
		exports.useState = useState;
		exports.useSyncExternalStore = useSyncExternalStore;
		exports.useTransition = useTransition;
		exports.version = ReactVersion;
		          /* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
		if (
		  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' &&
		  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop ===
		    'function'
		) {
		  __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
		}
		        
		  })();
		} 
	} (react_development, react_development.exports));
	return react_development.exports;
}

var hasRequiredReact;

function requireReact () {
	if (hasRequiredReact) return react.exports;
	hasRequiredReact = 1;

	if (process.env.NODE_ENV === 'production') {
	  react.exports = requireReact_production_min();
	} else {
	  react.exports = requireReact_development();
	}
	return react.exports;
}

/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_production_min;

function requireReactJsxRuntime_production_min () {
	if (hasRequiredReactJsxRuntime_production_min) return reactJsxRuntime_production_min;
	hasRequiredReactJsxRuntime_production_min = 1;
var f=requireReact(),k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:!0,ref:!0,__self:!0,__source:!0};
	function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a)void 0===d[b]&&(d[b]=a[b]);return {$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}reactJsxRuntime_production_min.Fragment=l;reactJsxRuntime_production_min.jsx=q;reactJsxRuntime_production_min.jsxs=q;
	return reactJsxRuntime_production_min;
}

var reactJsxRuntime_development = {};

/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_development;

function requireReactJsxRuntime_development () {
	if (hasRequiredReactJsxRuntime_development) return reactJsxRuntime_development;
	hasRequiredReactJsxRuntime_development = 1;

	if (process.env.NODE_ENV !== "production") {
	  (function() {

	var React = requireReact();

	// ATTENTION
	// When adding new symbols to this file,
	// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
	// The Symbol used to tag the ReactElement-like types.
	var REACT_ELEMENT_TYPE = Symbol.for('react.element');
	var REACT_PORTAL_TYPE = Symbol.for('react.portal');
	var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
	var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
	var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
	var REACT_PROVIDER_TYPE = Symbol.for('react.provider');
	var REACT_CONTEXT_TYPE = Symbol.for('react.context');
	var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
	var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
	var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
	var REACT_MEMO_TYPE = Symbol.for('react.memo');
	var REACT_LAZY_TYPE = Symbol.for('react.lazy');
	var REACT_OFFSCREEN_TYPE = Symbol.for('react.offscreen');
	var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	var FAUX_ITERATOR_SYMBOL = '@@iterator';
	function getIteratorFn(maybeIterable) {
	  if (maybeIterable === null || typeof maybeIterable !== 'object') {
	    return null;
	  }

	  var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];

	  if (typeof maybeIterator === 'function') {
	    return maybeIterator;
	  }

	  return null;
	}

	var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

	function error(format) {
	  {
	    {
	      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	        args[_key2 - 1] = arguments[_key2];
	      }

	      printWarning('error', format, args);
	    }
	  }
	}

	function printWarning(level, format, args) {
	  // When changing this logic, you might want to also
	  // update consoleWithStackDev.www.js as well.
	  {
	    var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
	    var stack = ReactDebugCurrentFrame.getStackAddendum();

	    if (stack !== '') {
	      format += '%s';
	      args = args.concat([stack]);
	    } // eslint-disable-next-line react-internal/safe-string-coercion


	    var argsWithFormat = args.map(function (item) {
	      return String(item);
	    }); // Careful: RN currently depends on this prefix

	    argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
	    // breaks IE9: https://github.com/facebook/react/issues/13610
	    // eslint-disable-next-line react-internal/no-production-logging

	    Function.prototype.apply.call(console[level], console, argsWithFormat);
	  }
	}

	// -----------------------------------------------------------------------------

	var enableScopeAPI = false; // Experimental Create Event Handle API.
	var enableCacheElement = false;
	var enableTransitionTracing = false; // No known bugs, but needs performance testing

	var enableLegacyHidden = false; // Enables unstable_avoidThisFallback feature in Fiber
	// stuff. Intended to enable React core members to more easily debug scheduling
	// issues in DEV builds.

	var enableDebugTracing = false; // Track which Fiber(s) schedule render work.

	var REACT_MODULE_REFERENCE;

	{
	  REACT_MODULE_REFERENCE = Symbol.for('react.module.reference');
	}

	function isValidElementType(type) {
	  if (typeof type === 'string' || typeof type === 'function') {
	    return true;
	  } // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).


	  if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing  || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden  || type === REACT_OFFSCREEN_TYPE || enableScopeAPI  || enableCacheElement  || enableTransitionTracing ) {
	    return true;
	  }

	  if (typeof type === 'object' && type !== null) {
	    if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
	    // types supported by any Flight configuration anywhere since
	    // we don't know which Flight build this will end up being used
	    // with.
	    type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== undefined) {
	      return true;
	    }
	  }

	  return false;
	}

	function getWrappedName(outerType, innerType, wrapperName) {
	  var displayName = outerType.displayName;

	  if (displayName) {
	    return displayName;
	  }

	  var functionName = innerType.displayName || innerType.name || '';
	  return functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName;
	} // Keep in sync with react-reconciler/getComponentNameFromFiber


	function getContextName(type) {
	  return type.displayName || 'Context';
	} // Note that the reconciler package should generally prefer to use getComponentNameFromFiber() instead.


	function getComponentNameFromType(type) {
	  if (type == null) {
	    // Host root, text node or just invalid type.
	    return null;
	  }

	  {
	    if (typeof type.tag === 'number') {
	      error('Received an unexpected object in getComponentNameFromType(). ' + 'This is likely a bug in React. Please file an issue.');
	    }
	  }

	  if (typeof type === 'function') {
	    return type.displayName || type.name || null;
	  }

	  if (typeof type === 'string') {
	    return type;
	  }

	  switch (type) {
	    case REACT_FRAGMENT_TYPE:
	      return 'Fragment';

	    case REACT_PORTAL_TYPE:
	      return 'Portal';

	    case REACT_PROFILER_TYPE:
	      return 'Profiler';

	    case REACT_STRICT_MODE_TYPE:
	      return 'StrictMode';

	    case REACT_SUSPENSE_TYPE:
	      return 'Suspense';

	    case REACT_SUSPENSE_LIST_TYPE:
	      return 'SuspenseList';

	  }

	  if (typeof type === 'object') {
	    switch (type.$$typeof) {
	      case REACT_CONTEXT_TYPE:
	        var context = type;
	        return getContextName(context) + '.Consumer';

	      case REACT_PROVIDER_TYPE:
	        var provider = type;
	        return getContextName(provider._context) + '.Provider';

	      case REACT_FORWARD_REF_TYPE:
	        return getWrappedName(type, type.render, 'ForwardRef');

	      case REACT_MEMO_TYPE:
	        var outerName = type.displayName || null;

	        if (outerName !== null) {
	          return outerName;
	        }

	        return getComponentNameFromType(type.type) || 'Memo';

	      case REACT_LAZY_TYPE:
	        {
	          var lazyComponent = type;
	          var payload = lazyComponent._payload;
	          var init = lazyComponent._init;

	          try {
	            return getComponentNameFromType(init(payload));
	          } catch (x) {
	            return null;
	          }
	        }

	      // eslint-disable-next-line no-fallthrough
	    }
	  }

	  return null;
	}

	var assign = Object.assign;

	// Helpers to patch console.logs to avoid logging during side-effect free
	// replaying on render function. This currently only patches the object
	// lazily which won't cover if the log function was extracted eagerly.
	// We could also eagerly patch the method.
	var disabledDepth = 0;
	var prevLog;
	var prevInfo;
	var prevWarn;
	var prevError;
	var prevGroup;
	var prevGroupCollapsed;
	var prevGroupEnd;

	function disabledLog() {}

	disabledLog.__reactDisabledLog = true;
	function disableLogs() {
	  {
	    if (disabledDepth === 0) {
	      /* eslint-disable react-internal/no-production-logging */
	      prevLog = console.log;
	      prevInfo = console.info;
	      prevWarn = console.warn;
	      prevError = console.error;
	      prevGroup = console.group;
	      prevGroupCollapsed = console.groupCollapsed;
	      prevGroupEnd = console.groupEnd; // https://github.com/facebook/react/issues/19099

	      var props = {
	        configurable: true,
	        enumerable: true,
	        value: disabledLog,
	        writable: true
	      }; // $FlowFixMe Flow thinks console is immutable.

	      Object.defineProperties(console, {
	        info: props,
	        log: props,
	        warn: props,
	        error: props,
	        group: props,
	        groupCollapsed: props,
	        groupEnd: props
	      });
	      /* eslint-enable react-internal/no-production-logging */
	    }

	    disabledDepth++;
	  }
	}
	function reenableLogs() {
	  {
	    disabledDepth--;

	    if (disabledDepth === 0) {
	      /* eslint-disable react-internal/no-production-logging */
	      var props = {
	        configurable: true,
	        enumerable: true,
	        writable: true
	      }; // $FlowFixMe Flow thinks console is immutable.

	      Object.defineProperties(console, {
	        log: assign({}, props, {
	          value: prevLog
	        }),
	        info: assign({}, props, {
	          value: prevInfo
	        }),
	        warn: assign({}, props, {
	          value: prevWarn
	        }),
	        error: assign({}, props, {
	          value: prevError
	        }),
	        group: assign({}, props, {
	          value: prevGroup
	        }),
	        groupCollapsed: assign({}, props, {
	          value: prevGroupCollapsed
	        }),
	        groupEnd: assign({}, props, {
	          value: prevGroupEnd
	        })
	      });
	      /* eslint-enable react-internal/no-production-logging */
	    }

	    if (disabledDepth < 0) {
	      error('disabledDepth fell below zero. ' + 'This is a bug in React. Please file an issue.');
	    }
	  }
	}

	var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
	var prefix;
	function describeBuiltInComponentFrame(name, source, ownerFn) {
	  {
	    if (prefix === undefined) {
	      // Extract the VM specific prefix used by each line.
	      try {
	        throw Error();
	      } catch (x) {
	        var match = x.stack.trim().match(/\n( *(at )?)/);
	        prefix = match && match[1] || '';
	      }
	    } // We use the prefix to ensure our stacks line up with native stack frames.


	    return '\n' + prefix + name;
	  }
	}
	var reentry = false;
	var componentFrameCache;

	{
	  var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
	  componentFrameCache = new PossiblyWeakMap();
	}

	function describeNativeComponentFrame(fn, construct) {
	  // If something asked for a stack inside a fake render, it should get ignored.
	  if ( !fn || reentry) {
	    return '';
	  }

	  {
	    var frame = componentFrameCache.get(fn);

	    if (frame !== undefined) {
	      return frame;
	    }
	  }

	  var control;
	  reentry = true;
	  var previousPrepareStackTrace = Error.prepareStackTrace; // $FlowFixMe It does accept undefined.

	  Error.prepareStackTrace = undefined;
	  var previousDispatcher;

	  {
	    previousDispatcher = ReactCurrentDispatcher.current; // Set the dispatcher in DEV because this might be call in the render function
	    // for warnings.

	    ReactCurrentDispatcher.current = null;
	    disableLogs();
	  }

	  try {
	    // This should throw.
	    if (construct) {
	      // Something should be setting the props in the constructor.
	      var Fake = function () {
	        throw Error();
	      }; // $FlowFixMe


	      Object.defineProperty(Fake.prototype, 'props', {
	        set: function () {
	          // We use a throwing setter instead of frozen or non-writable props
	          // because that won't throw in a non-strict mode function.
	          throw Error();
	        }
	      });

	      if (typeof Reflect === 'object' && Reflect.construct) {
	        // We construct a different control for this case to include any extra
	        // frames added by the construct call.
	        try {
	          Reflect.construct(Fake, []);
	        } catch (x) {
	          control = x;
	        }

	        Reflect.construct(fn, [], Fake);
	      } else {
	        try {
	          Fake.call();
	        } catch (x) {
	          control = x;
	        }

	        fn.call(Fake.prototype);
	      }
	    } else {
	      try {
	        throw Error();
	      } catch (x) {
	        control = x;
	      }

	      fn();
	    }
	  } catch (sample) {
	    // This is inlined manually because closure doesn't do it for us.
	    if (sample && control && typeof sample.stack === 'string') {
	      // This extracts the first frame from the sample that isn't also in the control.
	      // Skipping one frame that we assume is the frame that calls the two.
	      var sampleLines = sample.stack.split('\n');
	      var controlLines = control.stack.split('\n');
	      var s = sampleLines.length - 1;
	      var c = controlLines.length - 1;

	      while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
	        // We expect at least one stack frame to be shared.
	        // Typically this will be the root most one. However, stack frames may be
	        // cut off due to maximum stack limits. In this case, one maybe cut off
	        // earlier than the other. We assume that the sample is longer or the same
	        // and there for cut off earlier. So we should find the root most frame in
	        // the sample somewhere in the control.
	        c--;
	      }

	      for (; s >= 1 && c >= 0; s--, c--) {
	        // Next we find the first one that isn't the same which should be the
	        // frame that called our sample function and the control.
	        if (sampleLines[s] !== controlLines[c]) {
	          // In V8, the first line is describing the message but other VMs don't.
	          // If we're about to return the first line, and the control is also on the same
	          // line, that's a pretty good indicator that our sample threw at same line as
	          // the control. I.e. before we entered the sample frame. So we ignore this result.
	          // This can happen if you passed a class to function component, or non-function.
	          if (s !== 1 || c !== 1) {
	            do {
	              s--;
	              c--; // We may still have similar intermediate frames from the construct call.
	              // The next one that isn't the same should be our match though.

	              if (c < 0 || sampleLines[s] !== controlLines[c]) {
	                // V8 adds a "new" prefix for native classes. Let's remove it to make it prettier.
	                var _frame = '\n' + sampleLines[s].replace(' at new ', ' at '); // If our component frame is labeled "<anonymous>"
	                // but we have a user-provided "displayName"
	                // splice it in to make the stack more readable.


	                if (fn.displayName && _frame.includes('<anonymous>')) {
	                  _frame = _frame.replace('<anonymous>', fn.displayName);
	                }

	                {
	                  if (typeof fn === 'function') {
	                    componentFrameCache.set(fn, _frame);
	                  }
	                } // Return the line we found.


	                return _frame;
	              }
	            } while (s >= 1 && c >= 0);
	          }

	          break;
	        }
	      }
	    }
	  } finally {
	    reentry = false;

	    {
	      ReactCurrentDispatcher.current = previousDispatcher;
	      reenableLogs();
	    }

	    Error.prepareStackTrace = previousPrepareStackTrace;
	  } // Fallback to just using the name if we couldn't make it throw.


	  var name = fn ? fn.displayName || fn.name : '';
	  var syntheticFrame = name ? describeBuiltInComponentFrame(name) : '';

	  {
	    if (typeof fn === 'function') {
	      componentFrameCache.set(fn, syntheticFrame);
	    }
	  }

	  return syntheticFrame;
	}
	function describeFunctionComponentFrame(fn, source, ownerFn) {
	  {
	    return describeNativeComponentFrame(fn, false);
	  }
	}

	function shouldConstruct(Component) {
	  var prototype = Component.prototype;
	  return !!(prototype && prototype.isReactComponent);
	}

	function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {

	  if (type == null) {
	    return '';
	  }

	  if (typeof type === 'function') {
	    {
	      return describeNativeComponentFrame(type, shouldConstruct(type));
	    }
	  }

	  if (typeof type === 'string') {
	    return describeBuiltInComponentFrame(type);
	  }

	  switch (type) {
	    case REACT_SUSPENSE_TYPE:
	      return describeBuiltInComponentFrame('Suspense');

	    case REACT_SUSPENSE_LIST_TYPE:
	      return describeBuiltInComponentFrame('SuspenseList');
	  }

	  if (typeof type === 'object') {
	    switch (type.$$typeof) {
	      case REACT_FORWARD_REF_TYPE:
	        return describeFunctionComponentFrame(type.render);

	      case REACT_MEMO_TYPE:
	        // Memo may contain any component type so we recursively resolve it.
	        return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);

	      case REACT_LAZY_TYPE:
	        {
	          var lazyComponent = type;
	          var payload = lazyComponent._payload;
	          var init = lazyComponent._init;

	          try {
	            // Lazy may contain any component type so we recursively resolve it.
	            return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
	          } catch (x) {}
	        }
	    }
	  }

	  return '';
	}

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	var loggedTypeFailures = {};
	var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;

	function setCurrentlyValidatingElement(element) {
	  {
	    if (element) {
	      var owner = element._owner;
	      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
	      ReactDebugCurrentFrame.setExtraStackFrame(stack);
	    } else {
	      ReactDebugCurrentFrame.setExtraStackFrame(null);
	    }
	  }
	}

	function checkPropTypes(typeSpecs, values, location, componentName, element) {
	  {
	    // $FlowFixMe This is okay but Flow doesn't know it.
	    var has = Function.call.bind(hasOwnProperty);

	    for (var typeSpecName in typeSpecs) {
	      if (has(typeSpecs, typeSpecName)) {
	        var error$1 = void 0; // Prop type validation may throw. In case they do, we don't want to
	        // fail the render phase where it didn't fail before. So we log it.
	        // After these have been cleaned up, we'll let them throw.

	        try {
	          // This is intentionally an invariant that gets caught. It's the same
	          // behavior as without this statement except with a better message.
	          if (typeof typeSpecs[typeSpecName] !== 'function') {
	            // eslint-disable-next-line react-internal/prod-error-codes
	            var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' + 'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.');
	            err.name = 'Invariant Violation';
	            throw err;
	          }

	          error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED');
	        } catch (ex) {
	          error$1 = ex;
	        }

	        if (error$1 && !(error$1 instanceof Error)) {
	          setCurrentlyValidatingElement(element);

	          error('%s: type specification of %s' + ' `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error$1);

	          setCurrentlyValidatingElement(null);
	        }

	        if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
	          // Only monitor this failure once because there tends to be a lot of the
	          // same error.
	          loggedTypeFailures[error$1.message] = true;
	          setCurrentlyValidatingElement(element);

	          error('Failed %s type: %s', location, error$1.message);

	          setCurrentlyValidatingElement(null);
	        }
	      }
	    }
	  }
	}

	var isArrayImpl = Array.isArray; // eslint-disable-next-line no-redeclare

	function isArray(a) {
	  return isArrayImpl(a);
	}

	/*
	 * The `'' + value` pattern (used in in perf-sensitive code) throws for Symbol
	 * and Temporal.* types. See https://github.com/facebook/react/pull/22064.
	 *
	 * The functions in this module will throw an easier-to-understand,
	 * easier-to-debug exception with a clear errors message message explaining the
	 * problem. (Instead of a confusing exception thrown inside the implementation
	 * of the `value` object).
	 */
	// $FlowFixMe only called in DEV, so void return is not possible.
	function typeName(value) {
	  {
	    // toStringTag is needed for namespaced types like Temporal.Instant
	    var hasToStringTag = typeof Symbol === 'function' && Symbol.toStringTag;
	    var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || 'Object';
	    return type;
	  }
	} // $FlowFixMe only called in DEV, so void return is not possible.


	function willCoercionThrow(value) {
	  {
	    try {
	      testStringCoercion(value);
	      return false;
	    } catch (e) {
	      return true;
	    }
	  }
	}

	function testStringCoercion(value) {
	  // If you ended up here by following an exception call stack, here's what's
	  // happened: you supplied an object or symbol value to React (as a prop, key,
	  // DOM attribute, CSS property, string ref, etc.) and when React tried to
	  // coerce it to a string using `'' + value`, an exception was thrown.
	  //
	  // The most common types that will cause this exception are `Symbol` instances
	  // and Temporal objects like `Temporal.Instant`. But any object that has a
	  // `valueOf` or `[Symbol.toPrimitive]` method that throws will also cause this
	  // exception. (Library authors do this to prevent users from using built-in
	  // numeric operators like `+` or comparison operators like `>=` because custom
	  // methods are needed to perform accurate arithmetic or comparison.)
	  //
	  // To fix the problem, coerce this object or symbol value to a string before
	  // passing it to React. The most reliable way is usually `String(value)`.
	  //
	  // To find which value is throwing, check the browser or debugger console.
	  // Before this exception was thrown, there should be `console.error` output
	  // that shows the type (Symbol, Temporal.PlainDate, etc.) that caused the
	  // problem and how that type was used: key, atrribute, input value prop, etc.
	  // In most cases, this console output also shows the component and its
	  // ancestor components where the exception happened.
	  //
	  // eslint-disable-next-line react-internal/safe-string-coercion
	  return '' + value;
	}
	function checkKeyStringCoercion(value) {
	  {
	    if (willCoercionThrow(value)) {
	      error('The provided key is an unsupported type %s.' + ' This value must be coerced to a string before before using it here.', typeName(value));

	      return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
	    }
	  }
	}

	var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
	var RESERVED_PROPS = {
	  key: true,
	  ref: true,
	  __self: true,
	  __source: true
	};
	var specialPropKeyWarningShown;
	var specialPropRefWarningShown;
	var didWarnAboutStringRefs;

	{
	  didWarnAboutStringRefs = {};
	}

	function hasValidRef(config) {
	  {
	    if (hasOwnProperty.call(config, 'ref')) {
	      var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;

	      if (getter && getter.isReactWarning) {
	        return false;
	      }
	    }
	  }

	  return config.ref !== undefined;
	}

	function hasValidKey(config) {
	  {
	    if (hasOwnProperty.call(config, 'key')) {
	      var getter = Object.getOwnPropertyDescriptor(config, 'key').get;

	      if (getter && getter.isReactWarning) {
	        return false;
	      }
	    }
	  }

	  return config.key !== undefined;
	}

	function warnIfStringRefCannotBeAutoConverted(config, self) {
	  {
	    if (typeof config.ref === 'string' && ReactCurrentOwner.current && self && ReactCurrentOwner.current.stateNode !== self) {
	      var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);

	      if (!didWarnAboutStringRefs[componentName]) {
	        error('Component "%s" contains the string ref "%s". ' + 'Support for string refs will be removed in a future major release. ' + 'This case cannot be automatically converted to an arrow function. ' + 'We ask you to manually fix this case by using useRef() or createRef() instead. ' + 'Learn more about using refs safely here: ' + 'https://reactjs.org/link/strict-mode-string-ref', getComponentNameFromType(ReactCurrentOwner.current.type), config.ref);

	        didWarnAboutStringRefs[componentName] = true;
	      }
	    }
	  }
	}

	function defineKeyPropWarningGetter(props, displayName) {
	  {
	    var warnAboutAccessingKey = function () {
	      if (!specialPropKeyWarningShown) {
	        specialPropKeyWarningShown = true;

	        error('%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
	      }
	    };

	    warnAboutAccessingKey.isReactWarning = true;
	    Object.defineProperty(props, 'key', {
	      get: warnAboutAccessingKey,
	      configurable: true
	    });
	  }
	}

	function defineRefPropWarningGetter(props, displayName) {
	  {
	    var warnAboutAccessingRef = function () {
	      if (!specialPropRefWarningShown) {
	        specialPropRefWarningShown = true;

	        error('%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
	      }
	    };

	    warnAboutAccessingRef.isReactWarning = true;
	    Object.defineProperty(props, 'ref', {
	      get: warnAboutAccessingRef,
	      configurable: true
	    });
	  }
	}
	/**
	 * Factory method to create a new React element. This no longer adheres to
	 * the class pattern, so do not use new to call it. Also, instanceof check
	 * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
	 * if something is a React Element.
	 *
	 * @param {*} type
	 * @param {*} props
	 * @param {*} key
	 * @param {string|object} ref
	 * @param {*} owner
	 * @param {*} self A *temporary* helper to detect places where `this` is
	 * different from the `owner` when React.createElement is called, so that we
	 * can warn. We want to get rid of owner and replace string `ref`s with arrow
	 * functions, and as long as `this` and owner are the same, there will be no
	 * change in behavior.
	 * @param {*} source An annotation object (added by a transpiler or otherwise)
	 * indicating filename, line number, and/or other information.
	 * @internal
	 */


	var ReactElement = function (type, key, ref, self, source, owner, props) {
	  var element = {
	    // This tag allows us to uniquely identify this as a React Element
	    $$typeof: REACT_ELEMENT_TYPE,
	    // Built-in properties that belong on the element
	    type: type,
	    key: key,
	    ref: ref,
	    props: props,
	    // Record the component responsible for creating this element.
	    _owner: owner
	  };

	  {
	    // The validation flag is currently mutative. We put it on
	    // an external backing store so that we can freeze the whole object.
	    // This can be replaced with a WeakMap once they are implemented in
	    // commonly used development environments.
	    element._store = {}; // To make comparing ReactElements easier for testing purposes, we make
	    // the validation flag non-enumerable (where possible, which should
	    // include every environment we run tests in), so the test framework
	    // ignores it.

	    Object.defineProperty(element._store, 'validated', {
	      configurable: false,
	      enumerable: false,
	      writable: true,
	      value: false
	    }); // self and source are DEV only properties.

	    Object.defineProperty(element, '_self', {
	      configurable: false,
	      enumerable: false,
	      writable: false,
	      value: self
	    }); // Two elements created in two different places should be considered
	    // equal for testing purposes and therefore we hide it from enumeration.

	    Object.defineProperty(element, '_source', {
	      configurable: false,
	      enumerable: false,
	      writable: false,
	      value: source
	    });

	    if (Object.freeze) {
	      Object.freeze(element.props);
	      Object.freeze(element);
	    }
	  }

	  return element;
	};
	/**
	 * https://github.com/reactjs/rfcs/pull/107
	 * @param {*} type
	 * @param {object} props
	 * @param {string} key
	 */

	function jsxDEV(type, config, maybeKey, source, self) {
	  {
	    var propName; // Reserved names are extracted

	    var props = {};
	    var key = null;
	    var ref = null; // Currently, key can be spread in as a prop. This causes a potential
	    // issue if key is also explicitly declared (ie. <div {...props} key="Hi" />
	    // or <div key="Hi" {...props} /> ). We want to deprecate key spread,
	    // but as an intermediary step, we will use jsxDEV for everything except
	    // <div {...props} key="Hi" />, because we aren't currently able to tell if
	    // key is explicitly declared to be undefined or not.

	    if (maybeKey !== undefined) {
	      {
	        checkKeyStringCoercion(maybeKey);
	      }

	      key = '' + maybeKey;
	    }

	    if (hasValidKey(config)) {
	      {
	        checkKeyStringCoercion(config.key);
	      }

	      key = '' + config.key;
	    }

	    if (hasValidRef(config)) {
	      ref = config.ref;
	      warnIfStringRefCannotBeAutoConverted(config, self);
	    } // Remaining properties are added to a new props object


	    for (propName in config) {
	      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
	        props[propName] = config[propName];
	      }
	    } // Resolve default props


	    if (type && type.defaultProps) {
	      var defaultProps = type.defaultProps;

	      for (propName in defaultProps) {
	        if (props[propName] === undefined) {
	          props[propName] = defaultProps[propName];
	        }
	      }
	    }

	    if (key || ref) {
	      var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;

	      if (key) {
	        defineKeyPropWarningGetter(props, displayName);
	      }

	      if (ref) {
	        defineRefPropWarningGetter(props, displayName);
	      }
	    }

	    return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
	  }
	}

	var ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
	var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;

	function setCurrentlyValidatingElement$1(element) {
	  {
	    if (element) {
	      var owner = element._owner;
	      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
	      ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
	    } else {
	      ReactDebugCurrentFrame$1.setExtraStackFrame(null);
	    }
	  }
	}

	var propTypesMisspellWarningShown;

	{
	  propTypesMisspellWarningShown = false;
	}
	/**
	 * Verifies the object is a ReactElement.
	 * See https://reactjs.org/docs/react-api.html#isvalidelement
	 * @param {?object} object
	 * @return {boolean} True if `object` is a ReactElement.
	 * @final
	 */


	function isValidElement(object) {
	  {
	    return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
	  }
	}

	function getDeclarationErrorAddendum() {
	  {
	    if (ReactCurrentOwner$1.current) {
	      var name = getComponentNameFromType(ReactCurrentOwner$1.current.type);

	      if (name) {
	        return '\n\nCheck the render method of `' + name + '`.';
	      }
	    }

	    return '';
	  }
	}

	function getSourceInfoErrorAddendum(source) {
	  {
	    if (source !== undefined) {
	      var fileName = source.fileName.replace(/^.*[\\\/]/, '');
	      var lineNumber = source.lineNumber;
	      return '\n\nCheck your code at ' + fileName + ':' + lineNumber + '.';
	    }

	    return '';
	  }
	}
	/**
	 * Warn if there's no key explicitly set on dynamic arrays of children or
	 * object keys are not valid. This allows us to keep track of children between
	 * updates.
	 */


	var ownerHasKeyUseWarning = {};

	function getCurrentComponentErrorInfo(parentType) {
	  {
	    var info = getDeclarationErrorAddendum();

	    if (!info) {
	      var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;

	      if (parentName) {
	        info = "\n\nCheck the top-level render call using <" + parentName + ">.";
	      }
	    }

	    return info;
	  }
	}
	/**
	 * Warn if the element doesn't have an explicit key assigned to it.
	 * This element is in an array. The array could grow and shrink or be
	 * reordered. All children that haven't already been validated are required to
	 * have a "key" property assigned to it. Error statuses are cached so a warning
	 * will only be shown once.
	 *
	 * @internal
	 * @param {ReactElement} element Element that requires a key.
	 * @param {*} parentType element's parent's type.
	 */


	function validateExplicitKey(element, parentType) {
	  {
	    if (!element._store || element._store.validated || element.key != null) {
	      return;
	    }

	    element._store.validated = true;
	    var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);

	    if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
	      return;
	    }

	    ownerHasKeyUseWarning[currentComponentErrorInfo] = true; // Usually the current owner is the offender, but if it accepts children as a
	    // property, it may be the creator of the child that's responsible for
	    // assigning it a key.

	    var childOwner = '';

	    if (element && element._owner && element._owner !== ReactCurrentOwner$1.current) {
	      // Give the component that originally created this child.
	      childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
	    }

	    setCurrentlyValidatingElement$1(element);

	    error('Each child in a list should have a unique "key" prop.' + '%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);

	    setCurrentlyValidatingElement$1(null);
	  }
	}
	/**
	 * Ensure that every element either is passed in a static location, in an
	 * array with an explicit keys property defined, or in an object literal
	 * with valid key property.
	 *
	 * @internal
	 * @param {ReactNode} node Statically passed child of any type.
	 * @param {*} parentType node's parent's type.
	 */


	function validateChildKeys(node, parentType) {
	  {
	    if (typeof node !== 'object') {
	      return;
	    }

	    if (isArray(node)) {
	      for (var i = 0; i < node.length; i++) {
	        var child = node[i];

	        if (isValidElement(child)) {
	          validateExplicitKey(child, parentType);
	        }
	      }
	    } else if (isValidElement(node)) {
	      // This element was passed in a valid location.
	      if (node._store) {
	        node._store.validated = true;
	      }
	    } else if (node) {
	      var iteratorFn = getIteratorFn(node);

	      if (typeof iteratorFn === 'function') {
	        // Entry iterators used to provide implicit keys,
	        // but now we print a separate warning for them later.
	        if (iteratorFn !== node.entries) {
	          var iterator = iteratorFn.call(node);
	          var step;

	          while (!(step = iterator.next()).done) {
	            if (isValidElement(step.value)) {
	              validateExplicitKey(step.value, parentType);
	            }
	          }
	        }
	      }
	    }
	  }
	}
	/**
	 * Given an element, validate that its props follow the propTypes definition,
	 * provided by the type.
	 *
	 * @param {ReactElement} element
	 */


	function validatePropTypes(element) {
	  {
	    var type = element.type;

	    if (type === null || type === undefined || typeof type === 'string') {
	      return;
	    }

	    var propTypes;

	    if (typeof type === 'function') {
	      propTypes = type.propTypes;
	    } else if (typeof type === 'object' && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
	    // Inner props are checked in the reconciler.
	    type.$$typeof === REACT_MEMO_TYPE)) {
	      propTypes = type.propTypes;
	    } else {
	      return;
	    }

	    if (propTypes) {
	      // Intentionally inside to avoid triggering lazy initializers:
	      var name = getComponentNameFromType(type);
	      checkPropTypes(propTypes, element.props, 'prop', name, element);
	    } else if (type.PropTypes !== undefined && !propTypesMisspellWarningShown) {
	      propTypesMisspellWarningShown = true; // Intentionally inside to avoid triggering lazy initializers:

	      var _name = getComponentNameFromType(type);

	      error('Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', _name || 'Unknown');
	    }

	    if (typeof type.getDefaultProps === 'function' && !type.getDefaultProps.isReactClassApproved) {
	      error('getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.');
	    }
	  }
	}
	/**
	 * Given a fragment, validate that it can only be provided with fragment props
	 * @param {ReactElement} fragment
	 */


	function validateFragmentProps(fragment) {
	  {
	    var keys = Object.keys(fragment.props);

	    for (var i = 0; i < keys.length; i++) {
	      var key = keys[i];

	      if (key !== 'children' && key !== 'key') {
	        setCurrentlyValidatingElement$1(fragment);

	        error('Invalid prop `%s` supplied to `React.Fragment`. ' + 'React.Fragment can only have `key` and `children` props.', key);

	        setCurrentlyValidatingElement$1(null);
	        break;
	      }
	    }

	    if (fragment.ref !== null) {
	      setCurrentlyValidatingElement$1(fragment);

	      error('Invalid attribute `ref` supplied to `React.Fragment`.');

	      setCurrentlyValidatingElement$1(null);
	    }
	  }
	}

	function jsxWithValidation(type, props, key, isStaticChildren, source, self) {
	  {
	    var validType = isValidElementType(type); // We warn in this case but don't throw. We expect the element creation to
	    // succeed and there will likely be errors in render.

	    if (!validType) {
	      var info = '';

	      if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
	        info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and named imports.";
	      }

	      var sourceInfo = getSourceInfoErrorAddendum(source);

	      if (sourceInfo) {
	        info += sourceInfo;
	      } else {
	        info += getDeclarationErrorAddendum();
	      }

	      var typeString;

	      if (type === null) {
	        typeString = 'null';
	      } else if (isArray(type)) {
	        typeString = 'array';
	      } else if (type !== undefined && type.$$typeof === REACT_ELEMENT_TYPE) {
	        typeString = "<" + (getComponentNameFromType(type.type) || 'Unknown') + " />";
	        info = ' Did you accidentally export a JSX literal instead of a component?';
	      } else {
	        typeString = typeof type;
	      }

	      error('React.jsx: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', typeString, info);
	    }

	    var element = jsxDEV(type, props, key, source, self); // The result can be nullish if a mock or a custom function is used.
	    // TODO: Drop this when these are no longer allowed as the type argument.

	    if (element == null) {
	      return element;
	    } // Skip key warning if the type isn't valid since our key validation logic
	    // doesn't expect a non-string/function type and can throw confusing errors.
	    // We don't want exception behavior to differ between dev and prod.
	    // (Rendering will throw with a helpful message and as soon as the type is
	    // fixed, the key warnings will appear.)


	    if (validType) {
	      var children = props.children;

	      if (children !== undefined) {
	        if (isStaticChildren) {
	          if (isArray(children)) {
	            for (var i = 0; i < children.length; i++) {
	              validateChildKeys(children[i], type);
	            }

	            if (Object.freeze) {
	              Object.freeze(children);
	            }
	          } else {
	            error('React.jsx: Static children should always be an array. ' + 'You are likely explicitly calling React.jsxs or React.jsxDEV. ' + 'Use the Babel transform instead.');
	          }
	        } else {
	          validateChildKeys(children, type);
	        }
	      }
	    }

	    if (type === REACT_FRAGMENT_TYPE) {
	      validateFragmentProps(element);
	    } else {
	      validatePropTypes(element);
	    }

	    return element;
	  }
	} // These two functions exist to still get child warnings in dev
	// even with the prod transform. This means that jsxDEV is purely
	// opt-in behavior for better messages but that we won't stop
	// giving you warnings if you use production apis.

	function jsxWithValidationStatic(type, props, key) {
	  {
	    return jsxWithValidation(type, props, key, true);
	  }
	}
	function jsxWithValidationDynamic(type, props, key) {
	  {
	    return jsxWithValidation(type, props, key, false);
	  }
	}

	var jsx =  jsxWithValidationDynamic ; // we may want to special case jsxs internally to take advantage of static children.
	// for now we can ship identical prod functions

	var jsxs =  jsxWithValidationStatic ;

	reactJsxRuntime_development.Fragment = REACT_FRAGMENT_TYPE;
	reactJsxRuntime_development.jsx = jsx;
	reactJsxRuntime_development.jsxs = jsxs;
	  })();
	}
	return reactJsxRuntime_development;
}

if (process.env.NODE_ENV === 'production') {
  jsxRuntime.exports = requireReactJsxRuntime_production_min();
} else {
  jsxRuntime.exports = requireReactJsxRuntime_development();
}

var jsxRuntimeExports = jsxRuntime.exports;

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z$1 = ".Button-module_ucomButton__c-1Jp {\n  background: transparent;\n  border: 2px solid transparent;\n  display: inline-block;\n  position: relative;\n  cursor: pointer;\n  color: #000000;\n  font-weight: 600;\n  font-size: 0.8rem;\n  text-transform: uppercase;\n  min-width: 64px;\n  line-height: 0;\n  padding: 1rem;\n}\n\n.Button-module_ucomButton__c-1Jp.Button-module_small__l39oh {\n  padding: 1rem;\n}\n\n.Button-module_ucomButton__c-1Jp.Button-module_medium__KTxdk {\n  padding: 1.42rem;\n}\n\n.Button-module_ucomButton__c-1Jp.Button-module_large__6bsb7 {\n  padding: 1.66rem;\n}\n\n.Button-module_ucomButton__c-1Jp.Button-module_shadow__EbODw {\n  box-shadow: -6px 6px 0px rgba(0, 0, 0, 1);\n}\n\n/* Primary/Default variant styles */\n\n.Button-module_ucomButton__c-1Jp,\n.Button-module_ucomButton__c-1Jp.Button-module_primary__s1sM6 {\n  background: #ffe477;\n  border: 2px solid #FFFFFF;\n}\n\n.Button-module_ucomButton__c-1Jp:hover,\n.Button-module_ucomButton__c-1Jp.Button-module_primary__s1sM6:hover {\n  background: #FFFFFF;\n  border: 2px solid #FFFFFF;\n}\n\n.Button-module_ucomButton__c-1Jp.Button-module_active__kv7U7,\n.Button-module_ucomButton__c-1Jp.Button-module_primary__s1sM6.Button-module_active__kv7U7 {\n  background: #000000;\n  border: 2px solid #000000;\n  color: #FFFFFF;\n}\n\n.Button-module_ucomButton__c-1Jp:disabled,\n.Button-module_ucomButton__c-1Jp.Button-module_primary__s1sM6:disabled,\n.Button-module_ucomButton__c-1Jp:disabled:hover,\n.Button-module_ucomButton__c-1Jp.Button-module_primary__s1sM6:disabled:hover {\n  opacity: 0.7;\n  cursor: not-allowed;\n  background: #ffe477;\n  border: 2px solid #FFFFFF;\n  color: #000000;\n}\n\n/* Secondary variant styles */\n\n.Button-module_ucomButton__c-1Jp.Button-module_secondary__R0waJ {\n  background-color: #CFF2FE;\n  border: 2px solid #7CD5F3;\n}\n\n.Button-module_ucomButton__c-1Jp.Button-module_secondary__R0waJ:hover {\n  background-color: #A2E3F9;\n  border: 2px solid #7CD5F3;\n}\n\n.Button-module_ucomButton__c-1Jp.Button-module_secondary__R0waJ.Button-module_active__kv7U7 {\n  background-color: #C96AAF;\n  border: 2px solid #7C2E70;\n  color: #FFFFFF;\n}\n\n/* Ghost variant styles */\n\n.Button-module_ucomButton__c-1Jp.Button-module_ghost__1KINV {\n  background-color: transparent;\n  border: 2px solid transparent;\n  color: #777777;\n}\n\n.Button-module_ucomButton__c-1Jp.Button-module_ghost__1KINV:hover {\n  color: #333333;\n}\n\n.Button-module_ucomButton__c-1Jp.Button-module_ghost__1KINV.Button-module_active__kv7U7 {\n  color: #000000;\n}";
var styles$1 = {"ucomButton":"Button-module_ucomButton__c-1Jp","small":"Button-module_small__l39oh","medium":"Button-module_medium__KTxdk","large":"Button-module_large__6bsb7","shadow":"Button-module_shadow__EbODw","primary":"Button-module_primary__s1sM6","active":"Button-module_active__kv7U7","secondary":"Button-module_secondary__R0waJ","ghost":"Button-module_ghost__1KINV"};
styleInject(css_248z$1);

const Button = ({ size = 'small', variant = 'primary', shadow = false, active = false, disabled = false, ...props }) => {
    return (jsxRuntimeExports.jsx("button", { className: `${styles$1.ucomButton} 
         ${size && styles$1[size]}
         ${variant && styles$1[variant]}
         ${shadow && variant !== 'ghost' && !active && styles$1.shadow}
         ${active && styles$1.active}
         ${props.className}`, ...props, children: props.children }));
};

const SvgAccessories = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m748.8 354.2-59.7 44-127.9 70.9-15-25.2 33.6-18.7-8.4-40.2-38.3 14.1-11.2-18.7 78.5-39.2 78.5-47.6 45.8-46.7 35.5 87.8-11.3 19.5Zm-91.5-104.6-50.5 7.4-91.5 18.7L399.5 314 266 372.9l-84 50.5-57 42.9-48.5 5.6-36.4-5.6 16.8-28.1 53.2-41.1L215.6 341l157.8-66.3L548 212.1l102.8-22.4h47.6l7.4 11.2-15.9 30.9-32.7 17.7ZM292.2 467.3l39.2 93.4-95.2 25.2-108.4 24.2-32.7-6.5-34.6-84 89.6-10.3 142-42Zm38.3-67.3 124.2-50.5 16.8 9.4 21.5 57.9-88.7 20.6 17.7 32.7 14 36.4 75.6-46.7 23.3 57-9.4 18.7-119.6 46.7-26.2-8.4-56.9-153.1 7.5-20.6Z", className: "accessories_svg__cls-1" })] }));

const SvgAddAvatar = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m249.7 535.3 56.1 28.1 21.8 6.2h9.4l56.1-34.3 37.4-37.4 21.8-43.6 31.2-74.8-34.3-59.2L418 286l-40.5 24.9L268.4 367l18.7-81-84.2 46.8-46.8 59.2 18.7 40.5 31.2 59.2 40.5 40.5 3.1 3.1Z", className: "addAvatar_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "m199.8 304.7 106-49.9v46.8l-9.4 31.2 68.6-40.5 53-40.5 53 53 40.5 74.8-34.3 84.2h34.3l34.3-77.9h21.8c0 3.1-6.2-43.6-6.2-43.6l6.2-62.3-15.6-71.7-18.7-40.5-31.2-56.1-43.6-40.5L393 40h-84.2l-71.7 3.1L165.4 93l-59.2 59.2-24.9 71.7-12.5 43.6 18.7 87.3-9.4 65.5 31.2-15.6 37.4 71.7h28.1L137.4 386l65.5-87.3-3.1 6.2ZM399.3 653.8v-93.5l-46.8 24.9-24.9 6.2-37.4-9.4-77.9-40.5V582l-9.4 43.6-18.7 9.4 143.4 46.8 71.7-28.1ZM442.9 644.4h106c0-3.1-6.2 106-6.2 106v9.4h81v-9.4l-6.2-109.1h109.1c0 3.1 6.2 3.1 6.2 3.1v-77.9h-6.2l-109.1 6.2 6.2-115.3v-6.2h-74.8v121.6l-106-6.2h-9.4v77.9h9.4Z", className: "addAvatar_svg__cls-1" })] }));

const SvgAddUser = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m312.5 658.2-3.5-60.4 116.6 4.3 8.4.3v-84.3l-8.4.4-116.8 4.8 5.1-123.4.3-8.3h-81.6l.2 8.2 1.3 64.1 1.2 55.6.1 3.7-106-6.4-7.9-.4-8.5-.6v86.6l8.3-.3 110.7-4.2 3.1-.1-6.8 118.7-.5 8.5h88.5l-.5-8.5z", className: "addUser_svg__st0" }), jsxRuntimeExports.jsx("path", { d: "m628.5 408.2-77-106.5L446.1 275l-1.6-20 20.5-28.5 24.7-83.6-22.6-43.5L424.2 78l-45.4-3-39.7 19.4-26.7 46.8 19.1 83.3 19.4 28.8-5 21.7-105.4 28.5-72 98.7-39.6 87.6 79.1 4.7-2-94.2-.2-8.2-.6-27.5h137.1l-1.1 28-.3 8.4-3.9 94.2 87.6-3.6 8.4-.3 28-1.1v140.1l-27.9-1-8.4-.3-87.1-3.2 1.9 32.4H530l1.5-6.7 36.8-55.3L687 509.1zM530 558.5l-17.8 23.9-3.3 24.5-.6-.4-3.2-2.9-10.3-52.5 38.5-118.8 55.4 51.8z", className: "addUser_svg__st0" })] }));

const SvgAi = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M738.2 499.5c12 0 21.7 7.8 21.7 19.8v28.1c0 5.5-9.7 15.3-21.7 15.3h-86.7v45.5c0 23.9-12.5 43.4-43.4 43.4h-45.5v86.7c0 12-9.7 21.7-21.7 21.7h-21.7c-12 0-21.7-9.7-21.7-21.7v-86.7h-53.7v86.7c0 12-21.1 21.7-33 21.7h-14.9c-18.8 0-28.5-9.7-28.5-21.7v-86.7h-65v86.7c0 12-9.7 21.7-21.7 21.7H259c-12 0-21.7-9.7-21.7-21.7v-86.7h-45.5c-23.9 0-43.4-19.4-43.4-43.4v-45.5H61.8c-12 0-21.7-9.7-21.7-15.3v-28.1c0-12 9.7-19.8 21.7-19.8h86.7v-67H61.8c-12 0-21.7-9.7-21.7-21.7v-21.7c0-12 9.7-21.7 21.7-21.7h86.7v-65H61.8c-12 0-21.7-9.7-21.7-21.7V259c0-12 9.7-21.7 21.7-21.7h86.7v-45.5c0-23.9 19.4-43.4 43.4-43.4h45.5V61.8c0-12 9.7-21.7 21.7-21.7h21.7c12 0 21.7 9.7 21.7 21.7v86.7h65V61.8c0-12 9.7-21.7 28.5-21.7h14.9c12 0 33 9.7 33 21.7v86.7h53.7V61.8c0-12 9.7-21.7 21.7-21.7H541c12 0 21.7 9.7 21.7 21.7v86.7h45.5c30.9 0 43.4 19.4 43.4 43.4v45.5h86.7c12 0 21.7 9.7 21.7 21.7v21.7c0 12-9.7 21.7-21.7 21.7h-86.7v65h86.7c12 0 21.7 9.7 21.7 21.7v21.7c0 12-9.7 21.7-21.7 21.7h-86.7v67h86.5Zm-142-271c0-13.6-11-24.6-24.6-24.6h-343c-13.6 0-14.4 11-14.4 24.6v343c0 13.6.7 24.6 14.4 24.6h343c13.6 0 24.6-11 24.6-24.6zm-88.7 48.1h50.9v246.7h-50.9zm-97.4 195.8H321l-16.9 50.9h-54l91.8-246.7h52.2l87.2 246.7h-54zm-44.7-133.5-30.6 92.3h61.6z", className: "ai_svg__cls-1" })] }));

const SvgArchive = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m297.5 419.9 1.8 86.6 104.8-86.6 164 8.2 49.2-270.7L182.7 182 199 428.1zm147.6-147.7h49.2v49.2h-49.2zm-82 0h49.2v49.2h-49.2zm-82 0h49.2v49.2h-49.2z", className: "archive_svg__st0" }), jsxRuntimeExports.jsx("path", { d: "M754.5 282.2 640 295.7l-35.9 197.7-193.8-29.2L267.4 574l-7.2-86.6-101.6 7.7-12.9-192.9-88.7-7.3L7.2 629.7 62 693.1l652.6 17.7 77.3-65.9zM599.2 147.7l4.9-26.6L201 143.3l1.8 26.2zM573.6 113.5l4.4-24.3-354.3 19 1.6 23.9z", className: "archive_svg__st0" })] }));

const SvgAttack = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m723.6 636 61.2 51.8-54.6 50.1-56 51-49.4-70.6-51.1-55.9-87.8 81-56.3-40.5 51.8-69.8L69.7 217l-.9-188L73 8.7l185.8 39.5 382.4 436.5 72.1-45 38.3 47.3-85.5 90zM614.9 331.3 451.7 147.7l87.2-99.5L724.7 8.6l22.5 20.3L728 217zM84.4 439.6l72 45 56.4-38.4 137.4 152.6-34 34.4L368 703l-56.3 40.5-87.8-81L180 716l-58.8 75.3-53.7-53.4-52.2-50.1 70.6-61.2 45.9-49.7-85.5-90z", className: "attack_svg__st0" })] }));

const SvgAudio = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m721.7 524.8-34.1 74.9-68.2 62.6-42.6-34.1 36.9-28.5 39.8-49.1 22.7-67.2 14.2-79.5-17-88-36.9-73.8-56.8-56.8 34.1-42.6 56.8 51.1 39.8 65.3 47.4 102.2v79.5zm-98.1-163.5 2.8 88-36.9 79.5-45.4 45.2-28.4-39.4 34.1-45.4 22.7-51.1-11.4-99.4-45.4-73.8 25.6-36.9 22.7 17 42.6 51.1zM237.1 554.7 50.6 528l-3.1-263.6 97.7-8.1 81.4-2.7 231-178.5 4.3 650z", className: "audio_svg__st0" })] }));

const SvgAudioOff = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M462.9 45.3s-40.8 31.4-46.7 29.1c-5.8-2.4-109.1 84.1-109.1 84.1l-96.5 81.8-88.8 2.9L15.2 252l-5.6 46.7 6 112.2 3 128.8 106.9 9.1 96.7 20.1 93.5 66.4 109.8 77.2 42.1 42.3V562.9l-7-217.4zM744 329.4l-39.2-39.2-74.3 80.5-74.3-80.5-39.2 39.2 81.8 75.6-74.3 80.5 24.2 24.3 81.8-75.5 81.8 75.5 24.2-24.3-74.3-80.5z", className: "audioOff_svg__st0" })] }));

const SvgAuto = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 1200 1200", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M251.26 649.86h81.922l-39.828-174.27zM953.93 469.4c-40.535 0-56.09 60.984-56.09 136.19 0 75.227 16.262 136.18 56.09 136.18 39.805 0 56.074-60.949 56.074-136.18 0-75.215-15.551-136.19-56.074-136.19" }), jsxRuntimeExports.jsx("path", { d: "M1060.8 353.59h-900c-33.145 0-60 26.855-60 60v384c0 33.145 26.855 60 60 60h900c33.145 0 60-26.855 60-60v-384c0-33.145-26.855-60-60-60M365.46 791.11l-20.41-89.34H238.72l-21.59 89.34h-55.488l101.89-371.05h61.32l97.777 371.05zm155.11.516c-105.98 0-97.789-131.51-97.789-131.51l.004-236.35h52.812v235.37c0 75.457 29.074 79.98 41.172 80.027h7.586c12.098-.047 41.207-4.57 41.207-80.027l-.004-235.37h52.789v236.35c.012 0 8.207 131.51-97.777 131.51m256.59-4.239h-58.512v-310.84h-72.07v-52.789h201.36v52.79h-70.777zm176.8 5.184c-71.102 0-106.02-83.7-106.02-186.98 0-103.26 35.293-187 106.02-187 70.703 0 106.01 83.723 106.01 187 0 103.29-34.922 186.98-106.01 186.98" })] }));

const SvgAvatar = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M728.3 0H71.7C32.2 0 0 32.2 0 71.7v656.6C0 767.8 32.2 800 71.7 800h656.6c39.5 0 71.7-32.2 71.7-71.7V71.7C800 32.2 767.8 0 728.3 0m24.4 71.7v656.6c0 13.4-10.9 24.4-24.4 24.4H71.7c-13.4 0-24.4-10.9-24.4-24.4V71.7c0-13.4 10.9-24.4 24.4-24.4h656.6c13.4 0 24.4 11 24.4 24.4" }), jsxRuntimeExports.jsx("path", { d: "M101 101v62.8h22.2v-40.6h40.6V101zM636.2 101v22.2h40.6v40.6H699V101zM123.2 676.8v-40.6H101V699h62.8v-22.2zM676.8 636.2v40.6h-40.6V699H699v-62.8z" }), jsxRuntimeExports.jsx("path", { d: "m636 428.1-19.9-4-29.8 67.9-29.1 1 29.6-74.8-35.4-66.9-47.3-46.3-45.3 35.7-61 34.5 6.9-26.8 1.9-41.4-93.1 44.3-58.4 75.7s34.1 78.5 32.5 79.7l-23.6 1-31.5-64-26.3 12.8 7.5-56.3-17.7-77.5 9.9-38.4 22.7-64 51.2-53.2 63-44.3 63.9-4 73.8.7 57.1 26.9 39.4 36.4 27.6 48.3 17.7 35.5 12.8 62.9-4.3 56.1zm-317-53.2 72.9-40.3-17.7 70.1 96.4-48.2 36.4-22.9 26.5 29.6 29.6 53.2-26.5 65-19.7 38.4-33.5 31.9-50.2 29.3-8.1 1.8-19.5-4.9-49.2-25.6-36.4-35.6-26.5-53.2-15.8-35.5zm5 220.5-1-36.5 68.9 34.6 33.3 6.9 21.9-5.9 62-35.5 6.9 50.2 23.6 25.6-114.4 47.3-126.8-41.4 15.8-6.9z", className: "avatar_svg__st0" })] }));

const SvgBackArrow = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 84 89", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m84 56.363-33.71-1.64 14.451 30.62L60.896 89l-5.77-3.048L0 46.938v-4.876L55.126 3.048 60.896 0l3.845 3.824L50.29 34.58 84 32.637z", className: "back-arrow_svg__st0" })] }));

const SvgBackpack = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M715.1 747.4 62.5 729.7 7.7 666.3l49.8-334.8L182 341.7l97.2 10.1 22.4 134.4 196.8 7.6 14.9-144.6 92.2-12.7L755 318.8l37.4 362.7zM495.9 219.9l-204.3-2.5-10 63.4-214.2-12.7L94.8 52.6l617.8 7.6 19.9 218.1-216.7 2.5z", className: "backpack_svg__st0" })] }));

const SvgBin = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m112.3 216-26.8-60.2 160.6-40.1-6.7-66.9L533.8 8.6l6.7 66.9 171.4-33.4 2.5 80.3zm475 575.4H202.4l-49.9-541.9 488.4 13.4z", className: "bin_svg__st0" })] }));

const SvgBodyAlert = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("defs", { children: jsxRuntimeExports.jsx("path", { id: "bodyAlert_svg__a", d: "M104.2 8.6h591.6v782.7H104.2z" }) }), jsxRuntimeExports.jsx("path", { d: "M621.7 399.2h-17.4c-7.2 7.5-20.7 19.9-29.3 24.7v-.9c5.7-14.5 27.7-94.6 24.7-105.2-17.9-63.6-38.8-126.1-63.1-179.3h-.9c-2.7 22.6-11.8 58.9-21 76.8h3.6c-9.9-47.9-16.7-95.1-22.8-144.5-.3.6-.6 1.2-.9 4.7-8.2 16-17.4 34.9-19.1 53.8-17.6 23.8-30.4 45.2-49.5 63.1-6.2 7.3-13.1 20.2-17.3 22 2.8-38.8 7.6-76.6 11.9-110.2-.3-3.5-.6-2.9-.9-2.3-7.3 10.7-15.6 20.4-22.9 31.1-22.7 32.3-57.1 79.7-84.1 105.2-.3-39 .1-78.8-.9-117.1l-.9 1.8c-21.4 43.1-47.9 89-71.3 133.6-10.4 21-19.8 42.1-30.2 63.1 1.5 15.7 3 15.2 7.9 22.9 1.5 31.5 10.1 59.4 18.7 84.2h-.9l-1.8-1.8c-10.7-8.5-21.3-17.1-32-25.6h-16.5c-.3-22.3.3-45.4 0-67.7-11 9.1-22.9 12.2-33.8 17.4 4.4-32.6-2.4-98.8 1.8-124.4C172.2 106.2 261.8 25.1 366.5 15c32.8-3.1 75.5-3.2 104.3 4.6 30.7 8.3 58.5 20.2 81.4 36.6 59.1 37.9 88.6 97.5 102.4 174.7l.9 117.1c-11.3-5.2-22.6-10.4-33.8-15.5zM490 233.7c-25.7-3.6-46 5.5-62.2 24.7 2.4 4.2 4.9 6.8 9.1 9.1 18.1-11.9 34-15.9 56.7-10.1-.2 2.8 0 4.4 0 7.3 10.5 2.4 5.5-2.7 8.2-3.7 7 4.1 18.1 8.7 18.3 14.6 5.2-3.8 5.5-8.8 7.3-12.8-2.6-5.3-6.9-9.9-11.9-13.7 9.5-5.7 17.7-19.2 23.8-29.3h.9c8.9 27.1 17.3 60.1 25.6 86 1 14.7-7 52.6-11.9 70.4-6.9 25-14.9 54.3-24.7 74.1-6.5 13.2-103 82.9-126.2 83.2-14.6.2-48-22.8-57.6-31.1-18.6-13.4-37.2-27.7-55.8-41.2-20.1-23.3-27.4-53.2-36.6-95.1-5.1-18.7-8.5-37.4-7.4-57.6 10.1-28.7 24.8-57.3 39.4-86h8.4v.9c-3.1 9.1-6.1 18.3-7.5 27.4-2.6 2-4.8 5.8-10.1 14.6 8.1 26.5 17.7-6.4 9.1 20.6 18.7-9.8 32.2-20.4 43.9-30.7 17.9 7.2 25.7 6 36.6 11.9 1.8-.9 3.9-2.4 5.5-4.6v2.7c-.6 3.7-1.2 11.1-1.8 11 29.7-19.7 61-43.8 85.1-77.8 8.5-12.5 17.1-25 25.6-37.5h.9c3.2 24.5 10.9 55 9.3 72.7m-109.7-36.6c.5 3.9-6.7 51.6-8.2 58.5-2.1-2.1-7.9-7.9-10.1-7.5-6.1-6.2-7.9-6.9-14.6-9.9 9.6-5 24.4-27.8 32.9-41.1m-22.9 113.4c-8 .5-12.6 0-15.6-6.4.1-6.9 1.7-8.4 3.7-8.2-30.7-23.6-70.6 21.8-39.3 43.9 14.9-1.2 26.8-1.1 41.2-.9 8.1-8 15.2-13 10-28.4m109.8-23.8c-15.5 10.2-33.6 30.7-11.9 52.1 16.3.4 23.6.1 42.1 0 32.7-17.1.4-54.9-30.2-52.1M426 391.9c-18.4 15.3-40.9 4.1-51.2.9-4.1 1.4-4.6 3-4.4 6.4 3 8.3 6.1 3-1.1 4.6 11.4 15.9 48.2 21.6 68.6-1.8-.1-6.9-3-7.9-4.6-10.1-2.4 0-3 .6-7.3 0m-70.4 50.3c-10.1 27.4 20.2 18.7 53.1 18.3 25.6-.4 33.8 4.8 46.6-.9 2 3.6 5.6-7.5 10.7-11.9-7.4-2.7-8.6-5.5-9.8-8.2-32 0-92.9-1.5-100.6 2.7m-29.3 93.1c24.6 3.6 54.6 37.3 88.7 30.4 25.9-5.2 43.9-24.2 64.9-35.7 0 20.8-.5 42.6 9.1 55.8 13.3 18.2 42.5 21.5 67.7 27.4 62.1 17.2 79.3 20.1 107 43.9 12.4 10.7 31.1 41.2 31.1 81.4-11.9 2.8-27.4 9.2-39.3 13.8-25 5.8-42.8 11.6-75 17.4-108.6 21-271.1 18.5-374.1-3.7-34.7-7.4-67.1-14.7-94.2-30.2 0-63.7 40.5-92.5 91.2-108.6 44.9-19.6 62.6-10.6 105.4-34.1 14.9-8.1 18.2-32.5 17.5-57.8", className: "bodyAlert_svg__st1" })] }));

const SvgBodyAnger = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("defs", { children: jsxRuntimeExports.jsx("path", { id: "bodyAnger_svg__a", d: "M140.4 8.6h519.1v782.7H140.4z" }) }), jsxRuntimeExports.jsx("path", { d: "M594.5 352h-15.3c-5.3 6.7-16.6 16.9-24.9 20.1v-.8c5-12.7 23.3-78.9 20.9-87.6-11.7-59.9-38.5-119.4-55.4-160.5h-.8c-2.4 19.8-6.1 55.2-11.3 67.4-2.7 0-5.4-2.4-7.9-2.4-5.4-41.5-10.7-76.4-16.1-124.4-.3.5-.5 3.4-.8 1.6-7.2 16.6-15.3 33.2-17.2 49.8-15 20.9-28.6 38.3-43 55.4-5.4 11.7-8.6 15.6-15.6 19.3 1.7-33.4 7.2-66.8 10.8-100.4-.3.5-.5 1.1-.8 1.6-6.4 9.4-10 18.7-19.3 28.1-20 28.4-52.9 70.6-74.6 92.3-.3-34.3-.5-69.3-.8-103.6-.3.5-.5 1.1-.8 1.6-20.6 39.1-41.2 78.2-61.8 117.2-9.1 18.5-18.2 36.9-27.3 55.4 1.3 12.6 2.7 13.4 6.7 20.1 2.6 27.5 9.2 52.8 16.5 78.6h-.8c-.5-5.3-1.1-5.8-1.6-6.3-9.4-7.5-18.7-15-28.1-22.5h-14.4c-.3-19.5-.5-32.1-.8-58.6-9.6 4.6-19.3 9.1-28.9 13.6 3.9-30.7-1.6-95.2 1.6-108.4C210.8 84 269.7 28.4 370.6 14.8c28.7-3.9 66.3-2.8 91.5 4 26.9 7.3 51.3 17.8 71.4 32.1 51.3 33.3 77.7 86.3 89.9 153.4.3 34.3.5 73.6.8 102.8-9.9-4.5-13-9.1-29.7-13.6zM470.1 141.6c1.9 6.1 10.9 67.7 9.6 75.5-18.7 3.3-52 35.4-53 51.4 3.7 1.6 4.1 2.8 13.9 3.2 6.1-9.1 23.4-23.9 38.2-30.2 9-5.6 23.3-10.2 27.3-14.8-1.1-2.7-2.1-5.4-3.2-8 8.5-6.5 16.5-15.3 19.3-24.1h.8c7.6 24.5 19.3 55.6 23.3 78.7 2.4 8.6-25 113.1-35.3 128.4-10.4 13.4-31.1 29.3-46.5 33.8-9.8 6.9-50.1 37.9-65 34.5-22.7-5.1-94.5-57.5-105.1-75.5-10.5-11.6-14.5-40.5-20.9-61.8-3.5-11.5-7.6-49.1-9-57.6 9-27.8 22.7-54.6 35.5-79.7 3.8 2.4-.5 20.1 0 20.1-1.4.6-3 4.2-8 9.6 1.2 4.4 3 5.2 7.2 6.4v17.7c8.1-2.4 13.5-5.4 20.1-7.7 16.4 7.6 30 18.5 43.3 30.2 5.6-.4 7.9-2.4 10.4-5.6-4-19.2-20.5-31.5-35.3-40.1 1.3 2.3 5.2-3.2 4-4.8 15.9-11.6 29-30.3 40.1-38.8h.8c-3.2 17.2-6.4 39.6-9.6 62.1 38.2-24.6 73.7-62 97.1-102.9M297.6 253.2c-.8 2.9-1.6 5.9-2.4 8.8 2.8 3.2 3.6 3.4 11.2 8-8.4 9.9-10.5 19.2-4.8 33.7 19.3-2 37 0 49 4.8 4-3.6 7.1-8.5 8-16.9-.3-.8 9.2 2.1 6.8-4.8-20.4-11.3-42.9-27.2-67.8-33.6m200.6 0c-22.5 16.7-47.5 18.9-65 38.8v-2.6c1.1.9 6.3 2.8 6.3 2.8.3 5.6 6.4 15.8 8.2 16.4 5.8-2.1 15.3-5.3 21.7-5.6 9.1.3 18.2.5 27.3.8 5.2-12.7 3.2-24.7-4.8-32.9 2.2-.5 4.8-1.1 7.6-1.6-3.3-2.4 5.2-2.6 3.7-7.2-.5-2.7-1.1-1-1.6-8 3.4-.3-2.3-.6-3.4-.9m-123.6 84.4c1.6 3-3.4 3.8-4 8.8 21.1 24 43.9 23.8 65 0-.6-5-1.9-5.9-4-8.8h-4.8c-18.8 19.5-28.6 19.3-47.4 0zm26.5 35.3c-11.1 4.1-25.8.3-34.5 5.6-2.7 6.6-15.2 27.2-15.2 57 10.1 1.1 99.8-.8 102.7-4.8 5.8-11.2-10.4-47.5-16-55.4-12.4-.8-24.7-1.6-37-2.4m47.9 47.4c-31.9.3-59.2.5-86.5.8v-4c.5-2.7 1.1-5.4 2.8-8 6.3 3.8 13.8-1.1 21.3-1.6.5-2.9 1.1-5.9 3.8-8.8-2.4-.3-2.7-.5-3-.8-6.2.3-12.3.5-18.5.8 2.1-4.3 4.3-8.6 6.4-12.8 18.7-.3 37.5-.5 56.2-.8 1.9 4.3 3.7 8.6 5.6 12.9-10.7.3-21.4.5-32.1.8-.3 3.2 4.8 6.4 2.1 11.7h34.8c.9 1.7 1.7 8.1 7.1 9.8m-113.7 44.9c19.4 8 46.8 40.4 77.8 32.9 22.6-5.4 38.6-21.2 57-31.3v20.1c-28.9 16.8-55.4 48.1-30.5 86.7 12.2 7.9 14.3 14.9 26.2 16.9-13.1 59.3 22.7 55.3 38 93.1-.3.5-.5 1.1-.8 1.6-23.3 1.3-46.6 6.1-69.8 4-43.8 2.2-90.4.8-130-4 8.1-44.4 52.8-26.3 43.3-95.5 54.9-36 30-84.1-11.2-103.6zm-8.8 105.2c.3 12.9 7.3 20.1 13.4 30.5-5.3 29-37.3 48.1-40.7 50.6-2.4 7.2-4.8 14.5-7.2 21.7-13.8 35.2-24.7 71.1-33.7 112.4-32.8 12.6-77-15.8-86.7-36.1 7.2-11.2 14.4-22.5 21.7-33.7 13.7-22.3 32.7-68.2 37.7-88.3 6.5-26.1-20.4-71-16.9-97.2 7.5-8.9 47.6-41.4 57-45 8.8 2.1 17.7 4.3 26.5 6.4 30.4 10.7 95.8 38 41.7 79.5-4.3-.3-8.6-.5-12.8-.8m154.1 0c-.7.3-8.6.5-12.8.8-33.3-18.2-16.3-47.9 5.6-64.2 7.4-5.6 56.4-23.9 62.6-21.7 10.3 3.7 59.5 36.2 57 45.8 5.5 25.7-24.4 75.6-16.9 96.4 4.5 15.9 23.7 67.5 36.9 87.5 5.4 10.9 19.8 22.5 22.5 35.3-10.7 19.3-28.7 30.6-52 36.1-12.7 1.9-30.8 3.2-34.7 3.2-2.1-16-4.3-26.5-6.4-36.9l-22.5-69.9c2.3-10.4-8-20.9-9.7-31.3-6.2-5.5-27.9-14.1-34.5-36.9-4.7-16.6 4.8-27.2 4.9-44.2m-280.1-8.3c4.9 20.2 8.6 44.2 13.6 67-3.4 9.5-10.5 30.5-16.9 36.9-17-4-36.5-4.4-49.8-18.5-.7-51.5 26.9-71 53.1-85.4m406.9-.5c22.1 10.3 53.3 36.1 51.4 93-15.5-1-33.9 7-49.8 11.3-5.3-12.3-10.7-24.6-16-36.9 4.7-22.5 9.6-41.7 14.4-67.4", className: "bodyAnger_svg__st1" })] }));

const SvgBodyEmbarrassed = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("defs", { children: jsxRuntimeExports.jsx("path", { id: "bodyEmbarrassed_svg__a", d: "M137.8 8.6h524.5v782.7H137.8z" }) }), jsxRuntimeExports.jsx("path", { d: "M596.6 355.5h-15.4c-6.8 6.3-17.9 16.1-25.1 21.1V375c5-12.9 24.1-79.3 21.1-88.8-13.9-59.7-37.4-118.3-56-161.8h-.8c-2.4 20-10.3 61.6-18.7 67.3h3.2c-9.4-41.9-14.8-78.8-20.2-127.3-.3.5-.5 3.4-.8 8.8-7.3 9.6-8.4 26.3-21.9 43.1-9.8 21.1-21 38.7-38.9 56-5.3 13.1-8.3 15.7-15.4 19.5 1.3-33.8 5.9-67.6 10.5-101.4-.3.5-.5 1.1-.8 1.6-6.5 9.5-9.7 18.9-19.5 28.4-21.6 28.4-51.1 70.5-75.4 92.5-.3-30.6-.5-69.2-.8-103.8-.3.5-.5 1.1-.8 1.6-21.8 39.2-42.4 79-63.3 118.4-9.2 18.6-17.6 37.3-26.8 56 1.4 12.3 3.5 18.4 4.9 25.1 6.1 26.6 11.7 47.7 18.7 70.6h-.8c-.5-1.3-1.1-1.9-1.6-2.4-9.5-7.6-18.9-15.1-28.4-22.7H209c-.3-19.7.3-40.3 0-60-9.7 4.6-20.3 10-30 14.6 3.9-31.3-2.1-89.1 1.6-109.5 19.1-104.7 87.6-172.3 189.7-186 29-3.9 67-2.9 92.4 4.1 27.2 7.4 51.9 18 72.2 32.4 52.4 33.6 78.5 86.4 90.8 154.9.3 34.6.5 74.1.8 103.8-10-4.6-20-10-30-14.6.1 19.8.1 40.4.1 60.1m-205.2 80.3c31.4.3 74.7-.1 70.5-32.4l8.1-2.4c.3-1.6.5-3.2.8-4.1 4.5-3.8-2.5-5-5.7-6.5-27 2.4-54.1-4.9-81.1-7.3-.7-8.5-9.4-21.1-21.1-21.9-26.7 8.9-46.9 23.9-70.6 35.7-11.8-29.6-20.2-60.6-28.4-95.7-1.6-8.7-3.2-17.3-.9-23.6 9-27.8 22-53.2 34.9-78.6h7.4v.8c-5.4 12.2-6.9 24.3-7.4 36.5-2.8 3.7-13.6 9.7-9.5 24.3-3.1 4.2-.8 8.1 8.5 10.5 9-11.3 22.7-26.2 39.2-30.9 8.1-9.9 16.2-14.2 24.3-18.6 9-6.7-2.1-12.5-4.1-13 7-9.2 17.3-20.8 24.3-24.9h1.6c-3.2 17.6-6.5 40.3-9.7 63 25.9-16.3 59.9-43.5 75.4-68.9 7.6-11.1 15.1-22.2 22.7-33.3h.8c3 24.3 6 48.7 8.9 73-8-4.1-24.8-12-36.5.2-.3-4-.5-1.3-.8 8.5-1.3-2.4 18.4 5.2 26.8 10.8 26.7 18 24.9 19.8 40.6 34.1.8-.3 3.2-.5 4.1-.8 5.1-4.8 5.2-6.6 5.7-13.8 1.3-12.6-18.5-24.3-23.5-28.4 9.6-5.5 25.7-22.6 26.8-31.6h.8c7.6 25.4 15.1 50.8 22.7 76.2-.4 13.9 1.3 41-9.7 55.2-6.7 24.4-13.4 54.4-21.9 71.4-3.3 12.4-33.1 36.9-52.7 42.2-18.5 18.8-56.3 47.5-76.2 26.8 5-9.7 5.1-17.4 4.9-32.5m-63.9-174.9c-8 13.2-31.7 37.9 2.3 47.5 29.6 8.4 56.5-39.1 24.3-50.3-3.4-1.7-11.4-4-26.6 2.8m131-4.4c-41 18.1-4.7 70.7 26.2 47.1 21.5-16.5-3.8-46.4-26.2-47.1M373.6 354c5.6-5-2.2-4.2-3.2-3.4.3 2.2.5 4.3.8 6.5 14 20.8 48.4 17.7 62.4 0-.8-2.2-1.6-4.3-2.4-6.5-11.1-2.1-19.4 6.3-33.2 4.1-5.1-1.6-13.5-6.3-24.4-.7M359 383.9c1.6.5 3.2 1.1 6.3 1.6 3.1 9.7 7.7 19.5 12.3 29.2-1.1 3.2-2.2 6.5-3.2 9.7-.3 9.7-.5 19.5-.8 29.2-2.7 4.1-5.4 8.1-8.1 12.2-3.2 10.3-6.5 20.6-8.6 30.8-3.8 15.7-6.5 31.4-8.5 47V567c-7.2 9.1-13.7 19.6-20.2 30.2L276.3 701c-5.4 20.7-24.4 86-46.2 88.4-24.5-16.1-65.4-45.2-70.6-77.7 11.4-12.1 22.7-23.2 34.1-34.3 20.3-26 38.6-52.1 56-81.1 5.7-9.2 11.4-18.4 17-27.6 4.3-28.4-9.4-74.8-8.1-98.1 9.5-15.7 18.9-31.4 28.4-47 6.8-1.3 13.5-6.5 20.3-9.7 17.2-10 34.5-20 51.8-30m33.2 13.8c18.1 1.6 38.2 3.2 54.3 4.9.3 2.7.5 5.4.8 8.1-1.1 8.1-1.3 2.7-3.2 4.1-12.4 12.3-32.9 5-50.3 4.9 3-9.8 1.4-9.5-1.6-22m78.7 73c2.3 21.1-4.7 40.1 13.8 62.1 13.2 3.8 32 6.8 51.1 11.8 49.1 11.9 82 14.4 110.3 55.2 7 10.1 15.4 22 15.4 60.8-10.5-1.6-24.3 4.1-34.9 8.1-26.8 6-53.3 12.6-80.3 17.8-70.5 13.4-168.6 9.9-244.1 5.7 10.7-25.1 34.7-71.8 47.8-92.5 5.1-7.3 10.3-14.6 15.4-21.9 4.6-12.5-.7-26 1.6-39.7 2.5-15 3.8-30.7 8.9-43 35.9 24.3 72.1-7.3 95-24.4m-223.8 79.5c6.7 8-6.5 28.6-9.7 34.1-16.8 28.5-38.9 61.4-64.1 81.9-9.5-4.1-14.9-8.1-28.4-12.2-.5-54.5 30.1-76.2 68.9-94.9 11.1-3 22.2-6 33.3-8.9", className: "bodyEmbarrassed_svg__st1" })] }));

const SvgBodyHeadnod = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("defs", { children: jsxRuntimeExports.jsx("path", { id: "bodyHeadnod_svg__a", d: "M22.1 8.6h755.7v782.7H22.1z" }) }), jsxRuntimeExports.jsx("path", { d: "M614.7 397.3h-17.2c-3.7 6.8-19.8 16-28 20.8v-.9c5.6-14.3 25-89.6 23.5-97.4-4.8-44.9-41.5-126.8-62.4-182h-.9c-4.1 22.8-10 65.2-20.8 73.2h3.6c-10.5-46.6-16.6-93.3-22.6-140-.3.6-.6 6.1-.9 1.8-8.1 18.7-9.4 37.4-24.4 56-10.9 23.5-23.4 43.2-43.4 62.4-5.9 7.4-9.2 17.5-17.1 21.7 1.5-37.7 6.6-75.3 11.7-113l-.9 1.8c-7.2 10.5-10.8 21.1-21.7 31.6-22.5 31.9-59.1 80.2-84.1 103.1-.3-36.2-.6-77.1-.9-115.7l-.9 1.8-69.6 132c-10.2 20.8-20.5 41.6-30.7 62.4 1.5 15.4 3 19.6 7.8 27.1 3.6 29.7 11.1 55.7 18.5 80h-.9c-.6-2-1.2-2.6-1.8-3.2-10.5-8.4-21.1-16.9-31.6-23.5h-16.3c-.3-23.8.3-45.8 0-67.8-10.8 5.1-22.6 11.2-33.5 16.3 4.4-38.7-2.1-90.2 1.8-122.9 13.2-94.5 95.8-196.4 211.6-207 32.5-3 74.7-3.2 103.1 4.5 30.3 8.2 57.8 20 80.5 36.2 58.4 37.5 87.5 98.3 101.3 172.7.3 38.6.6 84.3.9 115.7-11.1-5.1-22.3-10.2-33.4-15.4-.3 21.9-.3 43.9-.3 67.7M475.4 157.8c2.5 9.7 11 80.5 11.8 95.8h-.9c-10.6-4.6-30.5-9-43.4-4.5-.8 5.3-.4 8.2.9 12.7 32.9 11.4 51.5 24.7 79.6 47 1.8-.9 3.6-1.8 5.4 1.7 14.6-18.4-15.3-42-31.6-51.4l1.8-2.7c16.6-7.5 26.9-27.4 34.4-38h.9c8.5 31.9 23 63.6 26.2 88.6 6.7 15.6-28.1 127.3-39.8 145.3-6.4 14.3-35.1 32.8-52.4 37.3-11.1 7.8-56.4 42.7-73.2 38.9-25.6-5.8-106.5-64.8-118.4-85-11.9-12.2-16.3-45.6-23.5-69.6-3.9-12.9-15.6-56.5-10-63.4 10-32.7 24.5-61 38.9-89.4h8.3c-6 17.5-7.7 35-8.3 52.4-4.1 6.9-24.5 12.6-9 35.3h3.6c12.7-9.6 24.4-19.8 38-28.9 10.6-6.2 33.7-15.1 42.3-19.9 1.3-4.3-.3-8.9-2.5-12.7h-21.7c11.4-5.1 10.2-10.2 15.4-15.4 9-11.1 18.1-22.3 27.1-25.7h.9c-3.6 17.5-7.2 42.9-10.8 68.2 42.8-27.6 84.3-71.4 110-116.6M314.5 303.3c-11.9 4.9-36.9 19.2-43.2 39.8h.7c53.6-4.5 70.8 2.9 94.3 14.4 6-6-.8-7.5-.2-8.1-.1-11.8-7.4-31.4-14.5-41.6-12.4 5.6-24.7-3-37.1-4.5m166.4-.9c-.7 7.7-29.1 10.9-36.2 8.1-3.6 10.7-15.7 27.9-9.9 47h.9c28.5-13 52.5-18.5 97.7-14.4-5.6-15.2-40.9-39.3-52.5-40.7m-109.4 85.9-4.5 5.4.9 4.5c10.2 21.9 57.3 17.6 67.8-.9-.7-5.3-2.2-5.8-4.5-9-13.6.6-18.8 11-34.4 8.1-9.8-1.8-13.8-7.6-25.3-8.1m-31.7 39.8c19 40.5 102.8 42.8 123 0h-3.6c-38.4 11.2-75.8 11.1-119.4 0M322.6 523c21.3 10.3 47.5 36.9 81.4 37.1 30.9.1 49.7-23.9 70.5-35.3-.3 39.7 2 60.6 38 73.2 9.3 2.7 20.5 5.7 29.8 7.2-18.1 2.1-56.1 13.4-53.3 21.7-32.9 45.5 31.3 123.8 47.9 140.1-57.6 5-146.3 22.6-216.1 5.4-18.2-3-45.3-1.9-63.3-7.2h1.8c7.8-8.7 19.9-14.6 30.9-29.8-6.2-3.3-5.9-2.7-5.6-10 4.2-3.6 8.4-7.2 12.7-10.8 22.8-33.2 24.2-56.2 15.4-89.5-10.5-4.8-21.1-9.6-31.6-14.5-8.7-2.5-19.2-.6-25.3-5.4 52.6-10.2 67.9-23.1 66.8-82.2m-151 22.6c42.4 3.8 23.8 55 14.5 72.3 1.3 2.3 1.5 7.6 3.6 4.5 9.8 5.6 25.4-2.1 38.9 0 23.2 3.7 44.4 14 62.4 18.9 15.6 21.9-32.4 91.4-54.2 112.1-39.7.3-63.8-20.6-98.6-9.9-17.8 15.4-28.5 32-53.3 46.1-26.9-13.4-36.3-35.1-60.6-58.8 12.1-16 55.4-47.9 73.2-59.7 8.1-4.2 16.3-8.4 31.7-12.7-4.9-6-2.5-12.1-.1-18.1 15.8-18.1 23-32.9 29.8-55.1 5.5-17.5-2.5-39.5 12.7-39.6m447.6 0c3.9 1.2 7.8 2.4 11.8 10.5 4.9 14.6 4.1 33.7 11.7 51 4.8 10.8 8.6 3.4 22.6 33.4 2.4 6 7.1 12.1 7.2 18.1 10.2 5.7 20.5 11.5 30.7 17.2 22.3 18.1 44.6 36.2 66.9 54.2v.9c-16.7 23.7-33.6 46.2-60.6 59.7-17.8-15.4-35.6-31.6-53.3-47-36.1-10.9-77.2 15.5-98.6 9-8.3-4-21.6-18.6-25.3-27.1-2.4-7.2-4.8-8.6-7.2-21.7-3.6 3.6-7.2-3.6-10.8-5.4-1.8-8.7-3.6-17.5-5.4-26.2-7.9-7.4-11.7-12.6-4.5-34.3 20.9-9.1 38-13.4 61.5-15.4 16.4 4.2 35.2 7.9 42.5-4.5-9.2-25.2-26.7-59.3 10.8-72.4", className: "bodyHeadnod_svg__st1" })] }));

const SvgBodyHeadshake = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("defs", { children: jsxRuntimeExports.jsx("path", { id: "bodyHeadshake_svg__a", d: "M129.4 8.6h541.2v782.7H129.4z" }) }), jsxRuntimeExports.jsx("path", { d: "M232.1 479c15.8 11 44.7 76.9 70.1 76.1-5-4.3-4.6-3-1.4-6.7h2.5c22.4 9.8 21.4 24.3 33.9 30.9 2.4 9.5 11.8 19 21.3 28.4 2 4.7 3.9 16.4 5.9 14.2 5 2.5 10 5 16.9 7.5-2.4.8-2.9 1.7-3.5 2.5-24.8 15.4-48.8 27.1-68.6 39.3-42.7-7.5-58.5-53.4-66.9-78.6-5.6-7.2-11.2-14.5-16.7-21.7-13.8-22.7-19.6-63.8-2.5-88.7 2-.7 12-2.4 9-3.2m370.7-110.1h-15.9c-1.3 5.5-19.3 15.7-25.9 19v-.8c5.2-13.3 24.3-82.5 21.7-88-15.8-76.8-43.4-130.6-57.7-170.4h-.8c-2.5 20.6-12.1 59.5-11.9 70.3-2.8 0-5.6-2.5-8.2-2.5-5.6-43.2-11.2-86.4-16.7-129.6-.3 3.2-.6 1.1-.8 1.7-7.5 17.3-16.7 36.2-24.3 53.5-10.1 21.8-20.4 39.1-38.5 56.9-5.5 6.8-12.6 15.4-16.4 19.2 1.9-34.8 6.6-69.7 11.4-104.5-.3.6-.6 1.1-.8 1.7-6.7 9.8-10.5 19.5-20.1 29.3-22.4 29.9-54.2 74.4-77.8 95.3-.3-30.9-.6-71.4-.8-107.1-.3.6-.6 1.1-.8 1.7-21.5 40.7-43 81.4-64.4 122.1-9.5 19.2-19 38.5-28.5 57.7 1.4 7 2.8 13.9 5.9 21 3.3 29.8 11.9 55 18.4 79.8h-.8c-.6-3.6-1.1-4.1-1.7-4.7-9.8-7.8-19.5-15.6-29.3-21.5H203c-.3-22.3-.6-42.6-.8-63-10 4.7-20.1 9.5-30.1 14.2 3.8-28.6-1.3-96.2 1.7-112.9 19.4-109 96.1-180.1 195.5-191.6 30-3.5 69.1-3 95.4 4.2 28.1 7.6 53.5 18.5 74.5 33.5 53.5 34.7 81 93.7 93.7 159.7.3 35.7.6 71.4.8 107.1-10.3-4.7-13.5-9.5-31-14.2.1 20.2.1 40.6.1 62.9M473.9 147.8c1.5 8.7 11.2 81.5 11.7 97-28.4 17.3-58.4 20.5-60.2 23.4-1.3 2.3-1.9 6.7-.8 9.2.6 1.1 1.1 2.2 1.7 3.3 29.1 9.1 90.7-16.6 85.4-40.1-2.4-4.9-3.6-5-8.4-7.5 3.9-3.9 7.8-6.5 11.7-11.7 4.2-6.1 8.4-6.6 12.6-18.4h.8c7 26.3 22.8 65.2 24.3 82 1.3 16-26 117.8-36.8 136.1-11.7 11.6-32.4 21.5-48.5 32.8-10.2 7.2-52.2 39.5-67.8 36-23.7-5.4-98.5-59.9-109.6-78.6-11-18.6-15.1-42.2-21.8-64.4-3.6-11.9-13.9-56.8-9.6-56.5 9.6-32.4 23-58.6 36.4-84.8h7.3c.4 18.1-6.7 36.2-7.3 54.4 2.5-.5 7.6-2.1 8.4-1.7 10.8 6.1 39.6 31.4 79.5 22.6.3-.8 1.4-3.3 1.7-4.2-.6-2.8-1.1-5.6-1.7-8.4-15-6.5-47.4-11.8-58.6-23.4.8-1.1 1.7 4.8 2.5-3.3 22.3-14.5 37.5-38.5 54.4-56.9h.8c-3.3 23.4-6.7 46.8-10 70.3 39.7-25.7 77-64.8 101.9-107.2M328.4 282.4c-22.8 6.8-42.6 15.6-46.1 41h1.7c29.6.6 59.1 1.1 88.7 5 2.3-11.9-2.7-20.6-5-20.7-15.9-13-30.2-19.1-39.3-25.3m155.6 0c-11.2 7-39.1 14.6-43.5 19.2-1.4 2.2-8.8 19.4-3.3 26.7 29.6-3.9 63.6-4.4 88.7-5-2.1-20.9-23.2-37.9-41.9-40.9m-106.3 77.8c-1.4 1.9-2.8 3.9-4.2 5.9.3 8.4.6 2.8.8 4.2 11.5 15 46 19.2 61.9-.8.3-1.4.6-2.8.8-4.2-1.4-1.7-2.8-3.3-4.2-5-12.7.6-17.7 10.5-32.6 7.5-8.5-1.8-6.3-7.1-22.5-7.6m-16 45.2c-8.8 1.1-10.2 2.2-11.6 6.9v3.9c6.1 12.7 111.5 12.9 110.5 0v-6.7l-3.3-4.2c-34.4.1-68.7.1-95.6.1m207.6 74.4c3.6 1.4 7.2 2.8 10.9 10.8 11.8 16.1 11.8 54-4.2 80.4-6.1 8.4-12.3 16.7-18.4 25.1-4.7 17.4-18.5 51.9-40.2 65.2-18.3 11.2-39.7 16.6-69.5 21.7-5.9 7.9-11.7 1.7-17.6 2.5-6.7 14-13.4 13.4-20.1 20.1-32.6 26.2-58.7 62.1-95.4 83.6-24.9-15.6-44.5-41.4-47.8-66.9 32.3-24.2 69.6-47.7 108-70.3 12.3-6.7 24.5-13.4 36.8-20.1 8.4-3.4 19.5-3.9 25.1-10 1.9 2.2 3.9-9.5 5.9-14.2 8.4-8.1 16.7-15.3 25.1-21.2 12.4-18.8 7.7-21.3 30.1-39 1.4.3 2.8.6 4.2.8 1.3 2.9 5.4 5.2 5 6.7 24.1-11.6 39.4-55.8 62.1-75.2m-236.8 5c20.6 8.4 44.6 34.6 71.1 34.3 24.3-.3 50.3-22.1 69.5-32.6.3 10.3.6 20.6.8 30.9 1.6 8.4 3.6 14.9 10 21.7-19.5 12-57.3 81.6-84.5 78.6-22.4-10.8-29.8-18.5-50.2-41.8-14.3-16.3-12.1-22-28.5-35.1 11.3-9 12-35.8 11.8-56m256.9 89.5c32.5 12.2 63.6 28.5 74.5 61.9 4 12.2 6.4 21.3 5.9 36-10.6 16.2-89.4 31.4-119.7 40.9-11.7-12.5-23.4-20-35.1-27.5.3-.5.6-1.1.8 5.4 37.7-25 49.8-70.3 58.6-94.9 2-5.7 11.8-11.9 15-21.8M212 576c10.8 12.5 21 42.3 30.1 60.2 6.9 13.6 17.1 32.6 33.8 41 .5 2.8 5.5 5.6 10.6 8.4h-1.7c-33.7 25.8-35.5 21.9-48.4 19.4-47-9.2-96.6-25-99.7-30.3-5.1-8.5 3-28.5 5-35.1 11.9-37.9 43.1-54.1 70.3-63.6m281.2 123.6c11.8-.9 32.6 13.9 45.2 22.8-7.5 27.2-26 48.3-51.9 66.9-34.1-23.6-49.8-41.8-72.8-62.7 2.2-2.2 19.5-21.2 21.8-23.4 8.8-1.3 33.1-1.5 57.7-3.6", className: "bodyHeadshake_svg__st1" })] }));

const SvgBodySad = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("defs", { children: jsxRuntimeExports.jsx("path", { id: "bodySad_svg__a", d: "M104.2 8.6h591.6v782.7H104.2z" }) }), jsxRuntimeExports.jsx("path", { d: "M695.4 738.3c-11.9 4.6-24.1 11-38.6 15.6l-75.3 17.4c-100.6 27.1-271.4 19.7-374.7-4.6-34.6-8.1-69.4-12.6-95.5-24.1-.3-73.5 46-103.2 90.9-117.3 31.1-9.8 100.5-14.5 116.6-41.3 7.4-12.3 7.1-27.7 7.4-55.1 22.3 14.2 56.6 38.1 77.1 38.6 26.5.6 58.5-25.2 77.1-36.7 0 20.9-.5 48.2 9.2 56 13.4 18.3 45.6 21.7 68 27.5 51.7 11 80.7 20.9 104.7 43.1 17.7 22.8 36.6 37.6 33.1 80.9M372.6 277.6c34.4-24.1 82.4-66.3 108.6-115 7.3 15.1 11.3 81.8 15.5 103.2 21.9-5.3 30.6-24.2 48.4-44.7h-2.8c14.9 27.7 24.5 72.6 30.9 89.5-3 12.2-32.8 128.6-44.6 145.3-12.8 15.9-35.4 32.7-53 39.1-11.2 7.9-56.9 43.1-73.9 39.3-25.9 2.1-107.5-65.4-119.6-85.8-12-13.4-16.4-46.1-23.7-70.3-3.9-13-14.7-59-14.6-63.2 14.6-33.8 29.2-62.5 43.8-91.1h1.8c-.6 19.8-1.2 39.6-1.8 59.3 32-6.1 73.5-54.3 94-82.2h.9c-2.4 20-.2 36.5-7.3 57.6-1.2-5.6-4.5-9.4-9.1-9.2-12.8 9.7-25.6 19.5-38.3 29.2-10.7 6.3-36.7 14.8-36.2 20.1-8.1 4.4-6.4 9.7-3.1 12.8 48.6 5.4 84-37.4 84-37.4s-.3 3.8.1 3.5m65.7 115c-13.7.6-19 11.1-34.7 16-9.9-9.6-13.9-15.5-18.2-16-8.9 1.8-10.4 3.6-11.9 5.5.3 1.5.6 3 .9 4.6 14.9 22.7 54.6 19.3 68.5-.9-.8-5.4-2.2-5.9-4.6-9.2m90.4-95.8c-17.3-6.1-35.7-14-50.2-19.5-10.4-11.2-13.6-25.3-32.9-28-1.5 2.1-3 4.3-3.7 6.4-16 30 56 56.6 85.8 55.7.3-.9.6 3.4.9-2.7 2.7-4 1.5-7.6.1-11.9m-10 48.4c-.4-2.5 9.3-6.2 12.8-10-.6-1.5-1.2-3-1.8-4.6-34.7.5-56.6-6.6-87.6-12.8 1.8 13.1 3.6 26.2 5.5 39.3 27.5 20 73.1 1.9 71.1-11.9M347.9 480.3c37.7-19.8 83.7-18.6 122.2 0 6-.3-.5-.6.1-.9v-3.6c-10-17.7-24.8-33.1-63-42-22.7 1.5-47.3 15.7-61.2 42.9.7 1.2 1.3 2.4 1.9 3.6m22-162.5c-8.7 4.9-48.4 13.1-78.2 12.8-5.5 0-7 3.4-7.7 4.6 15.2 9.5 13.9 15 14.6 16.4 7.6 15.5 61.8 19.4 69.4 10.1 1.8-18.9 3.6-31.4 5.5-43.9zm259.6 82.1h-23.2c-3.1 12.8-13.1 17-23.6 24.7v-2.7c1-14.5 21.5-90.9 19.1-97.7-12.3-67.5-40.1-136.4-63-184.4h-.9c-2.7 22.5-11.2 62.7-21 73.9h-.9c-6.1-47.2-12.2-94.3-18.3-141.5-.3 4.8-.6 1.2-.9 1.8-8.2 18.9-16.4 37.7-24.6 56.6-11 25.1-28.4 43.6-43.8 63-6 7.5-13.6 17.6-21 21.9 5.2-38 12.3-76.5 20-114.1-4.8.6-5.1 1.2-5.4 1.8-7.3 10.6-15.5 21.3-22.8 32-23.2 32.4-57 80.2-84 104.1-.3-33.9-.6-77.9 4.7-116.8-3 .6-4.5 1.2-6.6 1.8-23.4 44.4-46.9 88.9-70.3 133.3-10.3 21-20.7 42-31 63 3.3 7.6 3 15.2 4.6 22.8 5.5 32.2 14.4 58.9 21.9 86.7h-.9c-.6-3.3-1.2-3.9-1.8-4.5-10.6-8.5-21.3-17-32-25.6h-16.4c7.4-22.2.3-44.4 0-67.5-11 5.2-22.8 12.2-33.8 17.3 1.2-39.8-4-90.7 1.8-124.1C180 115.8 249.8 32.4 376.1 16.5c25.5-4.4 68.3-3.2 96.9 4.6 30.6 8.3 58.4 20.2 81.2 36.5 53.1 37.9 88.4 102.7 102.2 174.4.3 38.9.6 85.9.9 116.8-11.2-5.2-22.5-10.3-27.9-15.5.1 22.2.1 44.4.1 66.6", className: "bodySad_svg__st1" })] }));

const SvgBodyVictory = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("defs", { children: jsxRuntimeExports.jsx("path", { id: "bodyVictory_svg__a", d: "M27.6 8.6h744.7v782.7H27.6z" }) }), jsxRuntimeExports.jsx("path", { d: "M82.4 8.6c19.9 3.3 89.5 18 103.2 28.3 4.5 12.2 3.3 50.9-10.8 60.4-9.4 3.8-18.9 7.6-28.3 11.5-3.3 26.9-8.1 43.1-33.6 48.2 5.4 67.7 2.3 135.1 12.2 199.6 3.9 23.9-1.3 45.1 6.9 65 7.7 18.7 26.5 32.1 38.2 47.4 20.7 27 39.6 55.7 57.3 85.6 6.1 11.7 12.2 23.5 18.3 35.2 7.6 2.8 15.3 5.6 22.9 8.4 15.8 8.9 31.6 17.8 47.4 26.8 8.6 6.3 26.3 27.3 42 21.4 1.5-1.1.5-.1 1.5-1.5 7.4-11.5-17.9-34.6-25.2-37.5-.3-11.7-.5-23.5-.8-35.2 16.4 8.9 47.1 38.8 74.9 32.1C432 598.6 447 580 466.6 573c0 7.2 1.1 29.9-3.1 34.4-9.3 10-24.8 16.6-20 35.2-4.2 1.5-3.2 3.1-2.2 5.9 23.5-1.6 36.9-19.3 50.9-28.8 14.8-8.4 30.9-16.8 46.9-20 4.8-6.7 9.7-8.3 14.5-9.8 10.4-19.1 21.9-38.2 31.3-57.3 15.4-24.8 32.6-48.5 52.4-71.1 8.1-12.7 23.6-23.8 30.1-39.8 8.1-19.9 3.1-40.9 6.9-65 9.8-64.6 6.1-131.9 12.2-199.6-25.6-5-30.1-21.2-33.6-48.2-9.4-3.8-18.9-7.6-28.3-11.5-14-9.6-15.4-48.2-5.3-60.4 9.4-11.5 36.6-15 52.7-19.1 17.4-4.5 44.9-2.7 55.8-.8 9.5 12.9 7.6 42.6 9.2 56.6 5.4 34.6 7.4 65.1 13 100.9 5.3 39.2 10.7 78.5 16 117.7.8 18.4 1.5 36.7 2.3 55.1 3.2 21.5 5.9 60.7 0 81.8-5.6 19.8-19.7 37.4-29.8 53.5-15.8 30.6-31.6 55.6-47.4 83.3-15.5 31.3-28.8 61.8-45.9 91-5.2 8.9-10.3 25-19.9 29.1.3-5.5-.2-15-3.1-19.9H613c-1 .5-1.3 1-1.5 1.5-3.1 18.1-13.3 89.4-15 97.1-26.5 10.2-55.6 9.3-79.8 13.8-97.5 17.8-224.3 6.9-308.8-13-9.9-30.6-15.5-63.8-14.8-98.6-5.1-.3-6.8-.5-7.3-.8-4.6-1-7.4-.3-10.7 1.5-.7 4-.6 16.3-3.8 18.4-4.8-7.1-9.7-14.3-10.4-21.4-14.1-18.9-24-37.7-34-56.6-19.3-33.3-31.6-68.6-51.2-100.9-14.6-24-37-49-45.1-78-1.3-20.9-2-60.6 0-81.8.5-15.5 1-31.1 1.5-46.6 6.4-38.8 7.7-80.4 16-114.1.3-9.3.5-18.7.8-26.6 4.1-25.5 8.2-51 12.2-76.5 3.9-21.9-.2-42.2 6.9-61.2 3-6.5 9.3-9.8 14.4-13.8M581.5 470H567c-5 1.5-15.8 11.3-23.7 14.3v-.8c4.7-12.1 23.2-68 19.9-86.4-12.3-51.6-37.6-101.1-52.7-149.9h-.8c-2.3 18.9-6.3 54.8-17.6 61.9h.5c-6.3-39.5-11.4-79-12-118.5-4.8 1.5-5 6.6-5.3 1.5-6.9 15.8-7.3 31.6-20.6 47.4-9.2 25.9-19.3 36.5-36.7 52.8-5 6.3-7.5 14.8-14.3 18.4 1-31.9 5.4-63.7 9.7-95.6-.3.5-.5 1-.8 1.5-6.1 8.9-8.9 17.8-18.3 26.8-19 27-45.2 67.8-71.1 87.2-.3-27.9-.5-65.2-.8-97.9-.3.5-.5 1-.8 1.5-19.6 37.2-39.2 74.4-58.9 111.6-8.7 17.6-17.3 37.4-26 52.8 1.3 6.4 2.6 12.7 5.5 19.1 4.1 25.1 11.8 51.7 16.6 76.5h-.8c-.5-5.2-1-7.2-1.5-7.7-8.9-7.1-17.8-13.6-26.8-16.6h-13.8c-.3-23.5-.5-42.1-.8-60.7-9.2 4.3-18.3 8.7-21.7 13-5.6-31.9-5.3-60.3-5-95.6C206.5 224.3 263 162.3 368.3 144c30-5.2 67.7-1.8 99.8 5.3 19.3 7.3 42.5 22.6 64.7 33.6 38 34.2 68.2 80.2 76.3 141.5.3 32.6.5 65.3.8 97.9-9.4-4.3-18.9-8.7-28.3-13-.1 18.6-.1 37.2-.1 60.7M462.3 266.3c13 6.9 8.1 56.1 10.7 74.1-16.4-5.6-46.6-.8-45.1 14.6 41.9-1.2 51.2 10.6 75.7 22.9 1-.5 2-1 5-1.5v-4.6c-6.8-22-29.8-21.3-7.3-39.8 3.8-5.6 7.6-5.3 11.5-16.8h.8c6.4 24 19.9 48.6 22.2 74.9 2 23.1-23.8 107.7-33.6 120.8-9.2 14.3-29.6 23.3-44.3 33.6-9.4 6.6-47.7 36.1-61.9 32.9-21.6-4.9-90-54.8-100.1-71.9-10-17-13.8-38.6-19.9-58.9-3.3-10.9-14.9-44.8-9.3-57.3 9.3-24 21.5-47.9 33.7-71.9h6.5c-2.5 17.3-1.7 21.9-5.7 32.9-1.9 14.8-13.4 14.3-11.5 30.3.5-5.4 1-4.1 1.5-2.8h2.3c18.5-21.1 40.8-23.6 74.9-22.9.3-1.8.5-3.6.8-5.3-7.1-4.8-12.7-9.6-23.7-12.2 12.1-12.6 22.1-28.2 33.6-39h.8c-3.1 21.4-6.1 42.8-9.2 64.2 36.2-23.3 70.8-56.5 91.6-96.3M303.3 417c15.9-1.4 26.9-9.1 48.8-6.1 3.4 2 12.1 4.1 20.7 6.1v-.8c.2-7.9-8-23.3-15.3-26.8C333 378 303 393.8 303.3 417m189.6 0c.3-22-34.1-41.4-55.8-26.8-1.3 4.1-11.8 18.8-9.2 26.8 4.1-2 12.8-4.1 21.5-6.1 16.6-3.1 30 4.7 43.5 6.1m-120.8 44.3c-.8 1.3-1.5 2.5-.7 8.7v-2.6c8.2 13.1 53 22.2 56.5-3.1-.8-1-1.5-2-2.3-3.1-7.8.1-15.9 4.3-24.5 4.6-9.7-1.4-19.3-3-29-4.5m-30.6 32.1c-1.3 1.5-2.6 3.1-3.8 4.6 22.5 52.3 99.7 52.1 122.3 0-1.3-1.5-2.6-3.1-3.8-4.6-32.1 8.9-82.7 8.9-114.7 0", className: "bodyVictory_svg__st1" })] }));

const SvgBrowserWindow = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m11.1 124.6 24.1 485.8 3.3 65.1h726.1L789 124.6zm697 495.9H94.4l-2.8-52.1-20.3-389h657.5z" }), jsxRuntimeExports.jsx("path", { d: "M35.7 290.5h728.8v54.9H35.7zM159 264.6h-47.7l-4-55.7H163zM239 264.6h-47.7l-4-55.7H243zM319 264.6h-47.7l-4-55.7H323z" })] }));

const SvgBrush = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m294.9 701.6 55.6 4.1 132.7-291.8-110.3-114.7L80 428.5l6.8 77.9 114.4-55.3-117.3 91 37.8 73.3 89.4-63.4-77.4 93.3 123 65.6 74.7-151.8zM469.7 282.5l-55.8 39.8 48.6 50.3 44.8-53.7zM478.9 276.5l34.4 36.5L720 132.4l-53.3-53.3z", className: "brush_svg__cls-1" })] }));

const SvgCaretDown = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M379.4 632h41.2l273.7-386.9 25.7-46.4-30.9-30.9-268.5 32.8h-41.2L110.9 168 80 198.9l25.7 46.4z", className: "caretDown_svg__cls-1" })] }));

const SvgCaretLeft = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M168 379.4v41.2l386.9 273.7 46.4 25.7 30.9-30.9-32.8-268.5v-41.2l32.8-268.5L601.3 80l-46.4 25.7z", className: "caretLeft_svg__cls-1" })] }));

const SvgCaretRight = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M632 379.4v41.2L245.2 694.3 198.8 720l-30.9-30.9 32.8-268.5v-41.2L168 110.9 198.9 80l46.4 25.7z", className: "caretRight_svg__cls-1" })] }));

const SvgCaretUp = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M379.4 168h41.2l273.7 386.9 25.7 46.4-30.9 30.9-268.5-32.8h-41.2L110.9 632 80 601.1l25.7-46.4z", className: "caretUp_svg__cls-1" })] }));

const SvgChat = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m657.4 549.9-251.1-14.2-175.8 184.8L243 535.6 92.4 549.8 67.3 123.2l665.4-42.6L657.4 550ZM293.3 279.6H218V365h75.3zm125.5 0h-75.3V365h75.3zm125.6 0h-75.3V365h75.3z", className: "chat_svg__cls-1" })] }));

const SvgCheck = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M40.1 400 152 320l160 176 368.1-368 80 112-464 432z", className: "check_svg__cls-1" })] }));

const SvgChest = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m719.1 656.9-52.2 13.9-42.9-69.1 11.7-19.3-70.8-187.6-17.4 110.5 11.6 48.8 68.5 105.3-118.2 64.2L416.9 621l46.9-197.4 17.4-63.6 36.5-153.8-54.4-6.2 23.4-77.6-163.1-13.9.8-8L367.3 82l103.5-5.9 45.2 30.8 1.2 55.2 91.8 37.3 55.7 177.3 59.1 164.4 20.9-3.9 15.4 83.5-40.9 36ZM318.5 157.2l2.6-24.7 135.7 10-30 77.6 58.9 7.7-32.3 138.8L386.7 623l-102.4 96.9-84.2-49.1L258.2 558l11.6-42.4-10.5-116.9L160.7 567l16.2 27-48.7 65.5-53.5-21.8-34.6-41.1L62 518.2l22 2.6L161.8 362 228 183l90.6-25.7Z", className: "chest_svg__cls-1" })] }));

const SvgClassBeastPainter = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m53.9 147.6-2 27.8 146 66.4 57.4-55.2L190.6 40l-38.9 3.4 27.6 57.2-45.5-58.7-36.8 19 31.8 44.8-46.7-38.8-32.8 61.6 75.9 37.3zM216.4 266.6l68.2 95.6 86.2-83.2-92-76.8zM382.1 309.5l-68.3 64.3L651.2 760l99.5-99.5zM108.4 683l-3.9-380.8-55.2-20.3 10.6 453.5 436.9-12.8-47.9-56.5zM691.6 127.2 665 506.6l66.5 52.7 18.6-490.6-478.5-5.2 15.8 57z", className: "classBeastPainter_svg__cls-1" })] }));

const SvgClassBruiser = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m124.4 427-36.7 37.8 80.2 190.3 217.8 55.1 18.4-50.4-162.8-67.9zM323.8 304.4l130.8 63.5 57.2 115.3 34.5 9.2 34.3-57.3L521 403l-9.2-59.6-64.1-73.4-39-50.5 59.6 39 25.2-22.8-68.8-103.2-96.2 59.5z", className: "classBruiser_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "m495.8 279.2 52.7 48.1 2.3 59.6 75.7 36.7 77.9-94-43.5-38-4.6-81.2-52.8-24.7-68.7-105.8-82.6 38.8 82.6 128.4zM420.2 389.3l-105.5-55.1-144.4 94 89.4 135.2 149 59.7 64.2-130.7zM662.5 662.6l-196.1 9.9-13.6 60.3 281.1-8.7 12.7-321.5-69.9 61.1zM605.8 62.3l32 60.3 62.5 1.1-7.1 102 58.7 41.5L760 64zM126.8 689.4l-21.2 1.1-.3-35.3-51.8-84.4L56.1 744l188.5-3.9-117.1-49.6zM99.7 113.7l215.7 3.6 101-55.4L40 56l8.2 340.1 54-44.9z", className: "classBruiser_svg__cls-1" })] }));

const SvgClassCustom = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M275.8 69.6 40 67l16.1 687.9 2.7-.3 40.9-188.4V124.7l152.6 2.5zM492 72l16.8 59.4 191.5 3.2L684.4 423l17.9 262.5 2.6 50.5 29-1L760 74.9z", className: "classCustom_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "m629.7 451.1-26.4-69.3 8.1-47.5-33.3-44.5-62.3-9.8-57.6-15.4-19.6-24.1-4.3-13 .2-.2 23.1-49.7 2.4-56.9-26.5-59.9-47.7-15.7-55.9 18.4-23.5 45-6.1 54.2 12.8 57.9 12.4 17.2-14.6 42-39.7 3.3-45.1 12.1-27.3 40.4-2.8 33.8-11.9 65.8L131 562.6l-28.5 144.5 16.2 39.3 30.5 6.7 31.1-38.6-17.6-27.9-.7-22.7 12.1-43.8 48.3-61.1 12.4-78.6 12.5-28.5 14.8 56.1.4 90.9-16.8 51.5-14.1 66.6v26.5l305.3-8.3-8.5-37.6-40.6-97L495 512l36.2-62.1 39.4 60.2-6.4 43 46.2 101-42.6 37.1-6.8 28.5 50.1 34.6 49.8-50.4 2.8-36.1-10.5-187z", className: "classCustom_svg__cls-1" })] }));

const SvgClassDropHunter = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M304.2 294.9S172.9 424.2 172.1 425.2c-.8.8 18.6 111.6 18.6 111.6l80 67 100.4 9.3L506.9 440l-9.3-35.4L760 80.9 570.3 40 341.5 294.9h-37.2Zm102.3 165.6-44.7 61.4-59-4.8-32.2-26.1-12.9-56.5 50.2-53.9 78.1 9.3 20.5 70.7ZM213.1 601.9 187 579.5l-11.2-9.2L40 698.6l80 61.4 106-143.2z", className: "classDropHunter_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "m648.2 648.4-384 19.1-41.8 52.8 492.5-14.5 19.3-487-61.3 76.8zM126 555.2l-4.4-420.3 277.8 4.6 44.3-54.4-377.9-4.2L78 598.8z", className: "classDropHunter_svg__cls-1" })] }));

const SvgClassEngineer = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M557.4 484.4 308.5 229.9l-11-110.6-127.2-69.1-63.7 27.6 94.1 55.3 2.7 59.4-55.3 22.3-94-51.3 5.5 58.1 80.2 80.2 85.8 2.8 262.7 260 8.3 132.7 127.2 52.5 69.2-27.6-94.1-49.8-2.7-63.6 55.3-24.9 94 56.8v-56.8l-94-94zM699.7 119.3l-22.1 316 65.6 46.6 16.8-423-436.7-4.7 54.6 59.8zM98.9 691.8l-3.4-340.1L40 313.2l9 432.6 421.3-12.3-62.5-57.1z", className: "classEngineer_svg__cls-1" })] }));

const SvgClassLiskWitch = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m223.3 352.6-28 116.4 43.2 100 1.1.1-43.8 59.9 6.2 22.6 124.6-53.7 59.3 19.6 60.5-16.9 118.2 50.6 19.6-22.2-32.3-58.3L593.4 469l-35.9-128-38.6 1.3-62.3 162.2-34.6-89.8-48.1 137.9-35.4-203zM292.5 239.3 198 40l-86 35.5 127.2 161.1z", className: "classLiskWitch_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "M422.3 316.2 457 439.7l64-194.2-172.8-20.3 30.7 249.2zM190 261l5.3 68.4 139.2-3.5L324 265zM583.7 272.6l-37.5-1.1-19.1 49.5 51.7-1z", className: "classLiskWitch_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "m284.8 97.7 20.3 56.4 384.9 6.4-36.6 521-538.2 26.8-5.6-536-57.3-53.1L67.4 760l655-19.2 25.3-638z", className: "classLiskWitch_svg__cls-1" })] }));

const SvgClassNeuralHacker = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m132.7 519.7-3.9-378.2 339.8 5.7 50.7-53.3L74.5 89l10.8 462.3zM642.1 642.1l-365.3 19.4-13.4 50.6 443.7-14 19.5-467-59.3 52.4zM745.4 105.3 674.8 40 397.3 308.4l47.1 54.4 282.5-197.3-25-22.1zM371.9 315.7l-95 92.2 66 63.7 97.9-81.6zM290.3 546l30.8-56.2-58-59.8-18.2 86.9-16.3 12.7-39.9 11L54.6 653l38 70.7L206.8 760l45.4-157.8 39.9-14.5zM358.5 481l66 21.5-12.7-32.7-1.8-27.1z", className: "classNeuralHacker_svg__cls-1" })] }));

const SvgClose = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m657.1 84.1 88.1 117.5-235 205.7 231 235.1-128.1 102.8-205.7-249.8-249.8 264.5L54.8 627.6l264.4-235.1-235.1-235L231 40l191 264.5L657 84.1Z", className: "close_svg__cls-1" })] }));

const SvgControls = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m708.1 430.9-2.5 306.5-101.5 5 9.9-311.5-54.4 2.5V247.9l59.4 2.5-2.4-192.8h89v192.8l54.4-2.5v185.5zM445.8 742.4h-89.1l2.5-94-54.6 10.2V465.5l49.7 2.5-10-410.4 101.5 5L456.3 468l44-2.5v193.2l-54.4-10.2v93.9Zm-259.8-5-101.5 5L94.4 332 40 334.5V149.1l59.4 2.5-2.5-94H186v94l54.4-2.5v185.4l-51.9-2.5z", className: "controls_svg__cls-1" })] }));

const SvgCrown = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("g", { className: "crown_svg__cls-1", children: jsxRuntimeExports.jsx("path", { d: "M57.9 198.4 104.7 760h561.6l93.6-514.8-234 187.2L479.2 58l-234 327.6z", className: "crown_svg__cls-3" }) })] }));

const SvgDebugMode = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsxs("g", { "data-name": "Layer 2", children: [jsxRuntimeExports.jsx("path", { d: "m149.6 547.5-11.7-365.3h538.4v144.6l50.8 33.6 7.8-230H75.3L97.2 573H40l33.4 77.5 370.7 1.1-47.4-104.1z", className: "debugMode_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "m760 530-9.5-53.8-29.7 11.5c-5.3-14.3-13-28.2-23.2-41l24-16.2-38.7-38.6-16.7 25c-13.2-9.3-27.3-16.2-41.8-20.6l12.9-33.4-53.8-9.5.7 37.2c-16.7.4-32.9 4.2-47.4 11.5l-8.8-18.5-53.7 53.8 18.5 8.8c-7.3 14.5-11.1 30.7-11.5 47.4l-37.2-.7 9.5 53.8 33.4-12.9c4.4 14.5 11.2 28.6 20.6 41.8l-25 16.7 38.6 38.7 16.2-24c12.8 10.2 26.6 17.9 41 23.2l-11.5 29.7 53.8 9.5-.6-30.9c21.4.6 42.3-4.3 60.2-15.1L558.7 509.7l41.8-41.8 113.6 121.5c10.8-17.8 15.7-38.7 15.1-60.2l30.9.6Z", className: "debugMode_svg__cls-1" })] })] }));

const SvgDefence = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M725.2 551.6 406.4 760 103.1 594.1 41.3 40l316 .6-56.8 77.4-175 2.5L176.8 553l229.7 112.2 238.6-168.1 33.4-371.7H504.6l-51.3-84.7 305.4-.6zM602.6 184.5 587 456.8 406.4 582.3l-173.9-97.1-26.7-300.8L335 209.9l69.1-91.8 73.6 73.4z", className: "defence_svg__cls-1" })] }));

const SvgDevTools = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m442.7 541.6 3.3-294.5 58.3-71.1-34-114.8L416.8 40l22.8 87.5-33.2 36.2-45.4-19.3-25-84.9-30.7 37.2v93.7l48.5 51.9 1.6 305.8-72.8 82.4 43.7 105.1 56.6 24.4-25.9-84.2 35.6-38.8 47 17.8 21.7 88.2 33.2-33.2v-110zM80.3 428.6 250 540.9v-80L152.8 400l97.2-60.3V259c-56.6 37.4-113.1 74.9-169.7 112.3v57.2ZM719.7 428.6 550 540.9v-80l97.2-60.9-97.2-60.3V259c56.6 37.4 113.1 74.9 169.7 112.3v57.2Z", className: "devTools_svg__cls-1" })] }));

const SvgDexterity = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m560 467.9 26.3 13.3 13.8 77.1 89.8 76.3 14.8 30.2-.9 32.5-48.7 62.7-178.5-39.5-78.8-106.9-65-78.6-106.5-53.8 38.3-116.1 57.3-22.6L481 89.9l278.9 135.7-200 242.1ZM155.8 101.8 212.5 40l153 112.1-36 53.5zm104.1 216.1L84.1 265.4l25.9-91.3 175.7 78.6zm-63 121.7L40 418.4l14.8-82.8 163 36.1-20.9 68Z", className: "dexterity_svg__cls-1" })] }));

const SvgDice = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m759.5 209.6-81.3 375.3c-2.5 11.5-13.9 18.8-25.6 16.4l-138.7-29.4v-323c0-11.8-9.6-21.3-21.5-21.3h-28.8c4.6-7.9 7.3-16.9 7.3-26.7 0-29.4-24.1-53.3-53.9-53.3s-37.9 23.9-37.9 53.3-13.3 18.8-8.7 26.7H315l23.3-107.4c2.5-11.5 13.9-18.8 33.4-16.4L743 184.3c11.6 2.5 19 21.7 16.6 25.3ZM551.6 494.1c0 29.4 24.1 53.3 56.4 53.3s51.3-23.9 51.3-53.3-24.1-53.3-51.3-53.3-56.4 23.9-56.4 53.3m107.7-293.2c-29.8 0-51.3 23.9-51.3 53.3s21.6 53.3 51.3 53.3 53.9-23.9 53.9-53.3-24.1-53.3-53.9-53.3m-188.5 90.7v383.8c0 11.8-9.6 21.3-21.5 21.3H73.7c-24.1 0-33.7-9.5-33.7-21.3V291.6c0-11.8 9.6-21.3 33.7-21.3h375.6c11.9 0 21.5 9.5 21.5 21.3m-339.3 21.3c-18.5 0-53.9 23.9-53.9 53.3s35.4 53.3 53.9 53.3c47.7 0 53.9-23.9 53.9-53.3s-6.1-53.3-53.9-53.3m123.9 122.6c-29.7 0-45.8 23.9-45.8 53.3 0 41.7 16.1 53.3 45.8 53.3s53.9-11.6 53.9-53.3-24.1-53.3-53.9-53.3m123.9 133.7c-29.8 0-53.9 12.7-53.9 42.2s24.1 53.3 53.9 53.3 53.9-23.9 53.9-53.3-24.1-42.2-53.9-42.2", className: "dice_svg__cls-1" })] }));

const SvgDiscord = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m708.5 276.4-97.1-115.2-118.2-40.9-30 43.5-64.6-9.3-64.6 9.3-29.9-43.5-117.7 40.9-97.1 115.2-50.5 170.3 26.8 139.8 61.6 51.7 112.2 40.7 23.9-47.7-47.9-44.3 6.2-18 43.2 23.2 65.3 19 68.4 5 68.4-5 65.3-19.2 43.2-23.2 6.2 18-47.7 44.3 23.9 47.7L670 638l61.6-51.7 26.8-139.8-50.5-170ZM317.6 490.2l-43.2 5.4-42-33.3-7.8-64.1 39-46.9 44.2-3.1 35.9 40.7 5.5 58.4-31.7 43Zm248.5-28-42 33.3-43.2-5.4-31.8-43.2 5.5-58.4 35.9-40.7 44.2 3.1 39 46.9-7.7 64.4Z", className: "discord_svg__cls-1" })] }));

const SvgDownload = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M416.1 562.8 157.9 250.2l191.2 25.5-44.6-235.8h165.7l-31.8 235.8 210.3-38.3-232.5 325.4Zm-258.2 97.3 458.8-21.8V517.8l127.4-6.3-6.3 248.5-669-19v-.5l-3 .5S58 573.2 56 562.6c.2-7.6 101.9-12.8 101.9-12.8v110.4Z", className: "download_svg__cls-1" })] }));

const SvgEdit = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m338.8 756.9 5.5-84.1 415.6-27.9v111.6H338.8zm309.5-478.4L493.7 110.3l65-67.2h44.8l123.4 123-11.4 39.3zM197.1 729.7H39.9V567l412.4-406.8L615 317.7l-417.8 412Z", className: "edit_svg__cls-1" })] }));

const SvgEmotion = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m703.2 482.1-1.3 92.2-63.1 31.6 21.4-66.9 13.9-72-43-137.7-44.9-115.2-.5 1.5-31.6 101-25.2-195.7-43 89.7-82.1 119.9L424 161.3l-65.1 98.5-83.9 91 1.3-157.9-1.1-1.8-143 274.5 36.7 146.6-43-18.9-27.8-17.7-1.3-85.8-45.4 13.7 1.3-149 27.4-79.6 29.5-83.4 59.3-68.2 87.2-55.6.2 1.2L309.2 50l97.2-10.1 102.3 13.9 13.3 6.8 76.4 50.7 9.4-6.3 13.3 6.8 20.2 17.7 8.9 12.7 50.6 64.4L740 310.5l8.9 62.9v128.9zm-464.9-68.2 21.4-10.1 51.8-40.4 56.8-52.8 3.1 94.5 39.9-44.2 58.1-50.2 36.6-63.5 12.7 78.3 7.6 64.4 31.8-21.4 30.1-40.4 36.6 122.6-18.9 99.7-15.2 89.7-32.7 29L450.4 736l-45.5 24-6.3-1.3-49.3-22.7-92.2-66.9-29-27.8-31.6-97.2-18.9-93.5 60.6-120v83.3Z", className: "emotion_svg__cls-1" })] }));

const SvgErase = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M746.8 737.4H195.4L40.1 593v-2.6L420.8 62.5h10.9l321.7 274.3 6.6 10.9L431.7 676 749 652l-2.2 85.3ZM434 586.3 230.5 422.2h-6.6L103.5 579.7v4.4l113.8 107.3 133.5-10.9 83.1-87.5v-6.7Z", className: "erase_svg__cls-1" })] }));

const SvgEtherium = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M401.1 506.5 129.9 388.3 398.9 40l271.2 345.1-268.9 121.4Zm262.3-38.4L398.9 760 138.8 473.3l262.3 97.2 262.3-102.3Z", className: "etherium_svg__cls-1" })] }));

const SvgExportAvatar = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m309.7 524.4 55.1 28.6 21.8 5.5 9-2.1 56.1-32.6 37.5-35.8 22-42.8 29.6-72.7-33-59.4-29.7-33.1-40.6 25.6-107.8 53.9 19.7-78.3-81.4 45-46.2 59.4 17.6 39.6 29.7 59.5z", className: "exportAvatar_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "m261.8 299.9 104.1-49.6-2.2 46.3-7.7 29.9 68.2-38.6 50.6-39.8 52.9 51.7 39.6 74.8-33.1 83.6 32.6-1.1 33.3-75.9 22.3 4.4-6-47.4 4.9-62.7-14.3-70.3-19.7-39.7-30.8-54-44-40.7-64.1-30.1-82.5-.8-71.4 4.4-70.4 49.6-57.3 59.5-25.3 71.5-11 43 19.7 86.7-8.4 63 29.4-14.3 35.3 71.5 26.4-1.1c1.7-1.4-36.4-89.2-36.4-89.2l65.4-84.7ZM590.4 669.6l7.5-175.1-92.2 1.8 5.7 175.2-77.2 1.9L552.8 760l116.8-90.4z", className: "exportAvatar_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "m456.2 640.9-3-93.3-42.1 24.1-24.4 6.5-37.3-7.7-77-38.7 1.1 40.9-11 43-17.7 7.7 141.9 46.3z", className: "exportAvatar_svg__cls-1" })] }));

const SvgEyes = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m680.6 326.3-32.4-8.1-37.3-1.6-40.5 6.5-38.9 14.4-29.1 22.7-6.5-12.9 14.6-21 35.7-24.3 40.5-4.5 37.3-11.7 47 6.5 37.3 16.2 21 19.5-11.4 19.5-37.3-21.1Zm-355.2 13-51.9-11.4-51.9 2.6-53.5-1-52 14.6-43.8 27.6-11.4-25.9 40.5-35.7 63.2-21 76.3-1.6 66.6 14.2 46.9 19.7 12.9 19.5-9.7 19.5-32.4-21.1Zm-124.9 14.4h63.2l43.8 11.4 45.4 26 11.4 17.9 5.2 29.1-37.6-29.1 8.8 35.7-8.8 32.4-14.6 22.6-12.9 3.3H259l-75 11.4h-28.9l-21-16.2L83.8 435 40 417.1l77.8-42.2 82.7-21Zm-97 78.3 7.9 11 27.7 39.7 19.8 19.8h43.6l-15.1-10.9-14.6-19.5-8.1-26 3.3-22.5 11.6-26.2-64.3 25.6-11.8 8.9Zm432.7-63.8 60.4-19.5 74.1 3.3 37.3 16.2 51.9 42.2-35.7 19.5-40.5 51.9-27.6 24.4-26.5 4.8-33-6.5-58.9-3.3-7.3-12.9-15.5-22.7-3.3-17.9 8.1-35.7-12.9 9.7-11.4 14.6 6.1-37.3 34.5-30.7Zm98.6 130.2 19.8-7.9 11.9-4.3 23.8-39.3 19.8-31.8-54-25.8-42.2-8.1 11.4 13.5 4.2 17.3v26l-7.4 24.3-11.4 26-7.6 6.2 31.7 3.8Z", className: "eyes_svg__cls-1" })] }));

const SvgFaceEmotionAnger = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M695.9 570h-23.8c-12.6 12.2-29.2 26.7-38.8 31.4v-1.3c7.7-19.9 36.5-122.6 32.6-141.7-17.5-85.2-58.3-179.2-86.5-245.7h-1.3c5.1 30.9-8.6 81.5-28.8 101.6H548c-8.4-64.8-16.7-129.5-25.1-194.3-.4.8-.8 1.7-1.3 2.5-11.3 25.9-22.5 59.5-33.9 77.7-15.1 32.7-38.9 59.9-60.2 96-8.2 2.2-16.5 14.7-28.8 20.5 7.1-52.3 14.2-104.5 21.3-156.7-.5.8 8.6 1.7 4.4 2.5-15.7 14.6-25.8 29.3-35.8 43.9-31.1 44.3-77.9 108.1-116.5 143-.4-53.4-.8-107-1.3-160.4-.5.8-.8 1.7-1.3 2.5-32.2 62.9-64.3 122-87.7 183-23 28.8-37.3 57.7-51.4 86.5 2.1 10.5 4.1 20.9 6.3 31.4 8.1 42.9 20.3 89.9 30.1 115.4h-1.3l-2.5-2.5c-14.6-11.7-29.3-23.4-43.9-35.1H96.6c-.5-30.5.4-62.3 0-92.7-15.1 7.1-31.4 15.5-46.4 22.5-.6-53.7-2.6-137.2 2.5-166 41-186.4 148.8-261.6 293.6-290.4 44.7-6.3 103.5-4.4 142.9 6.3 42 11.4 80.1 27.8 111.6 50.1 72.9 52 121.3 133.6 140.4 239.4 7 53.4 5.2 107 9.4 160.4-23.5-7.1-39-14.2-54.5-21.3v91.4ZM500.4 244.2c6.2 6.2 19.9 103.1 16.3 115.4-25.4 7.5-87.3 46.4-82.7 80.2 5.7 6.8 6.4 4.4 15.1 5.1 16.5-18.9 43.2-37.3 66.4-48.8 14.1-7 33.1-4.2 42.6-21.3-1.7-4.1-3.3-8.4 4.4-12.5 3.8-10.1 9.1-26 20.7-37.6h1.3c11.5 35 36.6 113.2 36.3 122.7 3.8 37.8-39 176.5-55.2 198.1-17.5 23.4-48.6 38.3-72.7 55.2-15.4 10.8-77.7 56-101.6 59.6-10-6.6-149.5-85.3-164.2-123.5-12.4-24.6-22.5-63.3-32.6-96.5-5.4-17.9-21.4-81.1-20.1-94 20.1-39.3 40.1-78.6 60.2-117.8.8 0 .5 28.8 1.3 28.8-1.8 2.5-4.7 1.7-12.5 15.1 1.9 6.8 4.8 8.1 11.3 10V410c12.6-3.9 21.1-8.4 31.4-13.8 23.8 18.9 47.1 30.9 67.7 48.8 8.7-.6 12.2-3.7 16.3-8.7-6.3-29.9-32-42-55.2-62.6 2.1-2.5 4.1-5.1 6.3-7.5 22.4-15.9 47.5-47.8 62.6-68.9h1.3c-5.1 35-10 70.2-15.1 105.3 59.6-37.3 116.4-94.5 150.3-158ZM232.2 415.8c-1.3 14.2 4.5 10.5-3.8 18.2 5.9 1 20.5 3.9 17.6 12.6-9.8 11.7-17.2 25.2-7.5 48.1 33.5-4.4 60.6 0 76.4 7.5 7.3-10.7 12.1-22.4 22.5-30.1-.4-1.3-.8-2.5-1.3-3.8-32.1-17-64.6-43.9-103.9-52.6Zm313.3 0c-35 18-74.1 29.5-101.6 55.2v1.3c7 5.4 18.8 28.8 22.5 30.1 11.3-2.9 22.5-5.9 33.9-8.7 14.2.5 28.4.8 42.6 1.3 6.5-10.6 5-38.6-7.5-51.4.5 7.4.8 6.1 1.3-2.5 5.4-3.8 10.9-7.5 25.8-11.3-8.4-4.1-11.1-8.4-12-12.5-1.7-.6-3.3-.9-5-1.4ZM362 547.5c-12.9 4.7-14.8 9.3-15.8 13.8 25.5 44.3 77.1 38 101.6 0-.8-4.2-2.9-9.1 1.9-13.8H434c-22 30.4-52.4 30.9-74 0zm31.8 55.2c-10.8.9-40.8 2.6-53.9 8.7-4.2 10.3-28 54.8-15.5 84 10 6.6 143 2.5 153.3-2.5 7.3-18-17.6-74.5-26.3-86.5-19.2-1.3-24.9-2.6-57.7-3.8Zm67.7 82.1c-36.8-7.8-85.3-7.4-127.9-7v-6.3c.8-4.1 1.7-8.4 2.5-12.5 11.7-.8 23.4-1.7 35-2.5.8-4.6 1.7-9.2 10.2-9.3-8.1 2.8-8.6-5.3-9-5.8-6.3.5-14.7 8.6-30.1 5.8 3.3-11.2 7.9-17.8 11.3-24.6 29.3-.5 58.5-.8 95.9-1.3-5.3 6.7-2.4 13.3.6 20.1-16.7.5-33.4 8.6-50.1 5.8-.5.5-.8 5.5-1.3 10.5h58.9c1.5 6.3 2.8 12.5 4 27Z", className: "faceEmotionAnger_svg__cls-1" })] }));

const SvgFaceEmotionFun = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M699.5 573.3h-24.1c-2.4 10.6-28.1 25.3-39.3 31.7v-1.3c8.8-20.1 36.1-129.1 33-143.3-19.4-89.5-51.8-179.3-87.5-248.5h-1.3c-5.3 30.7-6 83.8-29.2 102.7h-1.3c-8.5-65.5-16.9-131.1-25.4-196.5-.5.8-.8 1.7-1.3 2.6l-34.2 78.6c-15.3 33-39.4 60.5-60.9 94.3-8.3 3.6-16.7 17.8-29.2 23.6 7.2-44.5 14.3-105.7 21.5-158.5-.5.8-.8 1.7 8.6 2.6-20.1 14.8-30.3 29.6-40.4 44.3-31.5 44.8-80 109.8-117.9 144.6-.5-54.1-.8-98.4-1.3-162.3-.5.8-.8 1.7-1.3 2.6-32.6 61.7-65.1 123.4-90.6 185.1-21.5 29.2-35.9 58.3-50.2 87.5 2.1 10.6 2.9 23.6 5.1 34.2 9.6 41.7 20.9 79.6 31.7 114.1h-1.3c-.8-.8-1.7-1.7-2.6-2.5-14.8-11.9-29.6-23.6-44.4-35.5H92.9c-.5-30.8-.8-61.7-1.3-92.5-15.2 7.2-30.4 14.3-39.8 21.5-4.3-53-13.3-121.7-3.3-171.3C83.4 158.9 195 57.1 345.6 40.8c45.4-1.2 104.8-1.7 144.6 6.3 42.6 11.6 81.1 28.1 112.8 50.7 73.8 52.6 122.8 135.1 142 242.2 2.3 54.1 6.4 108.2 10.8 162.3-25.1-7.2-40.7-14.3-56.4-21.5v92.5ZM519.3 364c-34.1-1-52.6 6-76.1 21.5.5 8.1.8 5.1 1.3 7.6 21.2 1.6 49.7-3.5 68.5 2.6 35.4 11.4 44.6 28.9 58.3 35.5.5-1.3.8-2.6 1.3-3.8.7-19-34.4-48.2-29.2-52 13.2-1.6 34.9-37.3 41.8-50.7h1.3c11.9 39.7 26.8 79.5 43.5 119.2-3.6 25.3-18.9 71.6-25.8 96.4-9.6 34.7-14.9 72.6-31.7 101.4-14.8 25.6-138.9 111.4-172.4 117.9-20.6 4-70.3-34.9-83.7-40-25.8-23-51.6-41.6-77.3-50.1-27.9-42.4-38-95.1-50.8-141.9-5.5-21.1-11-53.3-16.5-79.8 20.3-39.7 40.6-79.5 60.9-119.2h2.6v1.3c-.8 22-1.7 44-2.6 65.9-4.7 5.9-13.6 17.6-15.3 34.2.8.5 4.2.8 5.1 1.3 23.9-11.9 35-30.3 67.2-38.1 19.4-2.9 48.8 9.5 55.8-2.5.5-1.7.8-3.4 1.3-5.1-9.6-1-24.6-15-43.1-16.9 8.5-11.8 16.9-20.2 25.4-28.7 20.3-14.3 28.7-28.8 37.1-43.1h-1.6c-5.1 35.5-10.1 71-15.3 106.5 44.6-25.3 86.2-69.3 117.9-107.8 11.9-17.3 23.6-34.7 35.5-52h1.3c12.9 39.9 10.1 80.1 15.2 120.2Zm-232.1 78.7c-22.2 4.7-43 12.5-50.8 48.2.5.5.8.8 4 1.3 15.8 3.8 34.5-5.9 53.1-8.8 22.5-.6 40.7 7.9 59.6 10.1-3-16.5-21.2-39.1-24.1-44.3-3.6-6.5-18.3-7.1-41.8-6.4Zm192.8 0c0 1.3-11 2.6-13.3 3.8-11.5 16-23.9 30.9-29.8 46.9h12.8c10.1-6.4 37.4-13.1 60.8-8.8 13.3 2.3 29.7 9.5 44.1 6.3v3.1c-8.3-38.8-31.8-52.4-74.6-51.3m-52 121.7c-33.7 23.6-69.9-4.8-78.6 5.1-.5 2.9-.8 5.9-1.3 8.8 19.7 25.2 68.8 28.7 96.4-2.5-.5-2.6-.8-5.1-1.3 2.5-4.8-12.6-6.9-13.7-15.2-13.9m-134.4 65.9c-1.9 7.2 2.9 12.4 2.5 19 54.1 22.4 132.4 24.2 177.6 7.6 9.3-2.9 17.5-4.3 30.7-10.1-3.6-4.6-2.3-4.8-4-16.5z", className: "faceEmotionFun_svg__cls-1" })] }));

const SvgFaceEmotionJoy = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M699.7 572.5h-24.1c-11.4 11.6-25 24.1-39.3 31.7v7.4c7.8-28.7 36.7-134.8 32.9-151.8-19.6-89.4-52.5-178.4-87.4-248.3h-1.3c-2.7 31.3-15.2 87.1-29.2 102.6H550c-8.5-65.4-16.9-130.9-25.3-196.4-.5.8-.8 1.7-1.3 2.6-11.4 26.1-22.8 52.4-34.2 78.6-15.3 32.9-39.4 60.5-60.8 91.3-8.3 6.5-18.5 20.1-29.2 26.5 7.2-47.1 14.4-105.5 21.5-158.4-.5.8-.8 1.7 7.2 2.6-18.6 14.8-28.7 29.5-38.8 44.4-31.5 44.7-80.6 110.6-117.9 144.5-.5-54-.8-100.7-1.3-162.1-.5.8-.8 1.7-1.3 2.5-32.5 61.7-65.1 123.3-89 185-23 29.2-37.4 63.6-51.7 87.4 2.1 10.6 4.2 23.6 6.3 34.2 9.6 41.6 20.1 80 30.4 114h-1.3c-.8-.8-1.7-1.7-2.5-2.6-14.8-11.8-29.5-23.6-44.4-35.4H93.6c-.5-30.8-.8-61.7-1.3-92.5-15.2 7.2-30.5 14.4-36.9 21.5-7.5-58.4-6.6-139.8-6.2-171.1 37.5-175.8 149.5-273.6 297-290.2 45.4-1 104.7-1.7 144.5 6.3 42.5 11.6 81.1 28.1 112.8 50.7 73.7 52.5 122.7 135 142 242 .5 54 3.1 108.1 5.3 162.1-19.7-7.2-35.3-14.4-51-21.5v92.4ZM503.3 240.6c5.5 14.2 12.2 96.8 16.5 119.1-14-9.4-83.6 9.7-74.8 30.4 70.9-8.2 94.5 11 125.4 38 1.7-.8 3.4-1.7 5.1-2.6v-7.6c-7.4-27.8-28.4-43.9-30.5-45.6 18.1-12.1 34.2-38.8 40.6-48.1h1.3c11.4 37.7 33.4 93.6 36.7 124.1 1.7 16.2-39.5 178.4-55.8 200.1-17.8 23.6-49.1 38.6-73.5 61.8-15.6 7.3-90.5 51.5-91.2 49.6-42.1-9.3-163.7-90.5-177.5-120.4-1.3-20.4-22.8-64-32.9-97.5-5.4-8-21.1-82.6-20.2-95.1 20.2-39.7 40.6-79.4 60.8-119.1h2.5c-.5 18.1-.8 38.8-1.3 57-2.7 8-19.2 21-20.2 35.4.8 2.1 2.9 5.5 3.8 7.6h3.8c36.5-37.5 72.4-45.7 122.9-36.7.5 5.9 2.1-7.2 2.6-10.1-11.7-7.9-23.9-11.5-39.3-20.2 17.9-15.6 39.1-43.7 55.8-64.6h1.3c-5.1 43.2-10.1 70.9-15.2 106.4 67.7-38.8 119.1-97.5 153.5-161.9ZM241.9 492.7c9.7-.2 39.8-12.7 66.3-10.1 16.8 2.8 31.3 9.3 45.6 10.1v-1.3c-4.8-8.3-18.5-42.5-23.1-44.4-50.5-12.7-92.8 7.3-88.8 45.6Zm310.9 0c.5-26.3-37.9-55.1-92.5-44.4-3.5.9-19.6 31.1-22.8 44.4 14.4-.8 23.6-5.5 40.1-8.8 28-3.2 55.8 4.4 75.2 8.8m-200.3 73.5c1.1 4-2.6 4.2-3.8 6.3v3.8c9.3 25.5 85.4 32.9 96.3-5.1-1.3-1.7-2.6-3.4-3.8-5.1-16.7.2-18.9 5.6-37.9 7.6-28.3-.6-33.5-7.2-50.9-7.6Zm-50.7 53.3c-2.1 2.5-4.2 5.1 2.2 7.6 43.1 89.9 139 90.4 198.5 0-6.3-2.5-8.5-5.1-10.6-7.6-51.9 13.2-134.8 12.9-190.1 0", className: "faceEmotionJoy_svg__cls-1" })] }));

const SvgFaceEmotionSorrow = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M702 573h-24.1c-13.7 13.2-26.5 23.6-39.4 34.3v-3.8c7.8-20.1 36.4-126.3 33-143.4-17.1-86.2-58.7-181.9-87.6-248.7h-1.3c-3.8 31.4-15.5 87.2-29.2 102.7h-1.3c-8.5-65.6-16.9-131.2-25.4-196.7-.5.8-.8 1.7-1.3 2.6-11.4 26.2-22.8 55.2-34.3 78.6-15.3 33-39.5 60.6-60.9 97.1-8.3 2-18.9 14.9-29.2 20.9 7.2-52.9 17.1-106.2 21.6-158.6-.5.8 8.8 1.7 4.5 2.6-15.9 14.8-27.4 29.6-37.5 44.4-32.3 45.1-79.3 111.5-116.8 144.7-.5-54.1-.8-108.3-1.3-162.4-.5.8-.8 1.7-1.3 2.6-32.6 64.3-65.2 123.5-93.9 185.3-18.2 29.2-32.7 58.4-47 87.6 2.1 10.6 4.2 21.2 6.3 31.7 7.7 44.8 20.1 82 30.4 116.7h-1.3l-2.6-2.6c-14.8-11.9-29.6-23.7-44.4-35.5H94.9c-.5-30.9.5-63 0-93.9-15.3 7.1-31.8 16.7-44.1 24-1.3-55.4-8.6-131.9-.4-170.2C81.3 178 182.1 62.2 347.8 40.2c45.3-1 104.9 6 144.7 6.3 42.6 11.6 81.2 28.1 113 50.8 73.9 54.7 122.9 135.2 142.2 242.4.5 54.1 5.3 108.3 5.4 162.4-19.8-7.2-35.5-14.3-51.1-21.6zM503.9 243.2c10.1 14.4 15.7 113.6 21.6 143.4 30.5-15 46.5-33.7 62.2-62.2h1.3c11.8 38.5 34 101 36.8 124.4 2 16.9-39.6 178.7-55.8 200.5-17.8 23.6-49.2 38.7-73.6 55.8-15.5 10.9-79.2 59.9-102.8 54.5-36-8.1-149.6-90.9-166.3-119.3-16.6-28.1-22.9-64-33-97.7-5.4-18.1-20.4-82-20.3-95.2 20.3-39.7 40.7-79.6 60.9-119.3h2.6c-.8 27.5-1.7 55-2.6 92.4 44.4-18.4 99.5-85.4 130.8-124.1h1.3c-3.4 24.1-6.8 50.8-10.1 74.9-1.7-2.5-6.3-7.8-12.7-7.6-17.8 13.5-29.5 27-53.4 40.6-14.8 8.7-51.1 20.5-57.1 34.6 0-.6-2.1 6.8 2.6 11 67.6 7.5 116.8-52.1 116.8-52.1s-.6 5.4 0 5.1C400.8 369.5 467.5 311 504 243.2Zm-49.5 120.5c-2.1 2.9-4.2 5.9-6.3 8.9-21 41.7 79.2 78.6 129.7 77.4-8.6-1.3-8.2-2.6-7.8-3.8 3.7-5.4 1.9-10.6 0-16.5-16.8-5.3-49.7-13.8-67.5-33-16.7-7.5-28.3-29.3-48-33ZM349 458.9c-12.1 6.7-67.3 18.2-115.5 17.8-.9 0-2.9 4.7 5.8 6.3 11.6 13.2 9.8 20.9 10.8 22.8 10.6 21.6 85.9 27 96.5 5.1 2.6-17.4 5.1-34.7 7.6-52.1H349Zm100.3 0c2.6 18.2 5.1 36.3 7.6 54.5 38.4 27.9 101.9 2.7 99.1-16.5-.6-3.5 13-8.6 17.8-14-.8-2.1-1.7-4.2-2.6-6.3-43.9.7-84.6-9.2-121.9-17.8Zm-88.9 104c-2.1 2.6-4.2 7.1-6.3 7.6.5 2.1.8 4.2 1.3 6.3 25.7 31.6 75.9 26.9 95.2-1.3-1-3.8-3-8.2 1.8-12.7-27.1.8-34.6 15.4-56.4 11.4-13.8-2.5-9.4-10.7-35.6-11.4Zm40.7 57.1c-31.6 2.1-67.1 21.8-85.1 59.6.8 6.8 1.7 3.4 2.6 5.1 52.3-27.5 116.5-19.4 167.6 0 .8-.5 1.7-.8 3.7-1.3v-5.1c-15.2-24.6-35.7-50.8-88.8-58.3", className: "faceEmotionSorrow_svg__cls-1" })] }));

const SvgFaceEmotionSurprise = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M709.6 571.3h-31c-8.3 10.5-26 26.5-39.1 31.5v-1.3c7.8-20 36.3-126.7 32.7-142.2-15.8-69.2-55.5-170.5-86.9-246.7H584c-3.8 31.1-12 78.2-29 102h-1.3c-6.9-65-16.8-130-25.2-190.6-.5-3.7-.8-2.9-1.3-2-11.3 26-22.7 52.1-34 78.1-15.2 32.7-39.2 60.1-60.4 89.4-8.2 7.8-16.6 21.9-29 27.7 7.2-48.8 14.3-104.8 21.4-157.4-.5.8-.8 1.7-1.3 2.5-10.1 14.7-20.1 29.3-30.3 44.1-28.8 40.9-80.5 118.8-118.5 147.2h-1.3c2-37.5 2.5-82 2.5-123.3-.5-13.9-.8-27.7-1.3-41.6-.5.8-.8 1.7-1.3 2.5-32.4 61.3-64.7 122.5-91.1 183.8-20.2 29-34.5 67-48.7 86.8l6.3 31.5c9.6 41.3 22.3 77.9 30.3 115.8h-1.3l-2.5-2.5c-14.7-11.8-29.4-23.5-44.1-35.2H99.9c-.5-30.6-.8-61.3 5.7-91.9-22.1 7.2-37.2 14.3-51.3 21.4-1.6-54-8.7-120.7 1.6-170C90 167.8 201.7 55.4 350.8 42.6c45.5-3.9 104.3-4.4 143.9 6.3 42.3 11.5 80.6 27.9 112.1 50.3 79.3 52.2 122 134.1 141.1 240.4.5 53.7.8 107.4 1.3 161.1-15.5-7.2-31.1-14.3-39.5-21.4v91.9ZM506 244c7.7 8.3 12.8 72.7 13.9 89.4-1.7.5-3.4.8-5.1 1.3-32.7-9-66.6 17.4-79.4 37.8 4.2 8.7 9 18.6 13.9 13.9 7.7-7.5 43.4-33.4 76.9-15.1.5.3-1.2 9.9 1.3 15.1 5.8-3.2 11.9-7.5 13.9-6.3 10.3 7 25.6 13.8 21.4 21.4 13.2-22.3 6.6-23.4-2.5-40.3 13.7-8.6 17.9-25.3 29-36.5h4.9c17 39.5 19.9 78.9 31.6 118.3 5.5 30.4-10.9 71.2-17.7 95.6-9.6 34.4-14.8 72-31.5 100.7-14.7 25.4-138 110.5-171.3 120.7-20.4.4-69.8-38.4-80.8-38.3-28-28-53.5-46.4-79.2-64.8-27.7-32.1-37.7-84.4-50.4-130.9-5.4-20.4-10.9-52.9-16.4-79.3 20-39.5 40.2-79 60.3-118.5h2.5v1.3c-.4 10-.8 20.1-1.3 30.3-2.1 3.9-11.5 10.3-12.8 18.9 2.9 13.2 4.3 21.9 7.7 25 6.3-8.3 2.1-.7 3.8 12.8 28.1-14.3 49-33.4 66.8-49.1 33.9 4.4 29.2 13.9 45.3 18.9l6.3-5.1c-.8 7.2 1.4 14.3-2.5 21.4 59.5-33.7 119.8-97.2 151.2-158.7Zm-130.3 52.9c-3.5 5.4-13.8 58.8-15.8 70.4-18.8-22.2-27.3-21-29-14.5.8 0 1.7-11.9 6.3-11.9 12.7-14.7 25.6-29.4 38.4-44.1Zm-83.9 119.6c-24.4 8.9-31.6 20.2-41.6 46.5 24.1 60 103.9 38.6 86.9-15.1-5.1-.8-10.1-1.7-12.8-2.5-6.9-9.8-3.4-15.9 0-22.6-11.6-3.8-17.7-6.5-32.6-6.3Zm196.6 0c-29.9 9-43.9 57-13.9 75.5 39 24.1 62.4-3.1 73.1-29-9.5-26.4-23.3-47.6-59.2-46.5m-55.5 144.7c-27.4 23-55.9-1.9-78.1 6.3v14.3c18.5 21.3 80.6 18.9 94.5-8-1-2.9-3-8.1-6.3-12.6h-10Zm-39 64.2c-8.4 4-19.2 8.9-23.9 16.4-19.8 31.1-4.8 90.5 39.1 80.6 44.3-.3 48.1-102.5-15.2-96.9Z", className: "faceEmotionSurprise_svg__cls-1" })] }));

const SvgFaq = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m40 135 27.1 407.6 163-13.6-13.6 176.6L406.7 529l271.7 13.6 81.5-448.3zm385.5 293.8h-51.2v-51.2h51.2zm22.1-133.5-4.2 1.8q-13.8 6.15-15.9 12c-1.4 3.9-2 9.5-2 16.9v25.7h-51.2V326c0-21.2 11.2-38.5 33.5-52l4-2.4c9.2-5.5 13.8-13.1 13.8-22.6s-2.5-12.9-7.5-17.9c-5-5.1-11-7.6-18-7.6h-25.7c-15.8 0-24.4 8.5-25.7 25.5h-25.5c3.9-34.1 21-51.2 51.2-51.2h51.2c14 0 26.1 5 36.2 15.1C472 222.9 477 235 477 249c-.1 22.2-9.9 37.7-29.4 46.3", className: "faq_svg__cls-1" })] }));

const SvgFeet = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m743.2 553.3-48 14.6h-76.8l-69.6-4.9-28.8-46.2-26.3-19.5-52.8-41.4-79.2-56-41.3-56 4.6-43.8-9.6-119.3 88.8-2.4h113.4l-7.2 85.1 16.8 70.6 40.8 58.4 117.6 68.2 38.4 14.6 36 63.3-16.9 14.6ZM328 417.1 445.6 512l38.4 17.1 36 63.3-8.6 14.6-56.2 14.6h-76.8l-67.2-7.2-244.9-51.2L40 551v-46.2l7.2-46.2 19.2-80.3 2.4-53.5-9.6-119.3L148 203h132.4l-10.1 90 16.8 65.7 40.9 58.5Z", className: "feet_svg__cls-1" })] }));

const SvgFilter = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m315.9 605.8 70.7 13.3v141.3l-61.8-13.3V605.8H316ZM417.5 623.5l70.7 13.3v101.6l-61.8-13.3V623.5h-8.8ZM713.4 195.1 678.1 40.5H143.6L86.2 212.8l216.4 176.7v181.1c-4.4 0 203.2 35.3 203.2 35.3V385c-4.4 0 207.6-189.9 207.6-189.9M452.8 557.3 360 530.8V367.4L214.2 226.1l375.5-13.3-136.9 154.6z", className: "filter_svg__cls-1" })] }));

const SvgFork = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 1200 1200", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M1196.6 363.84 911.57 127.5a9.53 9.53 0 0 0-10.129-1.29 9.53 9.53 0 0 0-5.473 8.618v146.01c-93.984 1.617-182.17 27.145-249.25 72.297-16.918 11.391-32.586 24.113-46.676 37.906-14.09-13.793-29.754-26.516-46.676-37.91-67.074-45.152-155.26-70.68-249.25-72.297l-.004-146a9.52 9.52 0 0 0-5.472-8.617 9.52 9.52 0 0 0-10.13 1.289L3.48 363.846a9.52 9.52 0 0 0-3.445 7.332 9.53 9.53 0 0 0 3.446 7.332l285.03 236.34a9.53 9.53 0 0 0 10.129 1.29 9.53 9.53 0 0 0 5.472-8.618v-145.78c77.191 2.351 208.32 33.383 208.32 138.86v464.58c0 5.258 4.266 9.523 9.524 9.523h156.16c5.258 0 9.523-4.265 9.523-9.523v-464.58c0-105.48 131.13-136.5 208.32-138.86v145.78a9.524 9.524 0 0 0 15.602 7.328l285.03-236.34a9.52 9.52 0 0 0 3.445-7.332 9.5 9.5 0 0 0-3.445-7.328z" })] }));

const SvgGeneralSettings = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M760 289.3v58.9l-64.3 19.6-21.7 46.7 36.9 56.5-46.6 46.6-56.5-36.9-49.1 19.6-17.2 68.7-61.4-2.5-12.3-71.2-51.6-14.8-58.9 36.9-44.2-46.7 42.6-56.5-25.4-46.5-68.8-19.6v-56.5l66.3-17.2 24.6-46.7-36.9-61.4 44.2-41.8 56.5 34.4 46.7-17.2 14.8-71.2h63.9l17.2 68.7 41.8 19.6 73-34.4 45.7 41.8-47.5 61.4 17.2 41.8 71.2 19.7Zm-248-60.5c-49.6 0-89.9 40.3-89.9 89.9s40.3 89.9 89.9 89.9 89.9-40.3 89.9-89.9-40.2-89.9-89.9-89.9M268.4 519.4l22.5 35.7 46.8 11.2v46.8l-46.8 7.5-24.3 39.4 18.7 43-41.2 26.2-25.2-37.4h-53.4l-30 37.4-41.2-24.3 16.9-43-12.9-39.4-58.2-9.4v-46.8l58.3-6.8 12.9-41.9-16.9-45 41.2-22.5 30 33.7H219l23.4-35.6 43 24.3-17 46.8Zm-80.5 12.3c-31.6 0-57.1 30.8-57.1 57.2s25.6 57.1 57.1 57.1 57.1-25.6 57.1-57.1c0-26.3-25.5-57.2-57.1-57.2", className: "generalSettings_svg__cls-1" })] }));

const SvgGraphics = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M712.3 720.4 9.6 616.2 87.7 79.6l702.8 108.3zm-638-158.9 595.1 90.1 58.9-416.8L135 154.5zm91.4-88.7 57.7-16 85.2 9.8 34.6 9.8 132.2-152.7 69.2 140.4 64.1-57.9 28.2 199.7L124 529.6zM266 368c-37.3 0-67.4-30.2-67.4-67.5S228.8 233 266 233s67.4 30.2 67.4 67.5c.1 37.4-30.1 67.5-67.4 67.5", className: "graphics_svg__st0" })] }));

const SvgHead = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m653.5 431.8-23-4.6-34.3 78.4-33.6 1.2 34.1-86.4-40.8-77.2-54.5-53.4-52.1 41.2-70.3 39.8 8-30.9 2.2-47.7L282 343.3l-67.4 87.4s39.3 90.6 37.5 92l-27.2 1.2-36.4-73.9-30.3 14.8 8.6-65-20.4-89.5 11.4-44.3 26.1-73.8 59-61.4 72.6-51.1 73.6-4.6 85.1.8L540 107l45.3 42 31.7 55.7 20.4 40.9 14.8 72.6-5 64.8zm-365.2-61.4 84-46.5-20.4 80.9L463 349.2l41.9-26.4 30.6 34.1 34.1 61.4-30.6 75-22.7 44.3-38.5 36.8-57.9 33.8-9.3 2.1-22.5-5.6-56.7-29.7-41.9-40.9-30.6-61.4-18.2-40.9zm5.7 254.5-1.2-42.2 79.4 39.9 38.4 8 25.2-6.8 71.5-40.9 8 58 27.2 29.6L410.6 725l-146.1-47.7 18.2-8z", className: "head_svg__st0" })] }));

const SvgHeadset = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 1200 1200", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m989.5 563.3 21-491-818.3 56.2 20.7 434.3-135.5 30v269.7l148.6 33 12.6 232.2h431.3l-33.7-104.2-336.9 50.1-16-165.4 97.6 21.7V525.5l-91.1 20.2 31.6-331.5 558.7-41.1 33.2 373.3-94.2-20.9v404.4l303.5-67.4V592.8z", className: "headset_svg__st0" })] }));

const SvgHealth = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m125 50 172.4-12.2 108.8 204.5L510.5 37.8 671.6 50l120.7 23.4L788 336 414.8 762.2h-37.3L7.7 333.8V73.4z", className: "health_svg__st0" })] }));

const SvgHide = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m765.6 454.9-53.4 75.9-48 45.6 127.2 134.4-69.4 59.5L20.4 104.4l64-74.7 136.8 126.5 90.7-35.4 106.8-10.1L548 130.9l121.5 75.9 80.1 94 42.7 98.8zM589.5 350.2l-31.1-77.6-75.7-50.6-90.7-15.2-90.8 45 69.4 51.2 64.1 5.1 37.4 20.2 26.7 50.6-5.3 40.5 74.7 70.9 26.7-65.8zM98.4 247.3l112.1 101.3-5.3 100.4 48 71.6 80.1 50.6 90.7 10.1 26.7-5.1 97.3 75.9-113.3 25.3-117.4-10.1-133.5-50.6-101.4-91-58.7-86.1-16-40.1L45 308.1z", className: "hide_svg__st0" })] }));

const SvgHome = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m403.2 78.4-318 300.8 98.4 2.8-32.7 339.6h163.4l6.3-293.2 139.9-12.7L474 721.6h158.9l-7-329.6h89z", className: "home_svg__st0" })] }));

const SvgImage = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { fillRule: "evenodd", d: "M712.3 720.4 9.6 616.2 87.7 79.6l702.8 108.3zm-638-158.9 595.1 90.1 58.9-416.8L135 154.5zm91.4-88.7 57.7-16 85.2 9.8 34.6 9.8 132.2-152.7 69.2 140.4 64.1-57.9 28.2 199.7L124 529.6zM266 368c-37.3 0-67.4-30.2-67.4-67.5S228.8 233 266 233s67.4 30.2 67.4 67.5c.1 37.4-30.1 67.5-67.4 67.5", clipRule: "evenodd" })] }));

const SvgInfo = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M652.8 602h139.5v81.4H652.8zM6.1 602h553.7v81.4H6.1zM6.1 439.3h786.2v81.4H6.1zM6.1 276.6h786.2V358H6.1zM6.1 198h786.2v-81.4H6.1", className: "info_svg__st0" })] }));

const SvgIntelligent = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 1200 1200", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M994.5 635.16a105.78 105.78 0 0 0 68.73 65.965 105.78 105.78 0 0 0 136.804-101.121 105.778 105.778 0 0 0-136.804-101.121 105.78 105.78 0 0 0-68.73 65.965H705.77v-353.32h56.25l130.95 130.92a35.17 35.17 0 0 0 24.844 10.289h76.781a105.78 105.78 0 0 0 68.73 65.965 105.78 105.78 0 0 0 136.804-101.121 105.778 105.778 0 0 0-136.804-101.121 105.78 105.78 0 0 0-68.73 65.965h-62.297l-130.92-130.92a35.16 35.16 0 0 0-24.867-10.289h-76.055C680.534 60.286 606.284.006 517.976.006a187.2 187.2 0 0 0-93.84 24.465 187.2 187.2 0 0 0-69.004 68.137 256 256 0 0 0-14.062-.375c-136.17 0-246.96 108.84-246.96 242.65a241 241 0 0 0 1.992 30.188 307.9 307.9 0 0 0-85.242 142.59 307.93 307.93 0 0 0 1.246 166.12 307.9 307.9 0 0 0 87.371 141.29 238.8 238.8 0 0 0-5.273 50.062c0 133.8 110.79 242.65 246.96 242.65q7.031 0 14.062-.375a187.2 187.2 0 0 0 162.75 92.601c88.312 0 162.56-60.281 182.48-141.21h76.055a35.15 35.15 0 0 0 24.867-10.289l130.92-130.92H994.5a105.78 105.78 0 0 0 68.73 65.965 105.78 105.78 0 0 0 136.804-101.121 105.778 105.778 0 0 0-136.804-101.121 105.78 105.78 0 0 0-68.73 65.965H917.72a35.17 35.17 0 0 0-24.844 10.289l-130.92 130.92h-56.25v-353.32zM289.66 288.14a35.44 35.44 0 0 1 20.512-6.062 35.44 35.44 0 0 1 20.27 6.835 36.2 36.2 0 0 1 6.727 6.235c9.515 7.898 29.039 18.914 39.469 17.156 1.289-.235 5.226-.914 10.242-10.711 24.094-47.203 53.906-72.891 88.664-76.406 45.14-4.688 75 31.078 78.234 35.156l-54.961 43.852.328.398c-3.07-3.61-11.11-10.078-16.664-9.375-6.563.774-19.148 11.297-32.977 38.414-16.172 31.688-43.195 49.22-75.164 49.22a90 90 0 0 1-10.57-.634c-17.79-2.062-36.328-9.164-55.055-21.094-29.344-18.75-31.805-28.758-33.445-35.414-1.735-6.984-1.285-14.328 1.289-21.047s7.148-12.484 13.102-16.523zM278.902 673.8c-24.539-20.203-37.898-53.18-39.844-98.109-3.21 3.562-6.352 7.29-9.094 10.898a35.2 35.2 0 0 1-32.383 13.781 35.192 35.192 0 0 1-23.867-56.086c19.477-25.781 58.008-67.406 97.172-54.305 25.312 8.46 38.133 33.586 38.133 74.719 0 38.836 10.031 51.281 14.344 54.82a16.9 16.9 0 0 0 9.937 3.61 35.159 35.159 0 0 1 40.02 45.895 35.15 35.15 0 0 1-26.496 23.104 72.3 72.3 0 0 1-13.266 1.102 85.65 85.65 0 0 1-54.656-19.43zm216.3 150.52c-11.859 1.664-25.57 4.922-35.438 11.273 22.992 27.141 32.086 58.055 25.781 89.062-1.621 7.934-5.926 15.062-12.195 20.188s-14.113 7.93-22.211 7.938a35 35 0 0 1-7.031-.727 35.156 35.156 0 0 1-27.422-41.484c6-29.367-44.062-57.305-57.797-63.164a35.16 35.16 0 0 1-21.066-18.81 35.15 35.15 0 0 1-.43-28.241 35.154 35.154 0 0 1 48.66-17.543c1.383.586 8.062 3.47 17.367 8.578 15.914-16.102 41.32-30.914 82.03-36.609a35.156 35.156 0 1 1 9.75 69.633zm39.164-330.73c-8.977 1.266-22.055 4.008-31.688 9.844 20.227 25.547 28.125 54.398 22.125 83.414a35.17 35.17 0 0 1-12.195 20.188 35.15 35.15 0 0 1-22.211 7.937 35 35 0 0 1-7.031-.726 35.156 35.156 0 0 1-27.422-41.484c5.437-26.578-39.352-52.148-51.562-57.54a35.15 35.15 0 0 1-20.977-28.214 35.156 35.156 0 0 1 48.867-36.332c1.218.516 7.03 3.024 14.883 7.453 15.328-15.117 39.469-28.852 77.555-34.172a35.14 35.14 0 0 1 26.44 6.48 35.159 35.159 0 0 1-16.785 63.153z" })] }));

const SvgKeyboard = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 1200 1200", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M225 450h75v75h-75zM337.5 450h75v75h-75zM450 450h75v75h-75zM562.5 450h75v75h-75zM675 450h75v75h-75zM787.5 450h75v75h-75zM900 450h75v75h-75zM225 562.5h75v75h-75zM337.5 562.5h75v75h-75zM450 562.5h75v75h-75zM562.5 562.5h75v75h-75zM675 562.5h75v75h-75zM787.5 562.5h75v75h-75zM900 562.5h75v75h-75zM225 675h75v75h-75zM900 675h75v75h-75z" }), jsxRuntimeExports.jsx("path", { d: "M112.5 300v600h975V300zm900 525h-825V375h825z" }), jsxRuntimeExports.jsx("path", { d: "M337.5 675h525v75h-525z" })] }));

const SvgLeftHand = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m264.2 8.6-37 27.4 51.2 106.5 54.3 89.2-6.4 5.1-79.7-81.6-87.4-107-43.2 9.2-13.4 46.5 87.7 110.6 71.5 76-6.7 7.4-91-55.9-100.8-81.6L26.9 178l8.8 40.1 105.9 104 67.7 37.4-1.1 9.2-76-32-53.7-36.3-35 14.6-.3 33.9 57.5 51 91.4 51.3 110.8 86.3L398 583l31.2 39.1-.6 39 70.2 130.2 95.3-41.5 113.6-87.1 65.4-92.1-54.6-55.3-59-47.6-18.8.2-32.5-43.5-13.3-6.2 24.9-116.6L604 192.2l-1.6-89.1-52.7 12.5-30.7 62.3-10.9 65.5-24.7 32.3-37-35.7-43.8-47.1-64.6-91.6-35.6-78.9z", className: "leftHand_svg__st0" })] }));

const SvgLegs = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m771.5 708.5 7.5 26.7-97.9 36.2-129.6 6-7-31.3 8.9-14.4-47.5-31.1-46.3-225.5-51.8-187.5-37.1 188.8-73.9 230.1-46.8 30.2 14.4 18.3-17.4 34.4L119.2 779l-77.1-25.7 4-34.2 1.7-19.1L21 649.3l31.2-89.9L158.1 211l32.7-146 25.6.3 2.8-31.4h130.4-4.2l1.2-21.8 137-1.6.3 23.8h4.5l105.3-2.7 5.7 34 25.6-1.1 21 135 109.3 365 19.2 105.8-17.8 31.1zM375.2 48.4l-3 49.5 79.8-3 1.5-63.2z", className: "legs_svg__st0" })] }));

const SvgLimit = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m213.3 402.8 160.4 118.8-57.8 199.2L12.4 561 227.6 12.5l166.9 109.9zm352.8 98.9L462.6 372.2 627.3 239l160.3 93.3-344.8 455.2-112.3-59.1z", className: "limit_svg__st0" })] }));

const SvgLock = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 1200 1200", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M948.75 454.88 900 443.63v-68.625c0-165.38-134.62-300-300-300s-300 134.62-300 300v68.625l-48.75 11.25c-44.25 10.125-75.375 49.125-75.375 94.5V952.5c0 45.375 31.125 84.375 75.375 94.5l327 75.375c7.125 1.875 14.25 2.625 21.75 2.625s14.625-.75 21.75-2.625l327-75.375c44.25-10.125 75.375-49.125 75.375-94.5V549.38c0-45.375-31.125-84.375-75.375-94.5M637.5 825c0 20.625-16.875 37.5-37.5 37.5s-37.5-16.875-37.5-37.5V675c0-20.625 16.875-37.5 37.5-37.5s37.5 16.875 37.5 37.5zM825 426.38l-203.25-46.875a94.7 94.7 0 0 0-43.5 0L375 426.38v-51.375c0-124.12 100.88-225 225-225s225 100.88 225 225z" })] }));

const SvgLogin = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m457.1 788 4.5-81.9L643.5 638 642 154.4l-209.2-40.8L431.3 12l350.1 3v773zm95.5-348.6L257.2 734.8l-45.6-28.6 9.1-189.5-183.5 19.7L19 503.1l-.5-183.4 12.6-25.8 189.5 9.1-7.6-188 33.4-19.7L560 398.5z", className: "login_svg__st0" })] }));

const SvgLogout = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M777.9 439.4 482.5 734.8l-45.6-28.6 9.1-189.5-183.4 19.7-18.2-33.3-.5-183.4 12.6-25.8L446 303l-7.6-188 33.4-19.7 313.6 303.2zm-623.8-285L152.6 638l181.9 68.2L339 788H14.7V15l350.1-3-1.5 101.7z", className: "logout_svg__st0" })] }));

const SvgLuck = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m747.9 430.3-258.2-8 153.8 159.9L617.3 689l-98.7-.2-84.2 45.3-95.7-32-5.7-234.5-168.4 106.7-89.9-29.4-31.9-114.6-31.3-98.6 48.7-64 197.3 24-113.2-141.3 17.4-98.6 121.9-13.3 101.6-17.9L478 49.1l-14.5 205.2L637.7 137l87.9 13.3 16.5 137 46.4 68.3zM295.2 574.2l-75.4 205.2H86.3l-34.8-98.6 214.7-130.6z", className: "luck_svg__st0" })] }));

const SvgMana = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m510.3 429.8-88.2-88.2-88.2 88.2 176.4 176.5L775 363.6 422.1 13 25 340.4v111.4L331.1 787l113-92.5-242.6-286.8 220.6-176.5 154.4 132.4z", className: "mana_svg__st0" })] }));

const SvgMap = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m581.1 706.6-49.4-560.4 138.6-52.9 122.1 478.2zM305.7 576.5 357.4 97l149.7 53 28.5 551.1zM7.7 706.6l154.8-560.4 176.4-52.9-73.1 483.2z", className: "map_svg__st0" })] }));

const SvgMatch = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M84.4 661V517l462 34v-76l169.2 128-169.2 122v-78z", className: "match_svg__st0" }), jsxRuntimeExports.jsx("path", { d: "m208 493.5-6.3-5.1 52.5-63 25.5 73.4 213.1 15.7 21.1-65.3v-39.5L653.2 515l19.2-14.1-57.3-99.1-75.5-104.4-103.3-26.3-1.7-19.7 20.2-28 24.1-82-22.1-42.6-42.1-21-44.5-2.8-38.9 18.8-26.2 46 18.7 81.7 19 28.3-4.9 21.3L234.5 299 164 395.9l-41.4 91.3z", className: "match_svg__st0" })] }));

const SvgMenu = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("defs", { children: jsxRuntimeExports.jsx("path", { id: "menu_svg__a", d: "M52 324.1h696v152.8H52z" }) }), jsxRuntimeExports.jsx("path", { d: "m52 341.1 696-17v152.7L52 442.9z", className: "menu_svg__st1" }), jsxRuntimeExports.jsx("defs", { children: jsxRuntimeExports.jsx("path", { id: "menu_svg__b", d: "M52 131.2h696V284H52z" }) }), jsxRuntimeExports.jsx("path", { d: "m748 148.2-696-17V284l696-34z", className: "menu_svg__st1" }), jsxRuntimeExports.jsx("defs", { children: jsxRuntimeExports.jsx("path", { id: "menu_svg__c", d: "M52 517h696v152.8H52z" }) }), jsxRuntimeExports.jsx("path", { d: "M748 534 52 517v152.7l696-33.9z", className: "menu_svg__st1" })] }));

const SvgMic = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m571.5 283.4-25.1 20.8v116.7l-20.9 54.2-41.9 41.7-58.6 25h-46l-62.8-20.9-37.7-37.5-20.9-54.2v-62.5l-4.2-62.5-25.1-20.9-25.1 16.7v133.4l33.5 79.1 62.8 58.3 75.4 25v75h-92.1V725h234.4v-54.2h-92.1v-75l75.4-25 71.1-75 25-66.6V300.1z", className: "mic_svg__st0" }), jsxRuntimeExports.jsx("path", { d: "M379.1 495.8h46l33.4-20.9 37.7-54.1v-275l-25-41.7L400 74.9l-67 25-29.3 45.9v275l33.5 54.2z", className: "mic_svg__st0" })] }));

const SvgMicOff = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m538.8 451.6 7.1-32V302l25.1-21 25.1 16.8V428l-18.3 62.7zM302.9 142.5l29.3-46.2L403 74.9l67.5 25.6 25.1 42v269.6L302.9 218.9zm323.3 571-496-497 49.6-49.7 496 497zM256.8 428l21 54.6 37.7 37.8 62.9 21h5l52.1 55.9-11-1.4v75.6h88.8l3.3 10.9v43.7H281.9v-54.6h92.2v-75.6l-75.4-25.2-62.9-58.7-33.5-79.8v-64.7l54.5 54.6z", className: "micOff_svg__st0" })] }));

const SvgMint = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m521.4 569-4.7 56.6 132 110.8 7.1 53-450.2-8.2v-40.1l120.2-120.2-11.8-32.8-122.6-33.8V411.1l554-9.4v70.7zm-16.7-468.9 198-89.6L740.4 86l-212.2 73.1zM471.9 206l-44.6-103.3L465 86.2l44.6 105.7zM292.7 385.2l-89.6-242.8-14-49.5 172.2-70.7 115.5 294.7zm-238 37.7 103.7 2.4v96.6l-99-56.6z", className: "mint_svg__st0" })] }));

const SvgMinus = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M792.3 320.5v-19.9l-19.9 1-365.1 12.6h-19.9L28.6 295.4l-20.9-1v211.3l19.9-1 358.9-10.5h19.9l366.2 10.5 19.9 1V320.5z", className: "minus_svg__st0" })] }));

const SvgModuleStore = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("circle", { cx: 654.4, cy: 703, r: 59.8, className: "moduleStore_svg__st0" }), jsxRuntimeExports.jsx("circle", { cx: 296, cy: 703, r: 59.8, className: "moduleStore_svg__st0" }), jsxRuntimeExports.jsx("path", { d: "m745.9 480.6 3.1.4 31.4-286.9-84.1-4.5-12.5 219.2h-.1l-456.6-.2-55.9-239.2-90.9-5.6H19.6v72.3l74.1-17.3L166 515.4l23.6 97.7 551.8-16.2 4.6-75.2-485.6 29.8-15-61.5 500.5-9z", className: "moduleStore_svg__st0" }), jsxRuntimeExports.jsx("path", { d: "m328.963 102.252 90.155-90.156 90.155 90.156-90.155 90.155zM444.165 217.442l90.155-90.155 90.156 90.155-90.156 90.156zM272.07 274.307l90.156-90.156 90.155 90.156-90.155 90.155z", className: "moduleStore_svg__st0" })] }));

const SvgMount = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m211.1 126.8-55.7 65.8-35.5 96.2L19.1 471.2l37.5 44 69.7 7.4 46.8-51.4 73.4-41 68.4-7.4 40.5-47.8 5.1-101.3 32.9 71.7v77.5l-70.9 45.9-53.2 149.4-58.3 55.7 195 118.4 291.2-118.4-81-32.9 15.2-125.7-20.3-158-93.7-136.8-101.3-81 124.1 53.2L631.5 294l38 116.5 7.6 111.4-17.7 98.8L781 587.8l-15.2-184.9-81-217.8L555.5 78.7 388.4 10.3 228.8 7.8l-78.5 75.5z", className: "mount_svg__st0" })] }));

const SvgMove = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m4.9 399 136.5 115.1L113.9 399l27.5-115.1zM286.6 659.2l114.9 136.3 114.9-136.3L401.5 686zM795.1 399 658.8 284.1 685.5 399l-26.7 115zM286.6 141.8 401.5 115l114.9 26.8L401.5 5.5z" })] }));

const SvgMuted = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m357.8 578.6 68.1 48.3 109.2 76.8 41.9 42.1V554.9l-6.1-189.4zM130.3 531.8l52 4.5 389.2-389.2.8-107.1s-40.6 31.2-46.5 28.9c-5.8-2.4-108.5 83.7-108.5 83.7l-96 81.4-88.3 2.9-106 8.8-5.6 46.5 6 111.6 3 128.1Z", className: "muted_svg__cls-2" }), jsxRuntimeExports.jsx("path", { d: "M67.42 689.045 694.977 61.488l70.923 70.923-627.557 627.557z", className: "muted_svg__cls-1" })] }));

const SvgOpensea = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("defs", { children: jsxRuntimeExports.jsx("path", { id: "opensea_svg__a", d: "M7.7 46.6h784.7v706.7H7.7z" }) }), jsxRuntimeExports.jsx("path", { d: "m522.1 618.3 31.2-26 36.4-36.4 202.7-57.2v52l-57.2 31.2-52 57.2-46.8 72.7-57.2 41.6H184.3l-72.8-26-62.4-57.2-31.2-62.4-10.2-72.7H200v36.4l20.8 26 36.4 20.8H361v-77.9h-98.7l36.4-52 31.2-62.4 15.6-52-5.2-67.6-20.8-62.4-57.2-140.3 103.9 26V72.6l31.2-26 31.2 31.2v72.7l72.8 57.2 62.4 72.7 31.2 62.4v62.4l-31.2 52-52 62.4-20.8 20.8h-62.4v77.9zM272.7 384.4l-41.6 77.9H49.2l176.7-275.4L272.7 322z", className: "opensea_svg__st1" })] }));

const SvgPaint = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m500 458.6-83.7-46.8-39.3-36.9-41.9-68.9L534.5 14.7l86.1 57.5 81.2 78.8 88.6 93.5zm-112.4-10.2 58.3 32.4 7.4 83.7-24.6 83.7-46.8 73.8-83.7 48.4-107.2 4.1-97.2 10.8-84.2-2.2 38.9-45.4 23.8-45.4 14.3-67 5.1-60.5 21.6-54 47.5-54 82.1-49.7 71.3-32.4 30.2 30.2z", className: "paint_svg__st0" })] }));

const SvgPaintBucket = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M311 789.4 1.9 477l247-255L90.4 100.2l100.4-89.6 122.4 151.6 64.3-75.8 379.1 358.4-144.8 62zm66.6-581.3L115.7 474.7l392.9 13.8 78.1-71.2zm420.5 422.8L779.7 686l-41.4 23-50.5-23-11.5-52.8 57.4-128.7z", className: "paintBucket_svg__st0" })] }));

const SvgParty = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M542.7 717.5 541 725H249.4l.6-1.8-14.9-9.3-26.1-56-125-98.8 54-119.4 80.2-110 117.5-31.8 5.6-24.2-21.6-32.1-21.3-92.8 29.8-52.2L372.5 75l50.6 3.2 47.8 23.8 25.2 48.5-27.5 93.2-22.9 31.8 1.8 22.3L565 327.6l85.8 118.7L716 558.8l-132.3 97.1zM240.6 473.2l-59.7 71.6 52.2 42.2 31.7 47.1 5.6 28.4 16.8-55zm304 0-42.9 132.4 11.5 58.5 3.6 3.2.7.4 3.7-27.3 19.8-26.6 65.3-82.9z", className: "party_svg__st0" })] }));

const SvgPlay = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 1200 1200", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { fillRule: "evenodd", d: "M142.856 1171.427V28.571L1042.855 600z" })] }));

const SvgPlus = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m43 502.8 267.1-10-16 278.6-1.1 19.9h207.6l-1.1-19.9-16-278.6 273.7 10 19.6.7V305.8l-19.6.8L483 317.9l12-289.6.8-19.6H304.2l.4 19.3 6.2 289.6-267.4-16-20-1.2v203.2z", className: "plus_svg__st0" })] }));

const SvgPolygon = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M23.3 165.2 209 58.2l31.4 11.2 185.7 98.3 10.5 23.5 2.6 80.9-78.5 41.7v-73L345 212.1l-102-62.6-36.6-2.6-102 62.6-18.3 26.1v107l10.5 36.5 104.6 73h36.6l319.1-185.2 39.2-2.6 172.6 99.1 20.9 23.5 2.6 221.7-15.7 28.7-175.2 99.1-36.6 5.2-177.9-99.1-20.8-16.8-2.6-95.3 75.9-41.7 2.6 65.2 13.1 33.9 102 64.3 39.2-1.7 94.2-57.4 23.5-39.1V449.6l-13.1-32.3L596.2 353H557L251.7 530.4l-47.8 5.2L33.7 433.9l-26-36.5V196.5z", className: "polygon_svg__st0" })] }));

const SvgPower = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M438.3 421.6h-65.5L328.3 7h143.4z", className: "power_svg__st0" }), jsxRuntimeExports.jsx("path", { d: "m549.5 60.9-14.9 146.4c62.6 42.9 103.7 115 103.7 196.6 0 131.6-106.7 238.2-238.2 238.2S161.8 535.5 161.8 404c0-84.2 43.7-158.3 109.7-200.6L256 58.6C120.9 115 25.9 248.4 25.9 404c0 206.6 167.5 374.1 374.1 374.1S774.1 610.6 774.1 404c0-153.5-92.4-285.4-224.6-343.1", className: "power_svg__st0" })] }));

const SvgPress = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M470.9 179.9h-73.1c-21.6 0-39 17.4-39 39v109.6c0 21.6 17.4 39 39 39h73.1c21.6 0 39-17.4 39-39V218.9c.1-21.5-17.4-39-39-39M479.2 432.3H177.1c-17.4 0-31.5 13.3-30.7 30.7 0 16.6 13.3 30.7 30.7 30.7h302.2c16.6 0 30.7-13.3 30.7-30.7 0-16.6-13.3-30.7-30.8-30.7M177.1 240.5h97.1c16.6 0 30.7-14.1 30.7-30.7s-13.3-30.7-30.7-30.7h-97.1c-17.4 0-30.7 14.1-30.7 30.7s13.2 30.7 30.7 30.7M177.1 367.5h97.1c16.6 0 30.7-13.3 30.7-30.7 0-16.6-13.3-30.7-30.7-30.7h-97.1c-17.4 0-31.5 13.3-30.7 30.7-.1 16.6 13.2 30.7 30.7 30.7M479.2 558.5H177.1c-17.4 0-31.5 14.1-30.7 30.7 0 16.6 13.3 30.7 30.7 30.7h302.2c16.6 0 30.7-13.3 30.7-30.7 0-16.6-13.3-30.7-30.8-30.7" }), jsxRuntimeExports.jsx("path", { d: "M739.1 497.9h-88V148.4C651.1 90.3 603.8 43 545.7 43H109.8C51.7 42.9 4.4 90.3 5.2 149.2v501.4C5.2 708.7 52.5 756 110.6 756h577c58.1 0 105.4-47.3 105.4-105.4v-98.8c0-29.8-24-53.9-53.9-53.9M110.6 694.6c-24.1 0-44-19.9-44-44V149.2c0-24.1 19.9-44 44-44h435c24.1 0 44 19.9 44 44v509.7c0 12.5 2.5 24.9 6.6 35.7zm620.2-44c0 24.1-19.9 44-44 44-19.9 0-35.7-15.8-35.7-35.7v-98.8h79.7z" })] }));

const SvgPublish = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M401.3 279.8 232.9 386.1l109.6 2.8-8.1 248.7 131 2.6-10.7-248.6h112.4z" }), jsxRuntimeExports.jsx("path", { d: "M728.3 0H71.7C32.2 0 0 12.2 0 71.7v676.6C0 767.8 32.2 800 71.7 800h656.6c39.5 0 71.7-32.2 71.7-51.7V71.7C800 12.2 767.8 0 728.3 0m24.4 202.1v526.2c0 13.4-10.9 24.4-24.4 24.4H71.7c-13.4 0-24.4-10.9-24.4-24.4V202.1zm0-130.4v83.1H47.3V71.7c0-13.4 10.9-24.4 24.4-24.4h656.6c13.4 0 24.4 11 24.4 24.4" }), jsxRuntimeExports.jsx("path", { d: "M103.9 71.3c-16.3 0-29.5 13.2-29.5 29.5s13.2 29.5 29.5 29.5 29.5-13.2 29.5-29.5-13.3-29.5-29.5-29.5M181.5 71.3c-16.3 0-29.5 13.2-29.5 29.5s13.2 29.5 29.5 29.5 29.5-13.2 29.5-29.5-13.2-29.5-29.5-29.5M259.2 71.3c-16.3 0-29.5 13.2-29.5 29.5s13.2 29.5 29.5 29.5 29.5-13.2 29.5-29.5-13.2-29.5-29.5-29.5" })] }));

const SvgRank = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M205.7 790.7h389.9v-83.5H205.7zM725.9 112.8c-24.4-17.8-54.8-17-74.4-13.7V61.3c9.6-4.4 16.2-14 16.2-25.2 0-15.3-12.4-27.7-27.7-27.7H158.6c-15.3 0-27.7 12.4-27.7 27.7 0 11.7 7.3 21.8 17.6 25.8v37.2c-19.7-3.2-50-4-74.4 13.7-25 18.2-37 50.2-35.7 95.2 1.5 53 18.9 92.8 51.9 118.4 27 21 60.4 28.3 89.2 28.3 7.7 0 15.1-.5 22-1.5 38.6 73.1 95.4 124.4 160.3 139 2.9 6.7 6.1 14.9 9.1 24.3 3 9.6 6.1 19.9 6 30.8-.1 11-3.5 21.1-6.6 30.8-2.6 8.1-5.2 15.2-7.7 21.3-75.2 36.7-155.6 46.3-156.7 75.7v21h389.9v-21c-1-29.2-80.4-33.8-155.5-72.9-2.8-6.7-5.9-14.8-8.9-24.1-3.1-9.7-6.5-19.8-6.6-30.8-.1-10.9 3-21.2 6-30.8 3-9.7 6.3-17.9 9.2-24.7 64.3-15.1 120.5-66.1 158.8-138.7 6.9.9 14.3 1.5 22 1.5 28.8 0 62.2-7.3 89.2-28.3 32.9-25.6 50.4-65.4 51.9-118.4 1-44.9-11-76.9-36-95.1M110.8 299.9c-24.7-19.1-37.8-50.4-39-92.9-.9-33.2 6.4-55.8 21.8-67.1 17.2-12.6 41.8-9.7 54.9-6.8.9 68.9 14.6 133.2 37.7 188-23.7 1.3-52.8-3.5-75.4-21.2M728.2 207c-1.2 42.5-14.3 73.8-39 92.9-22.7 17.6-51.7 22.5-75.5 21.2 23.1-54.8 36.8-119.1 37.7-188 13.1-2.9 37.7-5.8 54.9 6.8 15.5 11.3 22.8 33.9 21.9 67.1" })] }));

const SvgRedo = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M763 285.8 427.6 8.6 455 206.9S37.1 141.1 37.1 463.5c-4.9 274.2 149.7 317 599.3 327.8 4 .1-.1-130.9 6.8-150.4-324.5-1.1-465.6-1.1-466.8-175.7-1.3-185.6 278.6-142 278.6-142l-41 215.5z", className: "redo_svg__st0" })] }));

const SvgRegenerateChat = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 20 20", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m14.5 2.9 1-2.2-.3-.4-5.6 2.3v.6c-.1 0 2.2 5.3 2.2 5.3h.7c0-.1.7-2.2.7-2.2 1.4 1.1 2.8 2.8 2.8 4.5 0 3.1-2.5 5.7-5.7 5.7S4.6 14 4.6 10.8 5.6 7 7.2 6l-.4-3.5c-3.2 1.4-5.5 4.6-5.5 8.3s4 8.9 8.9 8.9 8.9-4 8.9-8.9-1.9-6.4-4.7-7.9Z", className: "regenerateChat_svg__cls-1" })] }));

const SvgRightHand = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M544.4 8.6 572.8 36l-51.2 106.5-54.3 89.2 6.4 5.1 79.7-81.6 87.4-107 43.2 9.2 13.4 46.5-87.7 110.6-71.5 76 6.7 7.4 90.8-55.9 100.8-81.6 36.4 17.7-5.1 40.1-109.6 104-62.2 37.4-4.5 9.2 76-32 62.6-36.3 26.2 14.6.3 33.9-51.1 51-97.5 51.1-110.8 86.3L402 583l-31.2 39.1 1.7 39-71.4 130.2-95.3-41.5-113.5-87-65.4-92.1 54.6-55.3 59-47.6 18.8.2 32.5-43.5 13.3-6.2-24.9-116.6L196 192.2l1.6-89.1 55.3 12.5L281 178l10.9 65.5 24.7 32.3 36.9-35.8 43.8-47.1 64.6-91.6 35.6-78.9z", className: "rightHand_svg__st0" })] }));

const SvgRoom = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m53.4 791.4 92.8-679.7-29.3-103 569.7 20.6-27.8 108.1 87.9 572.5L575.8 727l-43.9-512.4-206.2 5.2-35.5 552.4z", className: "room_svg__st0" })] }));

const SvgSaveEquipment = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m770.1 656.4-171.9 133L423.6 662l113.6-2.8-8.3-257.8 135.8-2.8-11.1 257.8zM516.6 187.9l6.7 133.1h-60.9v241.2L390.3 576l-108.1 2.8-199.6-36 19.4-58.2 16.6-94.2 22.2-191.1-69.3-.3L29.9 88.2l141.4-77.6h119.2l16.6 169.1h45.7L368 10.6l111 2.7 144.2 78.1L597.5 199z", className: "saveEquipment_svg__st0" })] }));

const SvgScene = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m378 126.1-112-74-97.1 12.7-106.3 50.8L8.1 223.4l152.2-36.6 154.3 36.6-109.3 24.4L99 312.7 86.4 426.3l50.7 146 29.6 28.4 33.8-101.4L285 385.7l114.1-82.4 25.4 110.8v138.7l-16.9 76.3-71.8 105.5-42.3 56.8 292.1-2.1-13.2-124.6-16.9-169.5-38-117.6-38-97.4 106.2 36.2 66.8 51.4 46.6 87.1 19.1 68.7 43.2-119.1L727.6 267l-47.7-82.5-154 10.5 29.6-40.6L679 135.9l58.9 33 54 42.4-24.5-113.1-103.1-70.7L536.7 8.6 428.7 57z", className: "scene_svg__st0" })] }));

const SvgSend = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M72 482.9V276.3L368 332 336.3 93.6l389.7 322-405.6 289.8L368 443.2z", className: "send_svg__st0" })] }));

const SvgSendMessage = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlSpace: "preserve", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M714 86h-33.6L86 332.7l213.1 100.9 246.7-179.4-179.4 257.9L478.5 714z", className: "sendMessage_svg__st0" })] }));

const SvgSettings = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m614.4 347.8 102.2 52-18.1 116-118.2 10-34.1 36 4 120-82.2 42-76-101.7-54.1-14.4-106.2 68-82.1-63.9 60.1-116-16-43.2-118.2-62.8 22.1-110 122.2-6 26.1-30-16.1-98 105.3-62.1 67 96 64 8 96.3-64.2 96.8 70.2-60.7 112 15.9 41.9Zm-126.5-1.1-62.5-37.4-67.8 15.6-43.4 57.2 12.2 55.5 62.5 46.8 76.4-20.8 34.7-60.1-12.2-56.9Z", className: "settings_svg__cls-1" })] }));

const SvgShare = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M579.4 514c-25.9 0-49.7-8.9-68.7-23.7l-3.1 3.1L333 600.9c0 2.1.3 4 .3 6.1 0 69.7-43.6 113.5-112.7 113.5S107.9 676.7 107.9 607s50.5-113.5 112.7-113.5 47.9 8.3 66.6 22.1l179.5-104.7s.4 3.6 0 0c-1.1-10.7 2-14.3 2.9-16.2L285.7 286.8c-18.4 13.1-40.8 20.9-65.1 20.9-62.3 0-112.7-43.9-112.7-113.5S158.4 80.7 220.6 80.7s112.7 50.8 112.7 113.5-.2 5.7-.4 8.6l184.6 109.5c10.4-15.8 35-25.2 61.8-25.2 69.2 0 112.7 50.8 112.7 113.5 0 69.8-43.4 113.6-112.6 113.6Z", className: "share_svg__cls-1" })] }));

const SvgShirt = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m291.7 94.8 39.7 37.7 68.6 17.9 61.6-17.9L506.4 99l212.7 49.4 1 153.8-130.2-23.8 5 73.4L628.4 703l-458.7 2 34.6-365.1 3-61.5-127.2 26.8V145.4l211.7-50.7Z", className: "shirt_svg__cls-1" })] }));

const SvgSkills = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m374.3 529.7-57.6 32.9-20.4 5.5-30.9-6.4-64.1-32.1 1 33.9-9.1 35.7-14.6 6.4 117.8 38.5 106.3-43.9-22-23.8z", className: "skills_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "m197.6 358.7-38.4 49.5 14.6 32.9 24.7 49.3 33.8 33 45.7 23.8 18.1 4.5 7.5-1.7 46.6-27.2 31.1-29.6 18.3-35.7 24.7-60.3-27.4-49.4-24.7-27.4-33.8 21.2-89.6 44.8 16.5-65.1z", className: "skills_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "M723.4 238.3V120.9L606 135v30.6L480.9 265.7l-1.6-7.6-16.5-32.9-25.6-44.9-36.5-33.8-53.1-25-68.6-.6-59.4 3.7-58.6 41.1-47.6 49.4-21.1 59.4-9.1 35.7 16.5 72-6.9 52.4 24.4-11.9 29.3 59.4 21.9-1c1.5-1.1-30.2-74.1-30.2-74.1l54.3-70.3 86.5-41.1-1.8 38.4-6.5 24.8 56.7-31.9 42-33.2 43.9 43 32.9 62.1-27.2 68.9-.3.6 187.2 122.1v39.4l117.4 14.1V526.5l-117.4 14.1v26.7L447.3 463.9l26.2-59.7 18.5 3.7-1.8-14.1 115.7-3.6v50.7l117.4-14v-89.2l-117.4-14v46.8l-118.1 3.7-.7-5.7 4-52.1-5.9-29 120.7-96.6V224l117.4 14.1Z", className: "skills_svg__cls-1" })] }));

const SvgSkinColor = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m675.2 614.9-35.1 17.5-52.6-8.8-26.3 26.3 26.3 43.8L570 720h-52.6L456 693.7l-61.3-61.3-8.7-70.1 8.8-78.9 43.8-61.3 43.8-26.3L535 387l78.9 8.8 61.4 43.8 35 61.4v70.1zM456.1 492.2c-19.4 0-35.1 15.7-35.1 35.1s15.7 35.1 35.1 35.1 35.1-15.7 35.1-35.1-15.7-35.1-35.1-35.1m87.7-70.1c-19.4 0-35 15.7-35 35s15.7 35.1 35 35.1 35.1-15.7 35.1-35.1c0-19.3-15.8-35-35.1-35m96.4 52.6c-19.4 0-35.1 15.7-35.1 35.1s15.7 35.1 35.1 35.1 35.1-15.7 35.1-35.1-15.8-35.1-35.1-35.1m-32.9-180.1 19.3 10.8.2 25-18.7 16.5-77.1-8.5-16.7 2.8 46.8-19.7 46.1-26.8Zm-52.9 12-49.9 31.5.5 4.5-41.9 7-56.5 34-56.6 79.3-11.3 102v.6L291.6 656l-70.1-30.5-83.6-64.2-48.2-67.8 40.2-40.8 43.4-35.1 13.8.2 26.5-32 7.3-4.5-13.3-85.7 6.6-80.5 1.2-65.6 40.7 9.2 20.7 45.9 8.1 48.2 18.2 23.7 27.2-26.3 32.3-34.7 47.5-67.4L436.2 90l28.2-10.1 29.6 20.2-39.9 78.3-39.9 65.7 4.8 3.8 58.7-60.1 64.2-78.8 31.8 11 9.9 29.9-64.5 77.1-52.6 60.2 4.9 5.5 66.8-41.2 74.2-60.1 26.8 13-6.5 29.5-78 72.6Z", className: "skinColor_svg__cls-1" })] }));

const SvgSleep = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 1200 1200", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M282.1 840.1c3.8 9.7 13.1 15.9 23.6 15.9h153.6c14.1 0 25.6-11.5 25.6-25.6s-11.5-25.6-25.6-25.6h-91.9L477.2 695c7.4-7.4 9.5-18.4 5.6-27.9-3.8-9.7-13.1-15.9-23.5-15.9H305.7c-14.1 0-25.6 11.5-25.6 25.6s11.5 25.6 25.6 25.6h91.9L287.8 812.2c-7.4 7.4-9.7 18.4-5.6 27.9ZM538.1 635.3c3.8 9.7 13.1 15.9 23.6 15.9h128c14.1 0 25.6-11.5 25.6-25.6S703.8 600 689.7 600h-66.3l84.2-84.2c7.4-7.4 9.5-18.2 5.6-27.9-3.8-9.7-13.1-15.9-23.6-15.9h-128c-14.1 0-25.6 11.5-25.6 25.6s11.5 25.6 25.6 25.6h66.3l-84.2 84.2c-7.4 7.4-9.7 18.4-5.6 27.9M920 472c0-14.1-11.5-25.6-25.6-25.6h-40.7l58.6-58.6c7.4-7.4 9.5-18.2 5.6-27.9-3.8-9.7-13.1-15.9-23.6-15.9H791.9c-14.1 0-25.6 11.5-25.6 25.6s11.5 25.6 25.6 25.6h40.7L774 453.8c-7.4 7.4-9.5 18.2-5.6 27.9 3.8 9.7 13.1 15.9 23.5 15.9h102.4c14.1 0 25.6-11.5 25.6-25.6Z", className: "sleep_svg__cls-1" })] }));

const SvgSpeaker = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m687.3 291.3-29.8-65.5-59.5-56.6-38.7 29.8 32.7 26.8 35.7 44.7 20.8 59.5 11.9 71.4-14.9 77.4-32.7 65.5-50.6 50.6 29.8 38.7 50.6-44.7 35.7-59.5 41.7-92.3v-71.4zM598 437.2v-77.4l-29.8-71.4-41.7-41.7-26.8 35.7 29.8 41.7 20.8 44.7-8.9 89.3-41.7 65.5 23.8 32.7 20.8-14.9 38.7-44.7 14.9-59.5ZM330.1 208l-77.4 53.6-80.4 17.9-86.3 8.9v104.2l-6 92.3 6 38.7 86.3 6h71.4l80.4 68.5s83.3 71.4 89.3 68.5c6 0 38.7 23.8 38.7 23.8V443.3l3-178.6v-155l-35.7 35.7-89.3 62.5Z", className: "speaker_svg__cls-1" })] }));

const SvgSpeechToText = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M606.2 565.9v-66.4H720v66.4zM288.6 717.6 189 328.1l-38.7 105.1H80.1L198.5 82.4l99.5 403 37.9-118.5h384v66.4H384.6l-96.1 284.4Zm132.7-483.5H720v66.4H421.3zm109 331.8H421.2v-66.4h109.1z", className: "speechToText_svg__cls-1" })] }));

const SvgSpirit = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m131.2 720 41.5-91.5-8.8-45.6-52.2-120-21.4-87.8 78.7-54.7 138.6-74.2 218.3-97.5L709.6 80l-11.2 149-167.2 85.4-178.4 93.4 10.7 31.9 174.4-81.8 147.7-65.2-47 160.8-76.8 36.5L383 570.1l3.9 26.5 136.3-26.2-89.9 124-44.4 3.2-127 7.8-64.6 4.2-66.2 10.4Z", className: "spirit_svg__cls-1" })] }));

const SvgTerminalWindow = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m80.1 173.4 19.8 399.7 2.7 53.6H700l20.1-453.2h-640Zm573.4 408H148.6l-2.3-42.9-16.7-320h540.9z", className: "terminalWindow_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "M377.6 381.4c-43.9-29-87.7-58.1-131.6-87l3.4 64.8 71.7 44.5-67.2 42.1 3.1 59.9 120.5-79.8v-44.5ZM433.4 470.5h120.5v35.2H433.4z", className: "terminalWindow_svg__cls-1" })] }));

const SvgTiling = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M707.2 720H540.8c-7 0-12.8-5.7-12.8-12.8V540.8c0-7 5.7-12.8 12.8-12.8h166.4c7 0 12.8 5.7 12.8 12.8v166.4c0 7-5.8 12.8-12.8 12.8m0-224H540.8c-7 0-12.8-5.7-12.8-12.8V316.8c0-7 5.7-12.8 12.8-12.8h166.4c7 0 12.8 5.7 12.8 12.8v166.4c0 7.1-5.8 12.8-12.8 12.8M483.1 720H316.7c-7 0-12.8-5.7-12.8-12.8V540.8c0-7 5.7-12.8 12.8-12.8h166.4c7 0 12.8 5.7 12.8 12.8v166.4c0 7-5.7 12.8-12.8 12.8m0-224H316.7c-7 0-12.8-5.7-12.8-12.8V316.8c0-7 5.7-12.8 12.8-12.8h166.4c7 0 12.8 5.7 12.8 12.8v166.4c0 7.1-5.7 12.8-12.8 12.8m0-224H316.7c-7 0-12.8-5.7-12.8-12.8V92.8c0-7 5.7-12.8 12.8-12.8h166.4c7 0 12.8 5.7 12.8 12.8v166.4c0 7-5.7 12.8-12.8 12.8M259.2 496H92.8c-7 0-12.8-5.7-12.8-12.8V316.8c0-7 5.7-12.8 12.8-12.8h166.4c7 0 12.8 5.7 12.8 12.8v166.4c0 7.1-5.8 12.8-12.8 12.8m0-224H92.8c-7 0-12.8-5.7-12.8-12.8V92.8c0-7 5.7-12.8 12.8-12.8h166.4c7 0 12.8 5.7 12.8 12.8v166.4c0 7-5.8 12.8-12.8 12.8", className: "tiling_svg__cls-1" })] }));

const SvgTrash = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M164.8 249.3 142.9 200l131.3-32.7-5.6-54.6L509.4 80l5.6 54.6 140.2-27.4 2 65.7-492.3 76.4Zm388.4 470.8H238.3l-40.8-443.3 399.2 10.8z", className: "trash_svg__cls-1" })] }));

const SvgTwitch = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsxs("g", { "data-name": "Layer 1-2", children: [jsxRuntimeExports.jsx("path", { d: "M240 80.5 125.7 194.8v411.4h137.1v114.3l114.3-114.3h91.5l205.8-205.8V80.5zm388.6 297.2-91.5 91.4h-91.4l-80 80v-80H262.9V126.2h365.7z", className: "twitch_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "M514.3 206.2H560v137.1h-45.7zM388.5 206.2h45.7v137.1h-45.7z", className: "twitch_svg__cls-1" })] })] }));

const SvgUndo = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M100.8 306.6 375 80l-22.3 162.1s347.7-53.8 346.6 209.8c.5 224.2-127.3 259.2-494.9 268-3.3 0 0-107-5.6-123 265.3-.9 380.7-.9 381.8-143.7 1.1-151.8-227.8-116.1-227.8-116.1l33.5 176.2z", className: "undo_svg__cls-1" })] }));

const SvgUnlock = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m612.6 311.5-29.7-6.9v-41.8c0-100.8-82-182.9-182.9-182.9S243.7 136.3 222.9 217c-3.2 12.2 4.2 24.7 16.4 27.8 12.3 3.1 24.7-4.3 27.8-16.5 15.6-60.5 70.2-102.8 132.8-102.8S537 187 537 262.6v31.3l-123.9-28.6c-8.7-2.1-17.8-2.1-26.5 0l-199.3 45.9c-27 6.2-45.9 29.9-45.9 57.6v245.7c0 27.7 19 51.4 45.9 57.6L386.6 718c4.3 1.1 8.7 1.6 13.3 1.6s8.9-.5 13.3-1.6l199.3-45.9c27-6.2 45.9-29.9 45.9-57.6V368.8c0-27.7-19-51.4-45.9-57.6ZM445.7 514.3h-91.4c-12.6 0-22.9-10.3-22.9-22.9s10.3-22.9 22.9-22.9h91.4c12.6 0 22.9 10.3 22.9 22.9s-10.3 22.9-22.9 22.9", className: "unlock_svg__cls-1" })] }));

const SvgUpdate = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M720 377.8H483.3l83.5-83.5c-35.6-65.6-104.9-110.2-184.9-110.2-116.3 0-210.6 94.3-210.6 210.6s94.3 224.2 210.6 224.2 163.8-68 195.1-145.2c25.2 17.2 51.1 34.9 76.4 52.3-48.9 100.9-151.9 170.6-271.5 170.6S80 561.5 80 394.8s135.2-290.5 301.9-290.5S579.1 146.6 633.1 228l86.9-69.3z", className: "update_svg__cls-1" })] }));

const SvgUpload = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M461.7 541.8H315.8L355 332.7l-168.3 22.4L414.2 80l204.6 286.5-185.2-33.7 28 209.1ZM186.8 632l404-19.2v-106l112.3-5.6-5.6 218.9-589.1-16.8v-.4l-5.6.4s-3.9-147.7-5.6-157.1C95.5 539.5 187 535 187 535v97.2Z", className: "upload_svg__cls-1" })] }));

const SvgUpstreet = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M512.4 286.6h-69.7c-36.3 36.3-71.7 71.6-106.9 106.7h41.4l31.6 31.6c-.8 13.7-.5 28-.6 42.4 1.6 0 2-1 2.6-1.6 34.2-34.1 68.3-68.3 102.5-102.4 1.6-1.6 2.2-3.2 2.2-5.4v-65.6c0-2.5-.7-4.4-3.2-5.7Z", className: "upstreet_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "M377 422.6h-70.7l-94.3 94c.3 13.7-.3 27.7-.5 41l33.1 33.1c13.5-.4 27.5-.8 41.1-.6l93.9-94.2v-70.8c-.8-1.1-1.5-2-2.6-2.5", className: "upstreet_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "M717.5 80.5H136.6L80 137.2v113.1l58 58h165.7L120.3 491.7v150.7l17.6 17.7 2.5 2.4 17.6 17.7h150.7l183.4-183.5v165.7l58 58h113.2l56.6-56.6V82.9l-2.5-2.4zm-73.6 616h-76c-17.2-17.2-34.2-34.1-51.4-51.4-.6-54.7.4-109.8.4-165.3 3.8-3.6 7.8-7.3 11.7-10.9-6.6-6.5-12.9-12.7-18.9-18.7-69.8 69.7-139.7 139.5-209.1 208.9-42.2.6-83.5-.3-124.5-.2-11.1-11.1-21.8-21.9-32.8-32.8V502.9c70-70 139.7-139.9 209.3-209.5l-18.9-18.9c-3.4 3.7-7.1 7.8-9.9 11H157c-16.8-16.9-33.7-33.7-50.9-51v-77.1l52.2-52.2h536.2c1.3.4 1.9 1.2 2.2 1.7 1.3 179.1 0 358.1.8 536.4-18 18-35.5 35.5-53.5 53.4Z", className: "upstreet_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "M639.4 181.4v-12.6c0-2.6-.6-4.7-3-5.9H196.5l-28.6 28.6c-.8 5.1-.4 10.9-.3 15.9 8.5 8.4 16.3 16.3 24.6 24.5 70.3-1.2 141.2 0 212.1.1 8.9 8.9 17.7 17.6 26.3 26.4 2 2 4 2.9 6.9 2.8h69c1.6 0 3.2-.2 4.4.6l30 30c-.6 25.4.7 51.4.5 77.8 9.7 9.7 19.4 19.3 29 28.9v212c8.1 8.1 16.1 16 24.4 24.3h14.3c1.2 0 2.5-.3 3.4-1.2 8.9-9 17.9-18 27-27.1v-425Z", className: "upstreet_svg__cls-1" })] }));

const SvgUserSettings = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m348.4 638 7.1-45.8-40.3-20.5-6.3-16.6 24-44.2-38.2-27.7-38 25.3-25.2-3.1-26.5-37.9-41.6 24.5 6.3 38.7-10.3 11.8-48.2 2.4-8.7 43.4 46.7 24.9 6.3 17-23.7 45.8 32.4 25.2 41.9-26.9 21.4 5.7 29.9 40.1 32.5-16.6-1.6-47.3 13.5-14.2 46.7-3.9Zm-92-20.5-30.2 8.2-24.7-18.5-4.8-21.9 17.1-22.6 26.7-6.2 24.7 14.7 4.8 22.5-13.7 23.7Z", className: "userSettings_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "m540.6 372-28.2 19.1-6.8-57.3-11.2-69.6-32.6 56.4-51.7 44.7-35.5 39.2-2.7-83.9-50.5 46.9-46 35.9-19.1 8.9v-74L218 414.2l33.7 48.3 44.1-29.3 90.5 65.7-26.7 49.2 41.3 21-16.7 107.1-53.8 4.6 24.7 17.9 43.8 20.2 5.6 1.1 40.4-21.3 95.6-59.5 29.1-25.8 13.5-79.7 16.8-88.7-32.5-108.9z", className: "userSettings_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "m702.2 320.6-34.8-92.4-44.9-57.3-7.9-11.2-18-15.7-11.9-6.1-8.3 5.6-67.9-45-11.8-6.1-91-12.4-86.4 9-47 16.8-.2-1.1-77.5 49.4-52.7 60.6-26.2 74.1-24.4 70.8-1 126.9 28.1-15.6 53.5-31.5 117.2-225.1 1 1.6-1.2 140.3 74.7-80.8 57.8-87.6-18 150.3 73-106.5 38.2-79.7L537 325.8l28.1-89.8.4-1.3 40 102.4 38.2 122.4-12.4 64-19 59.5 56.1-28.1 1.1-81.9 40.6 18V376.4z", className: "userSettings_svg__cls-1" })] }));

const SvgUsers = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m486.9 712.6-1.5 7.4H226.5l.5-1.8-13.2-9.2-23.2-55.1-110.9-97.4L127.8 439l71.1-108.4 104.3-31.2 5-23.9-19.1-31.6-18.9-91.3 26.5-51.4L336 80.1l44.9 3.1 42.4 23.5 22.4 47.8-24.4 91.7-20.3 31.3 1.7 22L507 328.9l76.1 116.9 57.8 110.8-117.4 95.5-36.4 60.6ZM218.7 472l-52.9 70.5 46.4 41.5 28.2 46.4 5 28 14.9-54.1-41.5-132.2Zm269.9 0-38.1 130.3 10.1 57.6 3.2 3.2.6.4 3.3-26.9 17.6-26.2 57.9-81.6-54.6-56.9Z", className: "users_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "m639.7 556.5-57.8-110.8-66-101.3 8.3 13.6-4 19.4-84.7 25.5-40.6 135 14.4 109.2 26.2 28.4 12.1 35.6 10.7 7.5-.4 1.5h26.5l1.5-7.4 36.4-60.6 117.3-95.5Zm-155.5 54.1-17.6 26.2-3.3 26.9-.6-.4-3.2-3.2-10.1-57.6 38.1-130.3 54.6 56.9-57.9 81.6Z", className: "users_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "m685.4 401.4-84.7-23.9-1.3-18 16.5-25.5 19.8-74.7-18.2-38.8-34.4-19.2-36.5-2.5-31.9 17.1-21.5 41.9 7.1 34.3 14.6 4.1 12.3 3.5 6.9 10.6 76.1 117 .9 1.3.8 1.4 57.9 110.9 12.7 24.5-21.4 17.4-112.8 91.7-27.4 45.5h147.2l1.2-6 9.4-38.7 32-28.2 9.7-94.9z", className: "users_svg__cls-1" })] }));

const SvgVideo = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M113.3 636.6h584.5L720 163.5H80zm96.9-37.1h-73.5l11.1-53H199zm226.7 0h-73.6l11.1-53H426l11.1 53.1h-.2ZM590 196.1h73.6l-11.1 53.1h-51.4zm22.2 350.6h40.1l11.1 52.7h-73.6l11.1-52.7h11.2ZM485.9 196.1h51.2l11.1 53h-73.4zm-11.1 350.5h73.4l-11.1 53h-51.3l-11.1-53ZM362.9 196.1H437l-11.1 53H374zM352 325.9l96 55.6c17.7 10.2 17.7 26.9 0 37.1l-96 55.6c-17.7 10.2-32.1 1.8-32.1-18.5V344.5c-.2-20.2 14.5-28.6 32.1-18.5Zm-92.8-129.8h51l11.1 53h-73.2zm-11.1 350.5h73.2l-11.1 53h-51l-11.1-53.1ZM136.5 196.1h73.7l-11.1 53.1h-51.5z", className: "video_svg__cls-1" })] }));

const SvgView = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m685.2 315.8-65.3-76.6-99.1-61.9-105.5-16.5-87.1 8.2-74 28.9-100.1 74.4-43.5 49.6-30.5 74.6 13.1 32.6 47.9 70.2 82.7 74.3 108.9 41.3 95.8 8.2 92.4-20.7 94.8-61.9 39.2-37.1 43.5-61.9 21.8-45.1-34.8-80.6Zm-148 154.6-95.8 70.2-21.8 4.1-74-8.2-65.3-41.3-39.2-58.4 4.3-81.9 74-78.9 74-36.8 74 12.4 61.7 41.3 25.3 63.3 4.3 60.6-21.7 53.7Z", className: "view_svg__cls-1" }), jsxRuntimeExports.jsx("path", { d: "m428.3 321.8-52.3-4.2-39.5 29.9-11.1 44.5 17.8 40.6 50.6 24.6 48.7-9.9 33.7-34.7 4.4-33.1-21.8-41.2z", className: "view_svg__cls-1" })] }));

const SvgVitality = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "m449.4 713.3-143.1-11.6L85.8 441 80 345.3 335.4 86.7l147 3.4 237.7 270.2v106.9L449.5 713.3Zm108.4-368-46.4-99.4-52.3 20.7 27.1 101.3-39 26.3-17.1-65.7-21.3-82.6-17.4-65.6-56.1 13.1 7.7 73.2 15.5 101.3 9.6 58.2-38.6 20.6-19.4-63.8-23.2-71.3-36.7 7.6L225 458l83.2 86.3 84.2 75 116.4-93.8 74.2-73.2-25.3-106.9Z", className: "vitality_svg__cls-1" })] }));

const SvgVoice = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M680.3 473.9c-22 0-39.7-15.6-39.7-34.8v-78c0-19.3 17.8-34.8 39.7-34.8s39.7 15.6 39.7 34.8v78c0 19.2-17.9 34.8-39.7 34.8m-140.1 82c-22 0-39.7-15.6-39.7-34.8V279c0-19.3 17.8-34.8 39.7-34.8s39.7 15.6 39.7 34.8v242c0 19.3-17.9 34.9-39.7 34.9M400 720.1c-22 0-39.7-15.6-39.7-34.8V114.8c0-19.3 17.8-34.8 39.7-34.8s39.7 15.6 39.7 34.8V685c0 19.3-17.9 34.9-39.7 34.9ZM259.8 555.9c-22 0-39.7-15.6-39.7-34.8V279c0-19.3 17.8-34.8 39.7-34.8s39.7 15.6 39.7 34.8v242c0 19.3-17.9 34.9-39.7 34.9m-140.1-82c-22 0-39.7-15.6-39.7-34.8v-78c0-19.3 17.8-34.8 39.7-34.8s39.7 15.6 39.7 34.8v78c0 19.2-17.9 34.8-39.7 34.8", className: "voice_svg__cls-1" })] }));

const SvgVr = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M720 574.8H619.8L569 472.5h-33.5v102.3h-97.9V225.2h209.5l54.7 54.9v124.8l-45.5 45L720 574.7ZM603.8 320.2l-9.2-10h-59.2v77.3h59.2l9.2-10v-57.4ZM186 574.8 80 225.2h100.3l61.5 227.1h2.3l61.5-227.1h100.2L303.2 574.6H186Z", className: "vr_svg__cls-1" })] }));

const SvgWeb = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M519.4 185.2c-2.3-5-4.8-10-7.2-14.7-15.2-29-32.8-51.7-52.2-67.4-16.7-13.4-34.1-21.1-51.8-23h-1.1v113h.2c37.6-.4 75-2.8 112.1-7.8ZM529.1 207.9c-40.3 5.6-80.9 8.5-121.7 8.8V388h154.3c-1.3-65.8-12.6-128-32.6-180.1M280.7 185.3c34 4.4 68.3 7 102.8 7.6V81.3c-14.9 3.1-29.5 10.3-43.4 21.7-19.4 15.7-36.9 38.4-52.1 67.4-2.6 4.9-4.9 9.7-7.3 14.8ZM246.9 204.3c-28.3-4.7-56.4-10.7-84-18-23.5 26.5-42.3 56.2-56.1 89-15.1 35.8-23.3 73.8-24.7 112.8h132.5c1.2-66.6 12.4-130 32.2-183.8ZM238.6 388.1h144.9V216.7c-37.7-.6-75.2-3.5-112.4-8.7-20 52.1-31.2 114.4-32.5 180.1M522.8 607.3c-37.9-5.2-76.4-7.9-115.6-8.3v121h1.1c17.7-1.8 35.1-9.6 51.7-23 19.4-15.7 36.9-38.4 52.2-67.4 3.7-7.2 7.2-14.7 10.6-22.2ZM555.7 588.2c29.3 5 58.2 11.5 86.5 19.4 21-24.9 38.1-52.6 50.8-82.9 15.1-35.8 23.3-73.8 24.7-112.9H585.3c-1.1 63.6-11.4 124.2-29.7 176.4ZM214.7 411.8H82.2c1.4 39 9.7 77 24.8 112.9 12.7 30.3 29.8 58 50.8 82.9 28.3-7.9 57.2-14.4 86.5-19.4-18.3-52.2-28.5-112.8-29.7-176.4ZM238.6 411.8c1.1 62.6 11.5 122.2 29.7 172.7 37.8-5.5 76.3-8.5 115.2-9.3V411.8zM266.7 640.6c-4.9-9.4-9.5-19.3-13.8-29.6-26 4.3-51.7 9.8-77.1 16.4 29 29 62.7 51.8 100.2 67.8 1.1.5 2.2.9 3.3 1.4 12.4 5 25.2 9.4 38.4 12.9-18.8-17.1-36.1-40.3-51.1-68.9ZM533.2 640.6c-15 28.7-32.2 51.8-51.1 68.9 13.1-3.4 26-7.8 38.3-12.8 1.1-.5 2.2-.9 3.3-1.4 37.5-16.1 71.2-38.8 100.3-67.9-25.3-6.6-51-12.1-77.1-16.4-4.2 10.2-8.8 20.1-13.8 29.6ZM256.1 181.7c3.4-7.6 6.9-15.1 10.7-22.2 15-28.7 32.2-51.8 51.1-68.9-13.2 3.5-26.3 7.9-38.8 13-1 .4-1.9.8-2.8 1.1-35 14.9-66.6 35.7-94.2 61.9 24.4 6.1 49.1 11.1 74.1 15.1ZM407.3 575.1c42.1.4 83.7 3.4 124.6 9.4 18.3-50.5 28.6-109.9 29.8-172.7H407.3zM287.9 629.4c15.2 29 32.7 51.8 52.1 67.5 14.1 11.4 28.6 18.6 43.4 21.7V599c-35.8.6-71.2 3.4-106.1 8.2 3.4 7.7 6.9 15.1 10.6 22.2M533.4 159.4c3.8 7.2 7.3 14.6 10.7 22.2 25-4 49.7-9 74-15.1-27.6-26.2-59.2-47-94.1-61.9-1-.4-1.9-.8-2.8-1.2-12.5-5.1-25.4-9.5-38.8-13 18.8 17.2 36.1 40.3 51.1 69ZM585.4 388.2h132.4c-1.4-39-9.7-77-24.8-112.9-13.7-32.8-32.5-62.6-56-88.9q-41.4 10.95-84 18c19.9 53.8 31.1 117.1 32.3 183.8Z", className: "web_svg__cls-1" })] }));

const SvgXp = ({ title, titleId, ...props }) => (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 800 800", width: "1em", height: "1em", fill: "currentColor", "aria-labelledby": titleId, ...props, children: [title ? jsxRuntimeExports.jsx("title", { id: titleId, children: title }) : null, jsxRuntimeExports.jsx("path", { d: "M663.3 526H542.9v107.3H441.4V166.6h222l56.7 73.3v196.7L663.4 526Zm-44.9-232.7L609 280h-66.1v116.7H609l9.4-13.3v-90ZM309.2 633.4l-61.4-140.1h-2.4L184 633.4H80.2l103.9-236.7-96.9-230.1h103.9l54.3 130h2.4l54.3-130H406l-96.9 230L413 633.3H309.1Z", className: "xp_svg__cls-1" })] }));

var Icons = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Accessories: SvgAccessories,
  AddAvatar: SvgAddAvatar,
  AddUser: SvgAddUser,
  Ai: SvgAi,
  Archive: SvgArchive,
  Attack: SvgAttack,
  Audio: SvgAudio,
  AudioOff: SvgAudioOff,
  Auto: SvgAuto,
  Avatar: SvgAvatar,
  BackArrow: SvgBackArrow,
  Backpack: SvgBackpack,
  Bin: SvgBin,
  BodyAlert: SvgBodyAlert,
  BodyAnger: SvgBodyAnger,
  BodyEmbarrassed: SvgBodyEmbarrassed,
  BodyHeadnod: SvgBodyHeadnod,
  BodyHeadshake: SvgBodyHeadshake,
  BodySad: SvgBodySad,
  BodyVictory: SvgBodyVictory,
  BrowserWindow: SvgBrowserWindow,
  Brush: SvgBrush,
  CaretDown: SvgCaretDown,
  CaretLeft: SvgCaretLeft,
  CaretRight: SvgCaretRight,
  CaretUp: SvgCaretUp,
  Chat: SvgChat,
  Check: SvgCheck,
  Chest: SvgChest,
  ClassBeastPainter: SvgClassBeastPainter,
  ClassBruiser: SvgClassBruiser,
  ClassCustom: SvgClassCustom,
  ClassDropHunter: SvgClassDropHunter,
  ClassEngineer: SvgClassEngineer,
  ClassLiskWitch: SvgClassLiskWitch,
  ClassNeuralHacker: SvgClassNeuralHacker,
  Close: SvgClose,
  Controls: SvgControls,
  Crown: SvgCrown,
  DebugMode: SvgDebugMode,
  Defence: SvgDefence,
  DevTools: SvgDevTools,
  Dexterity: SvgDexterity,
  Dice: SvgDice,
  Discord: SvgDiscord,
  Download: SvgDownload,
  Edit: SvgEdit,
  Emotion: SvgEmotion,
  Erase: SvgErase,
  Etherium: SvgEtherium,
  ExportAvatar: SvgExportAvatar,
  Eyes: SvgEyes,
  FaceEmotionAnger: SvgFaceEmotionAnger,
  FaceEmotionFun: SvgFaceEmotionFun,
  FaceEmotionJoy: SvgFaceEmotionJoy,
  FaceEmotionSorrow: SvgFaceEmotionSorrow,
  FaceEmotionSurprise: SvgFaceEmotionSurprise,
  Faq: SvgFaq,
  Feet: SvgFeet,
  Filter: SvgFilter,
  Fork: SvgFork,
  GeneralSettings: SvgGeneralSettings,
  Graphics: SvgGraphics,
  Head: SvgHead,
  Headset: SvgHeadset,
  Health: SvgHealth,
  Hide: SvgHide,
  Home: SvgHome,
  Image: SvgImage,
  Info: SvgInfo,
  Intelligent: SvgIntelligent,
  Keyboard: SvgKeyboard,
  LeftHand: SvgLeftHand,
  Legs: SvgLegs,
  Limit: SvgLimit,
  Lock: SvgLock,
  Login: SvgLogin,
  Logout: SvgLogout,
  Luck: SvgLuck,
  Mana: SvgMana,
  Map: SvgMap,
  Match: SvgMatch,
  Menu: SvgMenu,
  Mic: SvgMic,
  MicOff: SvgMicOff,
  Mint: SvgMint,
  Minus: SvgMinus,
  ModuleStore: SvgModuleStore,
  Mount: SvgMount,
  Move: SvgMove,
  Muted: SvgMuted,
  Opensea: SvgOpensea,
  Paint: SvgPaint,
  PaintBucket: SvgPaintBucket,
  Party: SvgParty,
  Play: SvgPlay,
  Plus: SvgPlus,
  Polygon: SvgPolygon,
  Power: SvgPower,
  Press: SvgPress,
  Publish: SvgPublish,
  Rank: SvgRank,
  Redo: SvgRedo,
  RegenerateChat: SvgRegenerateChat,
  RightHand: SvgRightHand,
  Room: SvgRoom,
  SaveEquipment: SvgSaveEquipment,
  Scene: SvgScene,
  Send: SvgSend,
  SendMessage: SvgSendMessage,
  Settings: SvgSettings,
  Share: SvgShare,
  Shirt: SvgShirt,
  Skills: SvgSkills,
  SkinColor: SvgSkinColor,
  Sleep: SvgSleep,
  Speaker: SvgSpeaker,
  SpeechToText: SvgSpeechToText,
  Spirit: SvgSpirit,
  TerminalWindow: SvgTerminalWindow,
  Tiling: SvgTiling,
  Trash: SvgTrash,
  Twitch: SvgTwitch,
  Undo: SvgUndo,
  Unlock: SvgUnlock,
  Update: SvgUpdate,
  Upload: SvgUpload,
  Upstreet: SvgUpstreet,
  UserSettings: SvgUserSettings,
  Users: SvgUsers,
  Video: SvgVideo,
  View: SvgView,
  Vitality: SvgVitality,
  Voice: SvgVoice,
  Vr: SvgVr,
  Web: SvgWeb,
  Xp: SvgXp
});

const Icon = ({ icon = 'Chat', ...props }) => {
    const SVG = Icons[icon];
    return jsxRuntimeExports.jsx(SVG, { ...props });
};

var css_248z = ".IconButton-module_ucomIconButton__QxXuq {\n  background: transparent;\n  border: 2px solid transparent;\n  display: inline-block;\n  position: relative;\n  cursor: pointer;\n  color: #000000;\n  font-weight: 600;\n  padding: 0.66rem;\n  font-size: 1.42rem;\n  line-height: 0;\n}\n\n.IconButton-module_ucomIconButton__QxXuq.IconButton-module_small__1mgH- {\n  padding: 0.42rem;\n}\n\n.IconButton-module_ucomIconButton__QxXuq.IconButton-module_medium__-YYLU {\n  padding: 0.66rem;\n}\n\n.IconButton-module_ucomIconButton__QxXuq.IconButton-module_large__jZ1eK {\n  padding: 0.90rem;\n}\n\n.IconButton-module_ucomIconButton__QxXuq * {\n  z-index: 1;\n  position: relative;\n  stroke-width: 6rem;\n}\n\n.IconButton-module_ucomIconButton__QxXuq.IconButton-module_shadow__VZPOe {\n  box-shadow: -6px 6px 0px rgba(0, 0, 0, 1);\n}\n\n/* Primary/Default variant styles */\n\n.IconButton-module_ucomIconButton__QxXuq,\n.IconButton-module_ucomIconButton__QxXuq.IconButton-module_primary__VndZ0 {\n  background: #ffe477;\n  border: 2px solid #FFFFFF;\n  color: #000000;\n}\n\n.IconButton-module_ucomIconButton__QxXuq:hover,\n.IconButton-module_ucomIconButton__QxXuq.IconButton-module_primary__VndZ0:hover {\n  background: #FFFFFF;\n  border: 2px solid #FFFFFF;\n  color: #000000;\n}\n\n.IconButton-module_ucomIconButton__QxXuq.IconButton-module_active__M6a3z,\n.IconButton-module_ucomIconButton__QxXuq.IconButton-module_primary__VndZ0.IconButton-module_active__M6a3z {\n  background: #000000;\n  border: 2px solid #000000;\n  color: #FFFFFF;\n}\n\n.IconButton-module_ucomIconButton__QxXuq:disabled,\n.IconButton-module_ucomIconButton__QxXuq.IconButton-module_primary__VndZ0:disabled,\n.IconButton-module_ucomIconButton__QxXuq:disabled:hover,\n.IconButton-module_ucomIconButton__QxXuq.IconButton-module_primary__VndZ0:disabled:hover {\n  opacity: 0.7;\n  cursor: not-allowed;\n  background: #ffe477;\n  border: 2px solid #FFFFFF;\n  color: #000000;\n}\n\n/* Secondary variant styles */\n\n.IconButton-module_ucomIconButton__QxXuq.IconButton-module_secondary__bawOo {\n  background-color: #CFF2FE;\n  border: 2px solid #7CD5F3;\n  color: #000000;\n}\n\n.IconButton-module_ucomIconButton__QxXuq.IconButton-module_secondary__bawOo:hover {\n  background-color: #A2E3F9;\n  border: 2px solid #7CD5F3;\n  color: #000000;\n}\n\n.IconButton-module_ucomIconButton__QxXuq.IconButton-module_secondary__bawOo.IconButton-module_active__M6a3z {\n  background-color: #C96AAF;\n  border: 2px solid #7C2E70;\n  color: #FFFFFF;\n}\n\n/* Ghost variant styles */\n\n.IconButton-module_ucomIconButton__QxXuq.IconButton-module_ghost__Xo7aA {\n  background-color: transparent;\n  border: 2px solid transparent;\n  color: #777777;\n}\n\n.IconButton-module_ucomIconButton__QxXuq.IconButton-module_ghost__Xo7aA:hover {\n  color: #333333;\n}\n\n.IconButton-module_ucomIconButton__QxXuq.IconButton-module_ghost__Xo7aA.IconButton-module_active__M6a3z {\n  color: #000000;\n}\n\n.IconButton-module_iconShadow__iU4gn {\n  position: absolute;\n  color: #000000;\n  left: 50%;\n  top: 50%;\n  stroke: #000000;\n  stroke-width: 8rem !important;\n  z-index: 0;\n  -webkit-transform: translate(-50%, -50%);;\n  transform: translate(-50%, -50);\n}\n\n.IconButton-module_ucomIconButton__QxXuq:hover .IconButton-module_iconShadow__iU4gn {\n  display: none;\n}";
var styles = {"ucomIconButton":"IconButton-module_ucomIconButton__QxXuq","small":"IconButton-module_small__1mgH-","medium":"IconButton-module_medium__-YYLU","large":"IconButton-module_large__jZ1eK","shadow":"IconButton-module_shadow__VZPOe","primary":"IconButton-module_primary__VndZ0","active":"IconButton-module_active__M6a3z","secondary":"IconButton-module_secondary__bawOo","ghost":"IconButton-module_ghost__Xo7aA","iconShadow":"IconButton-module_iconShadow__iU4gn"};
styleInject(css_248z);

const IconButton = ({ icon = 'Accessories', size = 'small', variant = 'primary', shadow = false, active = false, disabled = false, ...props }) => {
    return (jsxRuntimeExports.jsx("button", { className: `${styles.ucomIconButton} 
         ${size && styles[size]}
         ${variant && styles[variant]}
         ${shadow && variant !== 'ghost' && !active && styles.shadow}
         ${active && styles.active}
         ${props.className}`, ...props, children: jsxRuntimeExports.jsx(Icon, { icon: icon }) }));
};

exports.Button = Button;
exports.Icon = Icon;
exports.IconButton = IconButton;
//# sourceMappingURL=index.js.map
