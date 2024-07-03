import {
  lembed,
} from './embedding.mjs';

export async function saveMessageToDatabase(supabaseClient, jwt, playerID, message) {
  const encodedMessage = await encodeMessage(message, jwt, playerID);
  const { error } = await supabaseClient
    .from('agent_messages')
    .insert(encodedMessage);
  if (!error) {
    // nothing
  } else {
    throw new Error(`${error.code} ${error.message}`);
  }
}

async function encodeMessage(message, jwt, playerID) {
  const embedding = await lembed(JSON.stringify({
    method: message.method,
    args: message.args,
  }), { overridenJwt: jwt });
  return {
    method: message.method,
    args: message.args,
    text: message.args.text,
    user_id: playerID,
    src_user_id: message.userId,
    src_name: message.name,
    embedding,
  };
}
