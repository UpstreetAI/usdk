import React from 'react';
import {
  Agent,
  Name,
  Personality,
  DefaultAgentComponents,
  DefaultActions,
  DefaultPrompts,
  DefaultParsers,
  DefaultPerceptions,
  DefaultSchedulers,
  DefaultServers,
} from 'react-agents';

//

const TwinAgent = ({
  name,
  bio,
}) => {
  return (
    <Agent>
      <Name>{name}</Name>
      <Personality>{bio}</Personality>
    </Agent>
  );
};

const Alice = () => {
  return (
    <TwinAgent
      name="alice"
      bio="She is fun and bubbly"
    />
  );
};

const Bob = () => {
  return (
    <TwinAgent
      name="bob"
      bio="He is always angry and mean"
    />
  );
};

export default function MyAgent() {
  return (
    <>
      <Alice />
      <Bob />
    </>
  );
}
