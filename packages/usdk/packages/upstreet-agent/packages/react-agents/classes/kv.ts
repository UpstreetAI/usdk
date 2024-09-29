import { useState, useEffect } from 'react';
import type {
  ActiveAgentObject,
} from '../types';

import {
  uint8ArrayToBase64,
  base64ToUint8Array,
} from '../util/util.mjs';
import { zbdecode, zbencode } from '../lib/zjs/encoding.mjs';

export function Kv<T>({
  agent,
  supabase,
  updateFn,
}: {
  agent: ActiveAgentObject;
  supabase: any;
  updateFn: () => any;
}) {
  const getFullKey = (key: string) => `${agent.id}:${key}`;

  const kvCache = new Map<string, any>();
  const setKvCache = (key: string, value: any) => {
    kvCache.set(key, value);
    updateFn();
  };
  const kvLoadPromises = new Map<string, Promise<any>>();
  const makeLoadPromise = async (key: string, defaultValue?: any) => {
    const fullKey = getFullKey(key);
    const result = await supabase
      .from('keys_values')
      .select('*')
      .eq('key', fullKey)
      .maybeSingle();
    const { error, data } = result;
    if (!error) {
      if (data) {
        const base64Data = data.data as string;
        const encodedData = base64ToUint8Array(base64Data);
        const value = zbdecode(encodedData);
        return value;
      } else {
        return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
      }
    } else {
      throw error;
    }
  };
  const ensureLoadPromise = (key: string, defaultValue?: any) => {
    let loadPromise = kvLoadPromises.get(key);
    if (!loadPromise) {
      loadPromise = makeLoadPromise(key, defaultValue);
      loadPromise.then((value: any) => {
        setKvCache(key, value);
      });
      kvLoadPromises.set(key, loadPromise);
    }
    return loadPromise;
  };

  const kv = {
    async get<T>(key: string, defaultValue?: T | (() => T)) {
      const loadPromise = ensureLoadPromise(key, defaultValue);
      return await loadPromise as T | undefined;
    },
    async set<T>(key: string, value: T | ((oldValue: T | undefined) => T)) {
      const fullKey = getFullKey(key);

      if (typeof value === 'function') {
        const oldValue = await kv.get<T>(fullKey);
        const newValue = (value as (oldValue: T | undefined) => T)(oldValue);
        value = newValue;
      }

      const newLoadPromise = Promise.resolve(value);
      const encodedData = zbencode(value);
      const base64Data = uint8ArrayToBase64(encodedData);

      kvLoadPromises.set(key, newLoadPromise);
      setKvCache(key, value);

      const result = await supabase
        .from('keys_values')
        .upsert({
          agent_id: agent.id,
          key: fullKey,
          value: base64Data,
        });
      const { error } = result;
      if (!error) {
        // nothing
      } else {
        console.error('error setting key value', error);
        throw new Error('error setting key value: ' + JSON.stringify(error));
      }
    },
    // note: key must be the same across calls, changing it is not allowed!
    use: <T>(key: string, defaultValue?: T | (() => T)) => {
      const ensureDefaultValue = (() => {
        let cachedDefaultValue: T | undefined;
        return () => {
          if (cachedDefaultValue === undefined) {
            cachedDefaultValue = typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue;
          }
          return cachedDefaultValue;
        };
      })();
      const [valueEpoch, setValueEpoch] = useState(0);
      // get the fresh value each render
      const value = kvCache.get(key) ?? ensureDefaultValue();
      const setValue2 = async (value: T | ((oldValue: T | undefined) => T)) => {
        // trigger re-render of the use() hook
        setValueEpoch((epoch) => epoch + 1);
        // perform the set
        return await kv.set<T>(key, value);
      };

      // trigger the initial load
      useEffect(() => {
        ensureLoadPromise(key, ensureDefaultValue);
      }, []);

      return [value, setValue2] as [
        T,
        (value: T | ((oldValue: T | undefined) => T)) => Promise<void>,
      ];
    },
  };
  return kv;
}