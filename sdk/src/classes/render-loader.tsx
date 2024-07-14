import React from 'react';
import { ReactNode, Suspense, useEffect, useMemo } from 'react';
import {
  makePromise,
} from '../util/util.mjs';

// for async render completion tracking
export class RenderLoader extends EventTarget {
  private userLoadPromises: Array<Promise<any>> = [];
  useLoad(p: Promise<any>) {
    this.userLoadPromises.push(p);
    this.dispatchEvent(new Event('loadadd'));
  }
  async waitForLoad() {
    if (this.userLoadPromises.length === 0) {
      await new Promise((accept) => {
        this.addEventListener('loadadd', () => {
          accept(null);
        }, {
          once: true,
        });
      });
    }
    await Promise.all(this.userLoadPromises);
  }
  clear() {
    this.userLoadPromises.length = 0;
  }
}

//

const RenderLoaderFallback = ({
  renderLoader,
}: {
  renderLoader: RenderLoader;
}) => {
  useEffect(() => {
    const p = makePromise();
    renderLoader.useLoad(p);
    return () =>{
      p.resolve(null);
    };
  }, []);
  return null;
};
export const RenderLoaderProvider = ({
  renderLoader,
  children,
}: {
  renderLoader: RenderLoader;
  children?: ReactNode;
}) => {
  const p = makePromise();
  renderLoader.useLoad(p);
  useEffect(() => {
    p.resolve(null);
  });

  return (
    <Suspense fallback={
      <RenderLoaderFallback
        renderLoader={renderLoader}
      />
    }>
      {children}
    </Suspense>
  );
};