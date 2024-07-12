import { getSupabase } from '@/lib/hooks/use-supabase'
import { lembed } from '@/utils/ai/embedding'

export async function search(query: string, opts: { signal: AbortSignal }) {
  const { signal } = opts

  const { supabase } = await getSupabase({
    signal
  })
  if (supabase) {
    const query_embedding = await lembed(query, {
      signal
    })
    const rpc = supabase.rpc.bind(supabase) as any

    const result = await rpc('match_assets', {
      query_embedding,
      match_threshold: 0.2,
      match_count: 10
    })
    const { error, data } = result
    if (!error) {
      return data
    } else {
      throw new Error(JSON.stringify(error))
    }
  } else {
    return []
  }
}

export const getLatestAgents = async (
    // opts: { signal: AbortSignal }
) => {
//   const { signal } = opts

  const { supabase } = await getSupabase({
    // signal
  })

  // list agents in the account
  const assetsResult = await supabase
    .from('assets')
    .select('*')
    .eq('type', 'npc')
    .order('created_at', { ascending: false })
    .limit('10')

  const { error, data } = assetsResult
  if (!error) {
    // console.log('got remote data', data);
    return data
  } else {
    throw new Error(`could not get assets: ${error}`)
  }
}
