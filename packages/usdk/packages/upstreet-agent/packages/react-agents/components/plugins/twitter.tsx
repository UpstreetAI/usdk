import React, { useContext, useRef, useEffect } from 'react';
import type {
  TwitterProps,
  TwitterArgs,
  TwitterScraperAuth,
  TwitterApiAuth,
} from '../../types';
import {
  useAgent,
  useKv,
  useAuthToken,
} from '../../hooks';
import {
  AppContext,
} from '../../context';

export const Twitter: React.FC<TwitterProps> = (props) => {
  const agent = useAgent();
  const kv = useKv();
  const appContextValue = useContext(AppContext);
  const codecs = appContextValue.useCodecs();
  const authToken = useAuthToken();
  const ref = useRef(false);

  useEffect(() => {
    if (ref.current) {
      return;
    }
    ref.current = true;

    (async () => {
      const auth: TwitterApiAuth | TwitterScraperAuth = 
        props.type === 'api' 
          ? { type: 'api', token: props.token }
          : { type: 'scraper', ...props };

      const args: TwitterArgs = {
        auth,
        agent,
        kv,
        codecs,
        jwt: authToken,
      };
      const twitter = agent.twitterManager.addTwitterBot(args);
      return () => {
        agent.twitterManager.removeTwitterBot(twitter);
      };
    })();
  }, [props]);

  return null;
};