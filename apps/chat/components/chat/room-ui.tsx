'use client';

import { useEffect, useState } from 'react';
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions';
import { cn, getAgentUrl, isValidUrl } from '@/lib/utils';
import Link from 'next/link';
import { buttonVariants } from '../ui/button';
import Image from 'next/image';

const getNumExpectedMessages = (timeS: number, temperature: number, decay: number) => {
  return Math.pow(timeS * temperature, 1 / decay);
};
const getTimeOfNthMessage = (n: number, temperature: number, decay: number) => {
  if (temperature !== 0) {
    return Math.pow(n, decay) / temperature;
  } else {
    return Infinity;
  }
};

const temperatureDefault = 0;
const temperatureMin = 0;
const temperatureMax = 1;
const temperatureStep = 0.01;

const decayDefault = 2;
const decayMin = 1;
const decayMax = 10;
const decayStep = 0.1;

const maxIdleMessages = 10;

export function RoomUi() {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [temperature, setTemperature] = useState<number>(temperatureDefault);
  const [decay, setDecay] = useState<number>(decayDefault);

  /* const lastHumanMessageTime = 0;
  const now = Date.now();
  const timeDiff = now - lastHumanMessageTime;
  const timeDiffS = timeDiff / 1000;
  const numAgentMessagesSinceLastHumanMessage = 1;
  const expectedNumMessages = Math.pow(timeDiff * temperature, 1 / decay); */

  const multiplayerActions = useMultiplayerActions();
  const crdt = multiplayerActions.getCrdtDoc();

  const { localPlayerSpec, playersMap, getCrdtDoc, agentLeave, room } = useMultiplayerActions()

  const players = Array.from(playersMap.values()).sort((a, b) => {
    return a.getPlayerSpec().name.localeCompare(b.getPlayerSpec().name)
  })

  const [memberSearchQuery, setMemberSearchQuery] = useState('')

  const filteredPlayers = players.filter(
    player =>
      player
        .getPlayerSpec()
        .name.toLocaleLowerCase()
        .includes(memberSearchQuery.toLocaleLowerCase()) ||
      memberSearchQuery
        .toLocaleLowerCase()
        .includes(player.getPlayerSpec().name.toLocaleLowerCase())
  );
  
  useEffect(() => {
    if (crdt) {
      const _name = crdt.getText('name').toString();
      setName(_name);
      const _description = crdt.getText('description').toString();
      setDescription(_description);
      const _temperature = Number(crdt.getText('temperature').toString()) || temperatureDefault;
      setTemperature(_temperature);
      const _decay = Number(crdt.getText('decay').toString()) || decayDefault;
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
    <form className="m-4 flex flex-col overflow-y-auto h-full">
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
          <input className="flex-1 mr-4" type="range" min={temperatureMin} max={temperatureMax} step={temperatureStep} value={temperature} onChange={(e) => {
            setTemperature(parseFloat(e.target.value));
          }} disabled={!crdt} />
          <input className="p-1 border rounded" type="number" min={temperatureMin} max={temperatureMax} step={temperatureStep} value={temperature} onChange={(e) => {
            setTemperature(parseFloat(e.target.value));
          }} disabled={!crdt} />
        </div>
        <div className="text-sm">{getNumExpectedMessages(1, temperature, decay).toFixed(2)} msg/s</div>
      </label>
      <label className="block mb-4">
        <div className="text-sm font-medium mb-1">Decay</div>
        <div className="flex">
          <input className="flex-1 mr-4" type="range" min={decayMin} max={decayMax} step={decayStep} value={decay} onChange={(e) => {
            setDecay(parseFloat(e.target.value));
          }} disabled={!crdt} />
          <input className="p-1 border rounded" type="number" min={decayMin} max={decayMax} step={decayStep} value={decay} onChange={(e) => {
            setDecay(parseFloat(e.target.value));
          }} disabled={!crdt} />
        </div>
        <div className="text-sm whitespace-pre">{(() => {
          const result = [];
          for (let i = 1; i < maxIdleMessages; i++) {
            const n = getTimeOfNthMessage(i, temperature, decay);
            if (isFinite(n)) {
              result.push(`${n.toFixed(2)}s`);
            } else {
              return '';
            }
          }
          return result.filter(n => n !== '').join('\n');
        })()}</div>
      </label>

      {filteredPlayers.length ? (
        filteredPlayers.map(player => {
          const playerSpec = player.getPlayerSpec();
          const id = playerSpec.id;
          const name = playerSpec.name;
          const agentUrl = getAgentUrl(playerSpec);
          const {previewUrl} = playerSpec;
          return (
            <div className="mb-1 px-2" key={player.playerId}>
              <Link
                href={agentUrl}
                target="_blank"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'flex w-full justify-start bg-zinc-50 px-2 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10'
                )}
              >
                {previewUrl && isValidUrl(previewUrl) ? (
                    <Image className="w-6 h-6 aspect-square rounded-full mr-2" width={128} height={128} src={previewUrl} alt='Profile picture' />
                  ) : (
                    <div className='uppercase text-sm font-bold rounded-full bg-muted mr-2 aspect-square h-6 w-6 text-center flex items-center justify-center'>{name.charAt(0)}</div>
                  )}
                <div className="flex-1 text-ellipsis overflow-hidden">
                  {name}
                </div>
                {localPlayerSpec.id !== id && (
                  <div
                    className="rounded p-1 hover:bg-zinc-600"
                    onClick={async e => {
                      e.preventDefault()
                      e.stopPropagation()

                      const agentEndpointUrl = getAgentEndpointUrl(playerSpec.id)
                      const leaveUrl = `${agentEndpointUrl}leave`
                      const res = await fetch(leaveUrl, {
                        method: 'POST'
                      })
                      if (res.ok) {
                        const text = await res.text()
                      }
                      await agentLeave(playerSpec.id, room);
                    }}
                  >
                    <Icon name="close" className="stroke-2" />
                  </div>
                )}
              </Link>
            </div>
          );
        })
      ) : (
        <span className="px-4 py-2 text-center opacity-70">No results.</span>
      )}

    </form>
  );
};