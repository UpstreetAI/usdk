import React from 'react';
import dedent from 'dedent';
import {
  Agent,
  DefaultAgentComponents,

  GenerativeServer,
  generativeFetchHandler,
  generativeImageFetchHandler,
  generativeJsonFetchHandler,
  generativeFarcasterFrameFetchHandler,
} from 'react-agents';

//

export default function render() {
  return (
    <Agent>
      <GenerativeServer>
        {() => {
          generativeFetchHandler(
            'GET',
            '/hello',
            'Generate a simple "hello world" HTML page depending on the URL. Use the `q` query parameter to inject some appropriate flavor.',
          );
          generativeImageFetchHandler(
            'GET',
            '/images/**/*.png',
            'An image based on what is likely to be located at the given URL',
          );
          generativeJsonFetchHandler(
            'GET',
            '/api/**/*.json',
            'Output JSON data matching the schema {result: string}, based on the URL',
          );
          generativeFarcasterFrameFetchHandler(
            'GET',
            '/farcaster/cats/**',
            dedent`
              An appropriate frame about cats, with the actions "Pet" and "Feed".
            `,
          );
          generativeFetchHandler(
            'GET',
            '/**',
            dedent`
              Simple home page for a digital cat pet. It should have links to the following pages:
              - /hello?q=[something]
              - /images/my-cat-[catsName].png
              - /api/cats/[catsName].json
            `,
          );
        }}
      </GenerativeServer>
    </Agent>
  );
}
