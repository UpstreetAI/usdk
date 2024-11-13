// import {
//   presenceEndpointUrl,
// } from '../../endpoints.js';
import {
  QueueManager,
} from '../queue/queue-manager.js';
import {
  makeId,
} from '../../util.js';

const accountsTableName = 'accounts';
const relationshipsTableName = 'relationships';
const broadcastParallelism = 3;

export class Relationship {
  #raw;
  #userA;
  #userB;
  constructor({
    raw,
    userA,
    userB,
  }) {
    this.#raw = raw;
    this.#userA = userA;
    this.#userB = userB;
  }
  getRaw() {
    return this.#raw;
  }
  getUserA() {
    return this.#userA;
  }
  getUserB() {
    return this.#userB;
  }
  getStatus() {
    const raw = this.getRaw();
    const {user_a_status, user_b_status} = raw;
    if (user_a_status === 'friend' && user_b_status === 'friend') {
      return 'friend';
    } else if (user_a_status === 'blocked' || user_b_status === 'blocked') {
      return 'blocked';
    } else if (user_a_status === 'pending' || user_b_status === 'pending') {
      return 'pending';
    } else {
      return 'none';
    }
  }
  static fromRaw(raw, userA, userB) {
    return new Relationship({
      raw,
      userA,
      userB,
    });
  }
}

export class RelationshipsManager extends EventTarget {
  constructor({ supabaseClient, autoLogin = true } = {}) {
    super();

    this.supabaseClient = supabaseClient;

    this.playerId = null;
    this.relationships = [];
    this.channel = null;

    autoLogin && this.#listenForLogin();

    this.queueManager = new QueueManager({
      parallelism: broadcastParallelism,
    });
  }

  async fetchUser(userId) {
    const userResult = await this.supabaseClient.supabase
      .from(accountsTableName)
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return userResult.data;
  }
  async fetchUsers({ user_a, user_b }) {
    return Promise.all([this.fetchUser(user_a), this.fetchUser(user_b)]);
  }

  getRelationships() {
    return this.relationships.slice();
  }

  #listenForLogin() {
    const setProfile = (profile) => {
      if (profile.loaded) {
        const { user } = profile;
        setUser(user);
      }
    };
    const setUser = (user) => {
      this.connect(user.id);
    };
    this.supabaseClient.addEventListener('profileupdate', (e) => {
      const { profile } = e.data;
      setProfile(profile);
    });

