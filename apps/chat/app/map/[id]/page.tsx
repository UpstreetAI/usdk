'use client';

import { useRouter } from 'next/navigation'
import type { Coord2D } from '@/components/map';
import { Map, getMapUrlCoord, setMapUrlCoord } from '@/components/map';
import { Vector3 } from 'three';

const roundToDecimals = (n: number, decimals: number) => {
  const p = Math.pow(10, decimals);
  return Math.round(n * p) / p;
};

export default function MapPage(props: {
  params: {
    id: string
  },
}) {
  const { id } = props.params;
  const router = useRouter();

  const loadUrl = new URL(location.href);
  const query = loadUrl.searchParams;
  const edit = query.get('edit') !== null;
  const coord = getMapUrlCoord(loadUrl);
  const onMove = async (position: Vector3) => {
    const coord = {
      x: roundToDecimals(position.x, 2),
      z: roundToDecimals(position.z, 2),
    } as Coord2D;
    await setMapUrlCoord(coord, {
      router,
    });
  };

  return (
    <Map
      id={id}
      edit={edit}
      coord={coord}
      onMove={onMove}
    />
  );
};
