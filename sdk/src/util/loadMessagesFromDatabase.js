export async function loadMessagesFromDatabase({
  supabase,
  agentId,
  conversationId,
  limit,
}) {
  const { error, data } = await supabase
    .from( 'agent_messages' )
    .select([
      'method',
      'args',
      'src_user_id',
      'src_name',
      'created_at',
    ].join(','))
    .eq('user_id', agentId)
    .eq('conversation_id', conversationId)
    .order( 'created_at', { ascending: true })
    .limit( limit );
  if (!error) {
    return decodeMessage(data);
  } else {
    throw new Error(`${error.code} ${error.message}`);
  }
}

function decodeMessage(messages) {
  return messages.map( message => ({
    method: message.method,
    args: message.args,
    userId: message.src_user_id,
    name: message.src_name,
    timestamp: message.created_at,
  }));
}
