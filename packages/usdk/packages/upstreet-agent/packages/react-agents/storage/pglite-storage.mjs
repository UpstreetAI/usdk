import { PostgrestClient } from '@supabase/postgrest-js';
import { PGlite } from '@electric-sql/pglite';
import { vector } from '@electric-sql/pglite/vector';
import dedent from 'dedent';
import { QueueManager } from 'queue-manager';

const defaultSchema = 'public';

const initQueries = [
  dedent`\
    CREATE EXTENSION vector;
  `,
  dedent`\
    create table
      chat_specifications (
        id text not null,
        created_at timestamp with time zone not null default now(),
        user_id uuid not null,
        data jsonb null,
        uid uuid not null default gen_random_uuid (),
        constraint chat_specifications_pkey primary key (uid),
        constraint chat_specifications_uid_key unique (uid)
      );
  `,
  dedent`\
    create table
      keys_values (
        created_at timestamp with time zone not null default now(),
        value jsonb null,
        agent_id uuid null,
        key text not null,
        constraint keys_values_pkey primary key (key)
      );
  `,
  dedent`\
    create table
      agent_messages (
        user_id uuid not null default gen_random_uuid (),
        created_at timestamp with time zone not null default now(),
        method text not null,
        src_user_id uuid null,
        src_name text null,
        text text null,
        args jsonb not null,
        id uuid not null default gen_random_uuid (),
        embedding vector(3072) not null,
        conversation_id text null,
        attachments jsonb null,
        constraint agent_messages_pkey primary key (id)
      );
  `,
  dedent`\
    create table
      webhooks (
        id uuid not null default gen_random_uuid (),
        user_id uuid null,
        type text not null,
        data jsonb not null,
        created_at timestamp with time zone not null default now(),
        dev boolean null,
        constraint stripe_connect_payments_pkey primary key (id)
      );
  `,
  dedent`\
    create table
      pings (
        user_id uuid not null default gen_random_uuid (),
        timestamp timestamp with time zone not null default now(),
        constraint pings_pkey primary key (user_id)
      );
  `,
];

export class PGliteStorage {
  pglite;
  postgrestClient;
  queueManager = new QueueManager();

