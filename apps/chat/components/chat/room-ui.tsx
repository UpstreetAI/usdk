'use client';

import { useEffect, useState } from 'react';
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions';

export function RoomUi() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [temperature, setTemperature] = useState(1);
  const [decay, setDecay] = useState(1);

  /* const lastHumanMessageTime = 0;
  const now = Date.now();
  const timeDiff = now - lastHumanMessageTime;
  const timeDiffS = timeDiff / 1000;
  const numAgentMessagesSinceLastHumanMessage = 1;
  const expectedNumMessages = Math.pow(timeDiff * temperature, 1 / decay); */

  const multiplayerActions = useMultiplayerActions();
  const crdt = multiplayerActions.getCrdtDoc();

  useEffect(() => {
    if (crdt) {
      const _name = crdt.getText('name').toString();
      setName(_name);
      const _description = crdt.getText('description').toString();
      setDescription(_description);
      const _temperature = Number(crdt.getText('temperature').toString()) || 1;
      setTemperature(_temperature);
      const _decay = Number(crdt.getText('decay').toString()) || 1;
      setDecay(_decay);

      const onname = (value: any) => {
        setName(value.toString());
      };
      crdt.on('name', onname);
      const ondescription = (value: any) => {
        setDescription(value.toString());
      };
      crdt.on('description', ondescription);
      const ontemperature = (value: any) => {
        setTemperature(Number(value.toString()));
      };
      crdt.on('temperature', ontemperature);
      const ondecay = (value: any) => {
        setDecay(Number(value.toString()));
      };
      crdt.on('decay', ondecay);

      return () => {
        crdt.off('name', onname);
        crdt.off('description', ondescription);
        crdt.off('temperature', ontemperature);
        crdt.off('decay', ondecay);
      };
    }
  }, [crdt]);

  useEffect(() => {
    if (crdt) {
      crdt.transact(() => {
        const t = crdt.getText('name');
        t.delete(0, t.length);
        t.insert(0, name);
      });
    }
  }, [crdt, name]);
  useEffect(() => {
    if (crdt) {
      crdt.transact(() => {
        const t = crdt.getText('description');
        t.delete(0, t.length);
        t.insert(0, description);
      });
    }
  }, [crdt, description]);
  useEffect(() => {
    if (crdt) {
      crdt.transact(() => {
        const t = crdt.getText('temperature');
        t.delete(0, t.length);
        t.insert(0, temperature + '');
      });
    }
  }, [crdt, temperature]);
  useEffect(() => {
    if (crdt) {
      crdt.transact(() => {
        const t = crdt.getText('decay');
        t.delete(0, t.length);
        t.insert(0, decay + '');
      });
    }
  }, [crdt, decay]);

  return (
    <form className="m-4 flex flex-col">
      <h1 className="text-sm font-medium mb-4">Room</h1>
      <label className="block mb-4">
        <div className="text-sm font-medium mb-1">Name</div>
        <input className="border rounded p-1 w-full" type="text" value={name} onChange={e => {
          setName(e.target.value);
        }} disabled={!crdt} />
      </label>
      <label className="block mb-4">
        <div className="text-sm font-medium mb-1">Description</div>
        <textarea className="border rounded p-1 w-full" value={description} onChange={(e) => {
          setDescription(e.target.value);
        }} disabled={!crdt} />
      </label>
      <label className="block mb-4">
        <div className="text-sm font-medium mb-1">Temperature</div>
        <div className="flex">
          <input className="flex-1 mr-4" type="range" min={1} max={2} step={0.01} value={temperature} onChange={(e) => {
            setTemperature(e.target.value);
          }} disabled={!crdt} />
          <input className="p-1 border rounded" type="number" min={1} max={2} step={0.01} value={temperature} onChange={(e) => {
            setTemperature(e.target.value);
          }} disabled={!crdt} />
        </div>
      </label>
      <label className="block mb-4">
        <div className="text-sm font-medium mb-1">Decay</div>
        <div className="flex">
          <input className="flex-1 mr-4" type="range" min={1} max={2} step={0.01} value={decay} onChange={(e) => {
            setDecay(e.target.value);
          }} disabled={!crdt} />
          <input className="p-1 border rounded" type="number" min={1} max={2} step={0.01} value={decay} onChange={(e) => {
            setDecay(e.target.value);
          }} disabled={!crdt} />
        </div>
      </label>
    </form>
  );
};