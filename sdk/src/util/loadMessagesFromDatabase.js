export async function loadMessagesFromDatabase(supabaseClient, limit) {
  const { data, error } = await supabaseClient
    .from( 'agent_messages' )
    .select( '*' )
    .order( 'created_at', { ascending: false })
    .limit( limit )

  if ( error ) {
    throw new Error(`${error.code} ${error.message}`);
  }

  return transformMessage(data);
}


function transformMessage(messages) {
  return messages.map( message => ({
    method: message.method,
    userId: message.src_user_id,
    name: message.src_name,
    args: message.args,
  }));
}
