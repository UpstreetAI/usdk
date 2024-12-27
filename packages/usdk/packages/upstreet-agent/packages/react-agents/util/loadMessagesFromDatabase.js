export async function loadMessagesFromDatabase({
  supabase,
  agentId,
  conversationId,
  limit,
}) {
  const { error, data } = await supabase
    .from( 'agent_messages' )
    .select([
      'id',
      'method',
      'metadata',
      'attachments',
      'text',
      'src_user_id',
      'src_name',
      'created_at',
    ].join(','))
    .eq('user_id', agentId)
    .eq('conversation_id', conversationId)
    .order( 'created_at', { ascending: true })
    .limit( limit );
  if (!error) {
    return decodeMessages(data);
  } else {
    throw new Error(`${error.code} ${error.message}`);
  }
}

function decodeMessages(messages) {
  return messages.map( message => ({
    id: message.id,
    method: message.method,
    metadata: message.metadata,
    text: message.text,
    attachments: message.attachments,
    userId: message.src_user_id,
    name: message.src_name,
    timestamp: message.created_at,
  }));
}
