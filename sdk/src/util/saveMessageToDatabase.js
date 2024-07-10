import {
  lembed,
} from './embedding.mjs';

export async function saveMessageToDatabase({
  supabase,
  jwt,
  agentId,
  conversationId,
  message,
}) {
  const encodedMessage = await encodeMessage(message, jwt, agentId, conversationId);
  const { error } = await supabase
    .from('agent_messages')
    .insert(encodedMessage);
  if (!error) {
    // nothing
  } else {
    throw new Error(`${error.code} ${error.message}`);
  }
}

async function encodeMessage(message, jwt, agentId, conversationId) {
  const embedding = await lembed(JSON.stringify({
    method: message.method,
    args: message.args,
  }), { overridenJwt: jwt });
  return {
    method: message.method,
    args: message.args,
    text: message.args.text,
    user_id: agentId,
    conversation_id: conversationId,
    src_user_id: message.userId,
    src_name: message.name,
    embedding,
  };
}
