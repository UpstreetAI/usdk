import React from 'react';
import { Client } from 'react-agents';
import type {
  AgentObject,
} from '../../types';

type ClientsProps = {
  config?: AgentObject;
};

export const Clients = (props: ClientsProps) => {
  const clientsConfig = props.config?.clients ?? [];
  return (
    <>
      {clientsConfig.map((client: any) => {
        const {
          name,
          parameters,
        } = client;
        return (
          <Client name={name} parameters={parameters} key={name} />
        );
      })}
    </>
  );
};