import React from 'react';
import { APIDataSource } from '../components/plugins/api-data-source';

export const dataSourceRenderers = {
  api: ({ id, name, description, endpoint, headers, params, requiredArgs, examples }) => {

    const requiredParams = {
      id,
      name,
      description,
      endpoint,
      requiredArgs,
      examples
    };
    
    const missing = Object.entries(requiredParams)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      throw new Error(`Data source ${id || 'unknown'} is missing required parameters: ${missing.join(', ')}`);
    }

    return (
      <APIDataSource
        id={id}
        name={name}
        description={description}
        endpoint={endpoint}
        headers={headers}
        params={params}
        requiredArgs={requiredArgs}
        examples={examples}
      />
    );
  },
};