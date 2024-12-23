import * as react_jsx_runtime from 'react/jsx-runtime';

declare function initNextTelemetry(): void;
declare function PostHogPageview(): JSX.Element;
declare function PHProvider({ children }: {
    children: React.ReactNode;
}): react_jsx_runtime.JSX.Element;

export { PHProvider, PostHogPageview, initNextTelemetry };
