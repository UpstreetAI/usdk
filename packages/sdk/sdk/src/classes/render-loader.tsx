import React from 'react';
import { ReactNode, Suspense, useEffect, useMemo } from 'react';
import {
  makePromise,
} from '../util/util.mjs';

// for async render completion tracking
export class RenderLoader extends EventTarget {
  private userLoadPromises: Array<Promise<any>> = [];
  useLoad(p: Promise<any>) {
    // console.log('use load 1');
    // (p as any).error = new Error();
    this.userLoadPromises.push(p);
    p.finally(() => {
      const index = this.userLoadPromises.indexOf(p);
      this.userLoadPromises.splice(index, 1);
      // console.log('user load promise resolve', this.userLoadPromises.map((p) => (p as any).error.stack));
    });
    // console.log('use load 2:', this.userLoadPromises.length);
    this.dispatchEvent(new MessageEvent('loadadd', {
      data: null,
    }));
    // console.log('use load 3');
  }
  async waitForLoad() {
    // console.log('wait for load 1');
    if (this.userLoadPromises.length === 0) {
      // console.log('wait for load 2');
      await new Promise((accept) => {
        // console.log('wait for load 3');
        this.addEventListener('loadadd', () => {
          accept(null);
        }, {
          once: true,
        });
        // console.log('wait for load 4');
      });
    }
    // console.log('wait for load 5:', this.userLoadPromises.map((p) => (p as any).error.stack));
    await Promise.all(this.userLoadPromises);
    // console.log('wait for load 6');
  }
  clear() {
    // console.log('clear 1');
    this.userLoadPromises.length = 0;
    // console.log('clear 2');
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