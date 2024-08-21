'use client';

// import { useRouter } from 'next/navigation'
// import type { Coord2D } from '@/components/map';
import { Map, getMapUrlCoord, setMapUrlCoord, snapCoord } from '@/components/map';
import { Vector3 } from 'three';

export default function MapPage(props: {
  params: {
    id: string
  },
}) {
  const { id } = props.params;
  const loadUrl = new URL(location.href);
  const query = loadUrl.searchParams;
  const edit = query.get('edit') !== null;
  const coord = getMapUrlCoord(loadUrl);
  const onMove = (position: Vector3) => {
    const coord = snapCoord({
      x: position.x,
      z: position.z,
    });
    setMapUrlCoord(coord);
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
