import { PostgrestClient, PostgrestQueryBuilder } from '@supabase/postgrest-js';
import { PGlite } from '@electric-sql/pglite';

const schema = {
  Tables: {
    users: {
      Row: {
        id: 1,
        username: 'johndoe',
        email: 'johndoe@example.com',
        created_at: new Date(),
      },
      Insert: {
        username: 'janedoe',
        email: 'janedoe@example.com',
      },
      Update: {
        email: 'newemail@example.com',
      },
      Relationships: [
        {
          foreignKeyName: 'fk_users_profiles',
          columns: ['id'],
          referencedRelation: 'profiles',
          referencedColumns: ['user_id'],
          isOneToOne: true,
        },
      ],
    },
  },
};

// const c = new PostgrestQueryBuilder(new URL('http://localhost'), {
//   async fetch(...args) {
//     console.log('got args', args);
//     return Promise.resolve();
//   },
//   schema,
// });
// await c.select('*').single();

const p = new PGlite();
await p.waitReady;
// Hook up PostgrestQueryBuilder to PGlite by implementing fetch
const pgliteClient = {
  async fetch(url, init = {}) {
    console.log('fetch', url, init);

    // Parse the SQL query from the URL and body
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const searchParams = urlObj.searchParams;
    const method = init.method || 'GET';
    
    // // Get table name from headers
    // const tableName = (init.headers?.['Accept-Profile'] || init.headers?.['Content-Profile'] || '').replace(/[^a-zA-Z0-9_]/g, '');
    // Get table name from the basename of the path
    const tableName = path.split('/').pop();

    // Convert Postgrest request to SQL query
    let query;
    if (method === 'GET') {
      // Handle SELECT
      const select = searchParams.get('select') || '*';
      const filter = Object.fromEntries(searchParams);
      delete filter.select;
      
      query = `SELECT ${select} FROM ${tableName}`;
      if (Object.keys(filter).length > 0) {
        const conditions = Object.entries(filter)
          .map(([key, value]) => `${key} = '${value}'`)
          .join(' AND ');
        query += ` WHERE ${conditions}`;
      }
    } else if (method === 'POST') {
      // Handle INSERT or CREATE DATABASE
      if (path === '/rpc') {
        // read the query from the request body
        const body = JSON.parse(init.body);
        query = body.query;
      } else {
        // Regular INSERT
        const body = JSON.parse(init.body);
        const columns = Object.keys(body).join(', ');
        const values = Object.values(body)
          .map(v => typeof v === 'string' ? `'${v}'` : v)
          .join(', ');
        query = `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;
      }
    } else if (method === 'PATCH') {
      // Handle UPDATE
      const body = JSON.parse(init.body);
      const updates = Object.entries(body)
        .map(([key, value]) => `${key} = '${value}'`)
        .join(', ');
      query = `UPDATE ${tableName} SET ${updates}`;
      // Add WHERE clause from search params
      if (searchParams.toString()) {
        const conditions = Array.from(searchParams)
          .map(([key, value]) => `${key} = '${value}'`)
          .join(' AND ');
        query += ` WHERE ${conditions}`;
      }
    } else if (method === 'DELETE') {
      // Handle DELETE
      if (path.startsWith('/database/')) {
        // Handle DROP DATABASE
        const dbName = path.slice('/database/'.length).replace(/[^a-zA-Z0-9_]/g, '');
        query = `DROP DATABASE ${dbName}`;
      } else {
        // Regular DELETE
        query = `DELETE FROM ${tableName}`;
        if (searchParams.toString()) {
          const conditions = Array.from(searchParams)
            .map(([key, value]) => `${key} = '${value}'`)
            .join(' AND ');
          query += ` WHERE ${conditions}`;
        }
      }
    }

    // Construct wire protocol message
    // const messageType = new Uint8Array([0x51]); // 'Q' for simple query
    // const queryBytes = new TextEncoder().encode(query + '\0'); // Null terminated
    // const messageLength = 4 + queryBytes.length; // length (4 bytes) + query
    // const length = new Uint8Array(new Int32Array([messageLength]).buffer).reverse(); // Network byte order (big-endian)
    // const message = new Uint8Array([messageType[0], ...length, ...queryBytes]);

    try {
      // Execute the protocol message
      console.log('executing query', query);
      const result = await p.query(query);
      // console.log('result', result); // , new TextDecoder().decode(result.data));

      // Parse result and convert to JSON response
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
  }
};

// Create PostgrestQueryBuilder instance using PGlite client
// const makeBuilder = (schema = 'public') => {
//   const pglitePostgrest = new PostgrestQueryBuilder(new URL('http://localhost'), {
//     fetch: pgliteClient.fetch,
//     schema,
//   });
//   return pglitePostgrest;
// };
const makeClient = (schema = 'public') => {
  const pglitePostgrest = new PostgrestClient(new URL('http://localhost'), {
    fetch: pgliteClient.fetch,
    schema,
  });
  return pglitePostgrest;
}
const pglitePostgrest = makeClient();
const testTableName = 'users';
{
  // create the database via rpc
  const data = await pgliteClient.fetch('http://localhost/rpc', {
    method: 'POST',
    body: JSON.stringify({
      query: `
        CREATE TABLE IF NOT EXISTS ${testTableName} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    }),
  });
  // console.log('created database', data);
}
await Promise.all([
  (async () => {
    const data = await pglitePostgrest.from(testTableName).upsert({
      username: 'johndoe',
      email: 'john@example.com',
      created_at: new Date().toISOString()
    }).single();
    console.log('inserted data:', data);
  })(),
  (async () => {
    const data = await pglitePostgrest.from(testTableName).select('*').single();
    console.log('got data', JSON.stringify(data, null, 2));
  })(),
]);