import {
  lembed,
} from './embedding.mjs';

export async function saveMessageToDatabase({
  supabase,
  jwt,
  userId,
  conversationId,
  message,
}) {
  const encodedMessage = await encodeMessage(message, jwt, userId, conversationId);
  const { error } = await supabase
    .from('agent_messages')
    .insert(encodedMessage);
  if (!error) {
    // nothing
  } else {
    throw new Error(`${error.code} ${error.message}`);
  }
}

async function encodeMessage(message, jwt, userId, conversationId) {
  const embedding = await lembed(JSON.stringify({
    method: message.method,
    metadata: message.metadata,
  }), { jwt });
  return {
    id: message.id,
    method: message.method,
    attachments: message.attachments,
    text: message.text,
    user_id: userId,
    conversation_id: conversationId,
    src_user_id: message.userId,
    src_name: message.name,
    metadata: message.metadata,
    embedding,
  };
}
