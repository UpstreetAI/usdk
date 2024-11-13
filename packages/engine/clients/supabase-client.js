import {
  createClient,
} from '@supabase/supabase-js';
import { jwtDecode } from 'jwt-decode';
import {
  supabaseEndpointUrl,
} from '../endpoints.js';
import {
  SUPABASE_PUBLIC_API_KEY,
} from '../constants/auth.js';

import {
  getDefaultUser,
  getDefaultPlayerSpec,
} from '../managers/account/account-manager.js';
// import {
//   getEthereumAccountDetails,
// } from '../../../pages/components/metamask-auth-ui/MetamaskAuthUi.jsx';
import {
  QueueManager,
} from '../managers/queue/queue-manager.js';

//

// TODO: move to endpoints

const anonJwtUrl = `https://metamask.upstreet.ai/anon`;
const getSupabaseAccessToken = supabase => supabase.changedAccessToken;
const getSupabaseJwt = supabase => supabase.auth.headers?.['Authorization']?.replace(/^Bearer\s+/i, '');

export const makeSupabase = (jwt) => {
  let client;
  if (jwt) {
    client = createClient(
      supabaseEndpointUrl,
      SUPABASE_PUBLIC_API_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      },
    );
  } else {
    client = createClient(
      supabaseEndpointUrl,
      SUPABASE_PUBLIC_API_KEY,
    );
  }

  const accessToken = getSupabaseJwt(client);
  client.realtime.accessToken = accessToken;

  return client;
};

//

export class UserProfile {
  constructor({
    loaded = false,
    sessionUserId = '',
    provider = '',
    user = null,
    accountPrivate = null,
  } = {}) {
    this.loaded = loaded;
    this.sessionUserId = sessionUserId;
    this.provider = provider;
    this.user = user;
    this.accountPrivate = accountPrivate;
  }
}

//

export class SupabaseClient extends EventTarget {
  constructor({
    localStorageManager = null,
    jwt = null,
    // NOTE: Cleanup, the state is not passed from engine context, it's always set here
    anonymousLogin = false,
  } = {}) {
    super();

    this.localStorageManager = localStorageManager;
    this.anonymousLogin = anonymousLogin;
    this.jwt = jwt;

    this.supabase = null;
    this.profile = new UserProfile();
    this.authListener = null;
    this.queueManager = new QueueManager();
    this.cleanup = null;

    //

    this.connect();
    this.#listen();
  }

  #listen() {
    const cleanups = [];

    if (this.localStorageManager) {
      // bind jwt update
      const jwtupdate = (e) => {
        const { jwt } = e.data;

        this.closeClient();

        const newClient = makeSupabase(jwt);
        this.setClient(newClient);
      };
      this.localStorageManager.addEventListener('jwtupdate', jwtupdate);
      cleanups.push(() => {
        this.localStorageManager.removeEventListener('jwtupdate', jwtupdate);
      });
    }
    this.cleanup = () => {
      for (const cleanupFn of cleanups) {
        cleanupFn();
      }
    };

