import React from 'react';
import { Action, useEnv } from 'react-agents';
import { z } from 'zod';
import util from 'util';
import { WhatsAppPlugin } from '@elizaos/plugin-whatsapp';

//

type IClient = (args: any) => any;

//

const clientWrap = (client: IClient) => (props: any) => {
  console.log('render client', util.inspect(client, {
    depth: 7,
  }));
  return (
    <>
    </>
  );
};

export const clients = {
  '@elizaos/plugin-whatsapp': clientWrap(WhatsAppPlugin),
};