    const profile = this.supabaseClient.getProfile();
    setProfile(profile);
  }

  async connect(playerId) {
    this.playerId = playerId;

    const relationshipsPromise = (async () => {
      try {
        const relationshipsResult = await this.supabaseClient.supabase
          .from(relationshipsTableName)
          .select('*')
          .or(`user_a.eq.${playerId},user_b.eq.${playerId}`)
          .order('created_at', {
            ascending: true,
          });

        if (!relationshipsResult.error) {
          const relationships = relationshipsResult.data;
          const relationships2 = await Promise.all(
            relationships.map(async (relationship) => {
              const [userA, userB] = await this.fetchUsers(relationship);
              return Relationship.fromRaw(relationship, userA, userB);
            }),
          );
          this.relationships = relationships2;
          for (const relationship of relationships2) {
            this.emitRelationshipUpdate(relationship, 'initialize');
          }

          console.log('loaded initial relationships', {
            playerId,
            relationships2,
          });
        } else {
          console.warn(
            'failed to load relationships',
            relationshipsResult.error,
          );
        }
      } catch (error) {
        console.error('Error loading relationships:', error);
      }
    })();

    const channelName = relationshipsTableName;
    const eventName = `relationshipupdate:${playerId}`;
    this.channel = this.supabaseClient.supabase
      .channel(channelName, {
        config: {
          broadcast: {
            self: false,
          },
        },
      })
      .on(
        'broadcast',
        {
          event: eventName,
        },
        async (data) => {
          const { payload } = data;
          let { relationship, reason } = payload;

          console.log('got relationship update', {
            relationship,
            reason,
          });

          const oldRelationshipIndex = this.relationships.findIndex(
            (r) =>
              r.user_a === relationship.user_a &&
              r.user_b === relationship.user_b,
          );
          if (reason === 'remove-friend') {
            let oldRelationship = this.relationships.splice(
              oldRelationshipIndex,
              1,
            )[0];
            oldRelationship = structuredClone(oldRelationship);
            oldRelationship.user_a_status = 'none';
            oldRelationship.user_b_status = 'none';
            this.emitRelationshipUpdate(
              oldRelationship,
              'remote-remove-friend',
            );
          } else if (reason === 'add-friend') {
            const [userA, userB] = await this.fetchUsers(relationship);
            relationship = structuredClone(relationship);
            relationship = Relationship.fromRaw(relationship, userA, userB);

            this.relationships.push(relationship);
            const senderIsUserB = this.playerId === userA.id;
            const data = {
              sender: senderIsUserB ? { ...userB } : { ...userA },
            };
            this.emitRelationshipUpdate(data, 'remote-add-friend');
          } else if (reason === 'accept-friend') {
             const [userA, userB] = await this.fetchUsers(relationship);
             relationship = structuredClone(relationship);
             relationship = Relationship.fromRaw(relationship, userA, userB);

             const existingRelationshipIndex = this.relationships.findIndex(
               (r) =>
                 r.user_a === relationship.user_a &&
                 r.user_b === relationship.user_b,
             );

             if (existingRelationshipIndex !== -1) {
               const existingRelationship =
                 this.relationships[existingRelationshipIndex];
               const existingRelationshipRaw = existingRelationship.getRaw();
               existingRelationshipRaw.user_a_status = 'friend';
               existingRelationshipRaw.user_b_status = 'friend';
               this.relationships[existingRelationshipIndex] =
                 existingRelationship;
                const senderIsUserB = this.playerId === userA.id;
                const data = {
                  sender: senderIsUserB ? { ...userB } : { ...userA },
                };
               this.emitRelationshipUpdate(
                  data,
                 'remote-accept-friend',
               );
             } else {
               this.relationships.push(relationship);
               this.emitRelationshipUpdate(relationship, 'remote-add-friend');
             }
          }
        },
      )
      .on('error', (err) => {
        console.warn('error', err);
      })
      .subscribe();

    await relationshipsPromise;
  }

  disconnect() {
    this.playerId = null;
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
    this.relationships = [];
  }

  emitRelationshipUpdate(relationship, reason) {
    this.dispatchEvent(
      new MessageEvent(`relationshipupdate`, {
        data: {
          relationship,
          reason,
        },
      }),
    );
  }
  async broadcastRelationshipUpdate(rawRelationship, reason) {
    const userA = rawRelationship.user_a;
    const userB = rawRelationship.user_b;
    const isA = this.playerId.localeCompare(userA) < 0;
    const playerId = isA ? userA : userB;
    const otherPlayerId = isA ? userB : userA;

    const playerIds = [playerId, otherPlayerId];
    console.log('broadcast relationship update to player ids', playerIds);
    for (const userId of playerIds) {
      const eventName = `relationshipupdate:${userId}`;
      const e = {
        type: 'broadcast',
        event: eventName,
        payload: {
          relationship: rawRelationship,
          reason,
        },
      };
      await this.queueManager.waitForTurn(async () => {
        this.channel.send(e);
        await new Promise((accept, reject) => {
          setTimeout(accept, 1000);
        });
      });
    }
  }

  async addFriend(userId) {
    const isA = this.playerId.localeCompare(userId) < 0;
    const user_a = isA ? this.playerId : userId;
    const user_b = isA ? userId : this.playerId;

    if (user_a !== user_b) {
      let relationship = {
        user_a,
        user_b,
        // Because "A" side is determined by string comparison, status should depends on isA
        user_a_status: isA ? 'friend' : 'pending',
        user_b_status: isA ? 'pending' : 'friend',
      };

      const account = await this.supabaseClient.supabase
        .from(relationshipsTableName)
        .select('*')
        .eq('user_a', user_a)
        .eq('user_b', user_b)
        .maybeSingle();
      if (!account.data) {
        const [userA, userB] = await this.fetchUsers(relationship);

        await this.supabaseClient.supabase
          .from(relationshipsTableName)
          .upsert(relationship);
        this.broadcastRelationshipUpdate(relationship, 'add-friend');

        relationship = Relationship.fromRaw(relationship, userA, userB);
        this.relationships.push(relationship);
        this.emitRelationshipUpdate(relationship, 'add-friend');

        return relationship;
      } else {
        return { error : "User already added!" }
      }
    } else {
      return { error : "You can't add yourself!" }
    }
  }
  async addFriendByName(name) {
    // get the account by the name
    const account = await this.supabaseClient.supabase
      .from(accountsTableName)
      .select('*')
      .eq('name', name)
      .maybeSingle();
    if (account.data) {
      // console.log('add account', {
      //   account,
      // });
      return await this.addFriend(account.data.id);
    } else {
      return { error: "User not found!" };
    }
  }
  async removeFriend(userId) {
    const isA = this.playerId.localeCompare(userId) < 0;

    const matchObject = {};
    if (isA) {
      matchObject.user_a = this.playerId;
      matchObject.user_b = userId;
    } else {
      matchObject.user_a = userId;
      matchObject.user_b = this.playerId;
    }

    const relationshipResult = await this.supabaseClient.supabase
      .from(relationshipsTableName)
      .delete()
      .match(matchObject)
      .select('*');
    let relationship = relationshipResult.data[0];
    if (relationship) {
      const [userA, userB] = await this.fetchUsers(relationship);
      this.broadcastRelationshipUpdate(relationship, 'remove-friend');
      relationship = Relationship.fromRaw(relationship, userA, userB);
      this.relationships = this.relationships.filter(
        (r) =>
          !(
            r.getUserA().id === relationship.getUserA().id &&
            r.getUserB().id === relationship.getUserB().id
          ),
      );
      this.emitRelationshipUpdate(relationship, 'remove-friend');
      return relationship;
    } else {
      return null;
    }
  }
  async acceptFriend(userId) {
    const isA = this.playerId.localeCompare(userId) < 0;

    const matchObject = {};
    if (isA) {
      matchObject.user_a = this.playerId;
      matchObject.user_b = userId;
    } else {
      matchObject.user_a = userId;
      matchObject.user_b = this.playerId;
    }

    const updateObject = {};
    if (isA) {
      updateObject.user_a_status = 'friend';
    } else {
      updateObject.user_b_status = 'friend';
    }

    const relationshipResult = await this.supabaseClient.supabase
      .from(relationshipsTableName)
      .update(updateObject)
      .match(matchObject)
      .select('*');
    let relationship = relationshipResult.data[0];
    if (relationship) {
      const [userA, userB] = await this.fetchUsers(relationship);

      this.broadcastRelationshipUpdate(relationship, 'accept-friend');
      relationship = Relationship.fromRaw(relationship, userA, userB);
      const existingRelationshipIndex = this.relationships.findIndex(
        (r) =>
          r.user_a === relationship.user_a &&
          r.user_b === relationship.user_b,
      );

      if (existingRelationshipIndex !== -1) {
        this.relationships[existingRelationshipIndex] = relationship;
      } else {
        this.relationships.push(relationship); // TODO Fixme: If acceptFriend action is happening on non-existing relationship, it's treating the relationship as new one.
      }
      this.emitRelationshipUpdate(relationship, 'accept-friend');
      return relationship;
    } else {
      return null;
    }
  }
  async block(userId) {
    const isA = this.playerId.localeCompare(userId) < 0;

    const matchObject = {};
    if (isA) {
      matchObject.user_a = this.playerId;
      matchObject.user_b = userId;
    } else {
      matchObject.user_a = userId;
      matchObject.user_b = this.playerId;
    }

    const updateObject = {};
    if (isA) {
      updateObject.user_a_status = 'blocked';
    } else {
      updateObject.user_b_status = 'blocked';
    }

    // return the new updated relationship
    const relationshipResult = await this.supabaseClient.supabase
      .from(relationshipsTableName)
      .update(updateObject)
      .match(matchObject)
      .select('*');
    let relationship = relationshipResult.data[0];
    if (relationship) {
      const [userA, userB] = await this.fetchUsers(relationship);

      this.broadcastRelationshipUpdate(relationship);
      relationship = Relationship.fromRaw(relationship, userA, userB);
      this.emitRelationshipUpdate(relationship, 'block');
      return relationship;
    } else {
      return null;
    }
  }
}