    // bind profile update
    {
      const updateUser = async ({ id, provider, address, user_metadata }) => {
        try {
          const [user, accountPrivate] = await (async () => {
            const queries = await Promise.all([
              (async () => {
                return await this.supabase
                  .from('accounts')
                  .select('*')
                  .eq('id', id)
                  .maybeSingle()
              })(),
              (async () => {
                return await this.supabase
                  .from('accounts_private')
                  .select('*')
                  .eq('id', id)
                  .maybeSingle()
              })(),
            ]);
            let { data: data1, error: error1 } = queries[0];
            let { data: data2, error: error2 } = queries[1];
            if (error1) {
              throw error1;
            }
            if (error2) {
              throw error2;
            }

            if (!data1) {
              // create user
              let userName = user_metadata?.name;
              const previewUrl = user_metadata?.avatar_url;

              // if in case the name is not there, we will use the user_name
              if (!userName) {
                userName = user_metadata?.user_name;
              }

              const user = getDefaultUser(id, userName, previewUrl);
              console.log('create initial user', { id, user });

              const { error } = await this.supabase
                .from('accounts')
                .insert(user);

              if (error) {
                throw error;
              }

              data1 = user;
            }

            if (!data2) {
              const email = user_metadata?.email;
              const fullName = user_metadata?.full_name;

              const accountPrivate = {
                id: data1.id,
                email: email,
                full_name: fullName,
                provider: provider,
              };
              if (address) {
                accountPrivate.address = address;
              }
              const { error } = await this.supabase
                .from('accounts_private')
                .insert(accountPrivate);

              if (error) {
                console.log('error is', error);
                throw error;
              }

              data2 = accountPrivate;
            }

            return [data1, data2];
          })();

          if (user !== null) {
            if (!user.playerSpec) {
              user.playerSpec = getDefaultPlayerSpec();
            }

            const newProfile = new UserProfile({
              loaded: true,
              provider,
              sessionUserId: id,
              user,
              accountPrivate,
            });
            this.setProfile(newProfile);
          } else {
            // setDefaultProfile(true);
            debugger;
          }
        } catch (err) {
          if (
            err.code === 'PGRST301' || // Any error related to the verification of the JWT, which means that the JWT provided is invalid in some way.
            err.code === '42501'
          ) {
            console.warn('jwt error, clearing jwt and reloading the page', err)
            this.localStorageManager.deleteJwt();
          } else {
            console.warn('update user error', err);
            debugger;
            throw new Error('update user error');
          }
        }
      };
      const loadAnonUser = async () => {
        const id =  crypto.randomUUID();
        const res = await fetch(anonJwtUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id,
          }),
        });
        const jwt = await res.json();
        this.localStorageManager.setJwt(jwt);
      };
      const tryLoadAnonUser = async () => {
        if (!this.localStorageManager.usedAutoLogin()) {
          await loadAnonUser();
          console.warn('logging in anon user, for chat we have disabled autologin until our login upgrade flow is finalized')
          // this.localStorageManager.setUsedAutoLogin(true);
        } else {
          console.warn('not logging in -- already used up auto login');
          const newProfile = new UserProfile({
            loaded: true,
          });
          this.setProfile(newProfile);
        }
      };

      // bind profile update
      const updateProfile = () => {
        if (this.authListener) {
          this.authListener.subscription.unsubscribe();
          this.authListener = null;
        }

        // this.setProfile({
        //   ...this.profile,
        //   loaded: false,
        // });

        const {
          data: authListener,
        } = this.supabase.auth.onAuthStateChange((event, session) => {
          const {changedAccessToken} = this.supabase;
          if (changedAccessToken) {
            this.localStorageManager.setAccessToken(changedAccessToken);
          } else {
            this.localStorageManager.deleteAccessToken();
          }

          this.queueManager.waitForTurn(async () => {
            console.log('supabase auth state change', {
              event,
              session,
            });

            // console.log('got event', event);
            if (event === 'INITIAL_SESSION') {
              // if we haven't loaded the profile yet
              if (!this.profile?.loaded) {
                // if supabase handled the login
                if (session) {
                  console.log('compare 1', [session.user.id !== this.profile?.sessionUserId, session.user.id, this.profile?.sessionUserId]);
                  session.user.id !== this.profile?.sessionUserId && await updateUser({
                    id: session.user.id,
                    provider: session.user.app_metadata.provider,
                    user_metadata: session.user.user_metadata,
                  });
                // if supabase didn't handle the login
                } else {
                  const jwtString = this.getSupabaseJwt();
                  const jwtResult = jwtString ? jwtDecode(jwtString) : null;
                  // console.log('jwtResult', jwtResult);
                  const id = jwtResult?.id;

                  // if we are logging in with a custom jwt
                  if (jwtResult?.role !== 'anon') {
                    id !== this.profile?.sessionUserId && await updateUser({
                      id,
                      address: jwtResult?.address,
                      provider: 'jwt',
                      user_metadata: session.user.user_metadata,
                    });
                  // if we are not logged in
                  } else {
                    if (this.anonymousLogin) {
                      tryLoadAnonUser();
                    } else {
                      // REFACTOR NEEDED
                      // JUST SETTING THE loaded to true so I can check if the user seesion is there
                      // in the auth component, before there was no need for this as an annonymous user
                      // was created. This whole logic has to be redone.
                      const newProfile = new UserProfile({
                        loaded: true,
                      });
                      this.setProfile(newProfile);
                    }
                  }
                }
              }
            } else if (event === 'SIGNED_IN') {
              if (!this.localStorageManager.getJwt()) {
                const session = await this.supabase.auth.getSession();
                const jwt = session.data.session.access_token;
                this.localStorageManager.setJwt(jwt);
              }
              console.log('compare 2', [session.user.id !== this.profile?.sessionUserId, session.user.id, this.profile?.sessionUserId]);
              session.user.id !== this.profile?.sessionUserId && await updateUser({
                id: session.user.id,
                provider: session.user.app_metadata.provider,
                user_metadata: session.user.user_metadata,
              });
            } else if (event === 'SIGNED_OUT') {
              if (this.profile?.sessionUserId) {
                const newProfile = new UserProfile({
                  loaded: true,
                });
                this.setProfile(newProfile);
              }
            }
          });
        });
        this.authListener = authListener;
      };
      updateProfile();
      this.addEventListener('clientupdate', (e) => {
        updateProfile();
      });
    }
  }
  getProfile() {
    return this.profile;
  }
  setProfile(profile) {
    // console.log('set profile', {
    //   profile,
    //   stack: new Error().stack,
    // });

    this.profile = profile;

    this.dispatchEvent(new MessageEvent('profileupdate', {
      data: {
        profile,
      },
    }));
  }
  getSupabaseAccessToken() {
    return getSupabaseAccessToken(this.supabase);
  }
  getSupabaseJwt() {
    return getSupabaseJwt(this.supabase);
  }
  /* async refresh() {
    const sessionUserId = this.profile?.sessionUserId;
    if (sessionUserId) {
      console.log('refresh')
      const {
        data,
        error,
      } = await this.supabase
        .from('accounts')
        .select('*')
        .eq('id', sessionUserId)
        .maybeSingle();

      const newUser = data;

      this.setProfile({
        ...this.profile,
        user: newUser,
      });
    }
  } */
  async updateUser(spec) {
    const sessionUserId = this.profile?.sessionUserId;
    if (sessionUserId) {
      const newUser = typeof spec === 'function' ?
        spec(this.profile.user)
      :
        {
          ...this.profile.user,
          ...spec,
        };

      await this.supabase
        .from('accounts')
        .upsert(newUser);

      const newProfile = new UserProfile({
        ...this.profile,
        user: newUser,
      });
      this.setProfile(newProfile);
    } else {
      throw new Error('not logged in');
    }
  }
  setClient(supabase) {
    this.supabase = supabase;
    this.dispatchEvent(new MessageEvent('clientupdate', {
      data: {
        client: this.supabase,
      },
    }));
  }
  closeClient() {
    for (const subscription of this.supabase.auth.stateChangeEmitters.values()) {
      subscription.unsubscribe();
    }
    this.supabase.auth.stateChangeEmitters.clear();
    this.supabase.realtime.disconnect();
    this.supabase = null;
  }
  connect() {
    const jwt = this.jwt ?? this.localStorageManager.getJwt();
    this.supabase = makeSupabase(jwt);
    // globalThis.supabase = this.supabase;
    // console.log('got supabase', this.supabase);
  }
  reset() {
    this.closeClient();
    this.connect();
  }
  destroy() {
    this.cleanup();
    this.closeClient();
  }
}
