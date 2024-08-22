'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

const getHash = (): string => {
  return decodeURIComponent(window.location.hash.replace('#', ''));
}

const useHash = (defaultHash?: string): [string, (hash: string) => void] => {
  const [hash, setHashState] = useState<string>(getHash() || defaultHash || '');
  const params = useParams();

  const updateHash = useCallback((newHash: string) => {
    if (newHash !== hash) {
      window.location.hash = newHash;
      setHashState(newHash);
    }
  }, [hash]);

  useEffect(() => {
    const handleHashChange = () => {
      setHashState(getHash());
    };
    updateHash(getHash() || defaultHash || '')
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('navigate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('navigate', handleHashChange);
    };
  }, [params]);

  return [hash, updateHash];
};

export default useHash;
