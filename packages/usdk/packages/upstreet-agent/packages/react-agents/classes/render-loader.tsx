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
      if (this.userLoadPromises.length === 0) {
        this.dispatchEvent(new MessageEvent('drain', {
          data: null,
        }));
      }
    });
    // console.log('use load 2:', this.userLoadPromises.length);
    // if (this.userLoadPromises.length === 1) {
    //   this.dispatchEvent(new MessageEvent('flood', {
    //     data: null,
    //   }));
    // }
    // console.log('use load 3');
  }
  async waitForLoad() {
    await new Promise((accept) => {
      this.addEventListener('drain', () => {
        accept(null);
      }, {
        once: true,
      });
    });
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