'use client';

import { useRouter } from 'next/navigation'
import type { Coord2D } from '@/components/map';
import { Map } from '@/components/map';
import { Vector3 } from 'three';

const roundToDecimals = (n: number, decimals: number) => {
  const p = Math.pow(10, decimals);
  return Math.round(n * p) / p;
};

export default function MapPage({
  id,
}: {
  id: string,
}) {
  const router = useRouter();

  const loadUrl = new URL(location.href);
  const query = loadUrl.searchParams;
  const edit = query.get('edit') !== null;
  const coord = (() => {
    const q = query.get('coord');
    if (q !== null) {
      const [x, z] = q.split(coordSep).map(parseFloat);
      if (!isNaN(x) && !isNaN(z)) {
        const coord = { x, z } as Coord2D;
        return coord;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  })();
  const onMove = async (position: Vector3) => {
    const coord = {
      x: roundToDecimals(position.x, 2),
      z: roundToDecimals(position.z, 2),
    } as Coord2D;

    const u = new URL(location.href);
    u.searchParams.set('coord', `${coord.x.toFixed(2)}${coordSep}${coord.z.toFixed(2)}`);
    const s = u.pathname + u.search;
    console.log('onMove replace', s);
    await router.replace(s);
  };

  return (
    <Map
      id={id}
      edit={edit}
      coord={coord}
      onMove={onMove}
    />
  );
}
