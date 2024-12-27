import { PostgrestClient } from '@supabase/postgrest-js';
import { PGlite } from '@electric-sql/pglite';
import dedent from 'dedent';

const defaultSchema = 'public';

const initQuery = [
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
].join('\n');

export class PGliteStorage {
  pglite;
  postgrestClient;

  constructor({
    path,
  } = {}) {
    const pglite = new PGlite(path);
    this.pglite = pglite;
    // await p.waitReady;

    // Hook up PostgrestQueryBuilder to PGlite by implementing fetch
    const fetch = async (url, init = {}) => {
      // Parse the SQL query from the URL and body
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const searchParams = urlObj.searchParams;
      const method = init.method || 'GET';

      // Get table name from the basename of the path
      const tableName = path.split('/').pop();

      const parseConditions = (params) => {
        return Array.from(params)
          .map(([key, value]) => {
            const [operator, filterValue] = value.split('.');
            switch(operator) {
              case 'eq':
                return `${key} = '${filterValue}'`;
              case 'gt':
                return `${key} > '${filterValue}'`;
              case 'lt':
                return `${key} < '${filterValue}'`;
              case 'gte':
                return `${key} >= '${filterValue}'`;
              case 'lte':
                return `${key} <= '${filterValue}'`;
              case 'neq':
                return `${key} != '${filterValue}'`;
              default:
                return `${key} = '${value}'`;
            }
          })
          .join(' AND ');
      };

      // Convert Postgrest request to SQL query
      let query;
      if (method === 'GET') {
        // Handle SELECT
        const select = searchParams.get('select') || '*';
        const filter = Object.fromEntries(searchParams);
        delete filter.select;
        
        query = `SELECT ${select} FROM ${tableName}`;
        
        // Handle PostgREST filter operators
        if (Object.keys(filter).length > 0) {
          const conditions = parseConditions(Object.entries(filter));
          query += ` WHERE ${conditions}`;
        }
      } else if (method === 'POST') {
        // Handle INSERT
        const body = JSON.parse(init.body);
        const columns = Object.keys(body).join(', ');
        const values = Object.values(body)
          .map(v => typeof v === 'string' ? `'${v}'` : v)
          .join(', ');
        query = `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;
      } else if (method === 'PATCH') {
        // Handle UPDATE
        const body = JSON.parse(init.body);
        const updates = Object.entries(body)
          .map(([key, value]) => `${key} = '${value}'`)
          .join(', ');
        query = `UPDATE ${tableName} SET ${updates}`;
        
        // Add WHERE clause from search params with operators
        if (searchParams.toString()) {
          const conditions = parseConditions(searchParams);
          query += ` WHERE ${conditions}`;
        }
      } else if (method === 'DELETE') {
        // Handle DELETE
        query = `DELETE FROM ${tableName}`;
        if (searchParams.toString()) {
          const conditions = parseConditions(searchParams);
          query += ` WHERE ${conditions}`;
        }
      }

      try {
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
    console.log('init 1');
    const initResult = await this.pglite.query(initQuery);
    console.log('init 2', initResult);
  }
  query(query) {
    return this.pglite.query(query);
  }
  sql(strings, ...values) {
    const query = strings.reduce((acc, str, i) => {
      acc.push(str);
      if (i < values.length) {
        acc.push(values[i]);
      }
      return acc;
    }, []).join('');
    return this.query(query);
  }
  from(...args) {
    return this.postgrestClient.from(...args);
  }
};