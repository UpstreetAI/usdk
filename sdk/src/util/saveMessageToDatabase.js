export async function saveMessageToDatabase(supabaseClient, playerID, message) {
  const res = await supabaseClient
    .from('agent_messages')
    .insert(transformMessage(message, playerID));

  if ( res.error ) {
    throw new Error(`${res.error.code} ${res.error.message}`);
  }
}


function transformMessage(message, playerID) {
  return {
    user_id: playerID,
    method: message.method,
    src_user_id: message.userId,
    src_name: message.name,
    text: message.args.text,
    args: message.args,
  };
}
