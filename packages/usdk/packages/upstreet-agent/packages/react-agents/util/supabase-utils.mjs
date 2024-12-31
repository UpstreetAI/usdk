export const supabaseSubscribe = ({
  supabase,
  table,
  userId,
}, fn) => {
  const guid = crypto.randomUUID();
  const channel = supabase
    .channel(`${table}_changes_${guid}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table,
      filter: userId ? `user_id=eq.${userId}` : undefined,
    }, fn)
    .subscribe((status) => {
      // console.log('subscribed status', {
      //   status,
      // });
    });
  return channel;
};