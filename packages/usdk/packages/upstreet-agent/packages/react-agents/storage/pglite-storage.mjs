import { PostgrestClient } from '@supabase/postgrest-js';
import { PGlite } from '@electric-sql/pglite';

const defaultSchema = 'public';

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
      // console.log('fetch', url, init);

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
        // if (path === '/rpc') {
        //   // read the query from the request body
        //   const body = JSON.parse(init.body);
        //   query = body.query;
        // } else {
          // Regular INSERT
          const body = JSON.parse(init.body);
          const columns = Object.keys(body).join(', ');
          const values = Object.values(body)
            .map(v => typeof v === 'string' ? `'${v}'` : v)
            .join(', ');
          query = `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;
        // }
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

      try {
        // Execute the protocol message
        // console.log('executing query', query);
        const result = await pglite.query(query);
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
    };
    this.postgrestClient = new PostgrestClient(new URL('http://localhost'), {
      fetch,
      schema: defaultSchema,
    });
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