import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://db.myqbanks.com'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function invokeEdgeFunction(functionName, body, options = {}) {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body,
    ...options,
  })
  if (error) throw error
  return data
}
