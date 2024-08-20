// import * as components from '@upstreet/sdk-agent/components.js'
// import * as components from '../sdk/src/components.js'
// import * as defaultComponents from '@upstreet/sdk-agent/default-components.jsx'


// console.log( 'COMPONENTS:', Object.keys( components ))
// console.log( 'DEFAULT COMPONENTS:', Object.keys( defaultComponents ))


export async function generateImportsFromAgentReactCode( code ) {
  const reactComponentRegex = /<\s*(\S+)\s*\/>/g

  let
    result,
    imports = []

  while( result = reactComponentRegex.exec( code )) {
    imports.push( result[1].trim())
  }

  return imports
}
