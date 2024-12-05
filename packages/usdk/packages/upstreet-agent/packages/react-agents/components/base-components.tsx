// import React, { useState, useMemo, useEffect, useContext, forwardRef, useImperativeHandle, memo } from 'react';
// import type {
//   PerceptionProps,
//   PerceptionModifierProps,
//   TaskProps,
//   NameProps,
//   PersonalityProps,
//   ServerProps,
//   PaymentProps,
//   SubscriptionProps,
// } from '../types';
// import {
//   AgentContext,
//   ConversationContext,
//   AgentRegistryContext,
// } from '../context';

//

// export const Server = /*memo(*/(props: ServerProps) => {
//   const agent = useContext(AgentContext);
//   const agentRegistry = useContext(AgentRegistryContext).agentRegistry;
//   const symbol = useMemo(Symbol, []);

//   const deps = [
//     props.children.toString(),
//   ];

//   useEffect(() => {
//     agentRegistry.registerServer(symbol, props);
//     return () => {
//       agentRegistry.unregisterServer(symbol);
//     };
//   }, deps);

//   agent.useEpoch(deps);

//   // return <server value={props} />;
//   return null;
// }//);