  constructor({
    path,
  } = {}) {
    // console.log('vector extension', vector);
    // const vector2 = {
    //   name: 'vector',
    //   setup: (...args) => {
    //     console.log('vector setup', args, new Error().stack);
    //     return vector.setup(...args);
    //   },
    // };
    const pglite = new PGlite({
      dataDir: path,
      extensions: {
        vector,
        // vector: vector2,
      },
    });
    this.pglite = pglite;
    // (async () => {
    //   this.queueManager.waitForTurn(async () => {
    //     await pglite.waitReady;
    //   });
    // })();

    // Hook up PostgrestQueryBuilder to PGlite by implementing fetch
    const fetch = async (url, init = {}) => {
      return await this.queueManager.waitForTurn(async () => {
        // Parse the SQL query from the URL and body
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        const searchParams = urlObj.searchParams;
        const method = init.method || 'GET';

        // Get table name from the basename of the path
        const tableName = path.split('/').pop();

        const parseConditions = (params) => {
          const conditions = [];
          for (const [key, value] of params) {
            if (key === 'select' || key === 'order' || key === 'limit' || key === 'on_conflict') {
              continue;
            }
            const [operator, filterValue] = value.split('.');
            switch(operator) {
              case 'eq':
                conditions.push(`${key} = '${filterValue}'`);
                break;
              case 'gt':
                conditions.push(`${key} > '${filterValue}'`);
                break;
              case 'lt': 
                conditions.push(`${key} < '${filterValue}'`);
                break;
              case 'gte':
                conditions.push(`${key} >= '${filterValue}'`);
                break;
              case 'lte':
                conditions.push(`${key} <= '${filterValue}'`);
                break;
              case 'neq':
                conditions.push(`${key} != '${filterValue}'`);
                break;
              default:
                conditions.push(`${key} = '${value}'`);
            }
          }
          return conditions.join(' AND ');
        };

        const stringifyValue = (value) => {
          if (value === null) return 'NULL';
          if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
          if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
          return value;
        };

        // Convert Postgrest request to SQL query
        let query;
        if (method === 'GET') {
          // Handle SELECT
          const select = searchParams.get('select') || '*';
          const filter = Object.fromEntries(searchParams);

          query = `SELECT ${select} FROM ${tableName}`;
          
          // Handle PostgREST filter operators
          const conditions = parseConditions(searchParams);
          if (conditions) {
            query += ` WHERE ${conditions}`;
          }

          // Handle order
          const order = searchParams.get('order');
          if (order) {
            const [column, direction] = order.split('.');
            query += ` ORDER BY ${column} ${direction.toUpperCase()}`;
          }

          // Handle limit
          const limit = searchParams.get('limit');
          if (limit) {
            query += ` LIMIT ${limit}`;
          }

        } else if (method === 'POST') {
          // Handle INSERT
          const body = JSON.parse(init.body);
          const columns = Object.keys(body).join(', ');
          const values = Object.values(body)
            .map(stringifyValue)
            .join(', ');
          query = `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;

          // Handle ON CONFLICT
          const onConflict = searchParams.get('on_conflict');
          if (onConflict) {
            query += ` ON CONFLICT (${onConflict}) DO UPDATE SET `;
            const updates = Object.entries(body)
              .filter(([key]) => key !== onConflict) // Exclude the conflict column
              .map(([key, value]) => `${key} = ${stringifyValue(value)}`)
              .join(', ');
            query += updates;
          }
        } else if (method === 'PATCH') {
          // Handle UPDATE
          const body = JSON.parse(init.body);
          const updates = Object.entries(body)
            .map(([key, value]) => `${key} = ${stringifyValue(value)}`)
            .join(', ');
          query = `UPDATE ${tableName} SET ${updates}`;
          
          // Add WHERE clause from search params with operators
          const conditions = parseConditions(searchParams);
          if (conditions) {
            query += ` WHERE ${conditions}`;
          }
        } else if (method === 'DELETE') {
          // Handle DELETE
          query = `DELETE FROM ${tableName}`;
          const conditions = parseConditions(searchParams);
          if (conditions) {
            query += ` WHERE ${conditions}`;
          }
        }

        try {
          // console.log('execute query', query, {
          //   searchParams: Object.fromEntries(searchParams),
          //   init,
          // });
          const result = await pglite.query(query);
          return new Response(JSON.stringify(result?.rows ?? null), {
            status: 200,
            headers: {
              'Content-Type': 'application/vnd.pgrst.object+json',
            }
          });
        } catch (err) {
          console.warn('error', err);
          return new Response(JSON.stringify({
            error: err.message
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }
      });
    };
    this.postgrestClient = new PostgrestClient(new URL('http://localhost'), {
      fetch,
      schema: defaultSchema,
    });

    (async () => {
      await this.#init();
    })();
  }
  async #init() {
    // console.log('init 1');
    const initPromises = [];
    for (const initQuery of initQueries) {
      const p = this.query(initQuery);
      initPromises.push(p);
    }
    const initResults = await Promise.all(initPromises);
    // console.log('init 2', initResults);
  }
  async query(query) {
    return await this.queueManager.waitForTurn(async () => {
      // console.log('init query', query);
      const result = await this.pglite.query(query);
      // console.log('init result', {
      //   query,
      //   result,
      // });
      return result;
    });
  }
  // sql(strings, ...values) {
  //   const query = strings.reduce((acc, str, i) => {
  //     acc.push(str);
  //     if (i < values.length) {
  //       acc.push(values[i]);
  //     }
  //     return acc;
  //   }, []).join('');
  //   return this.query(query);
  // }
  from(...args) {
    return this.postgrestClient.from(...args);
  }
};