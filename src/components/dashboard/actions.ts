'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth')
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (!user || error) {
    return null
  }
  
 

  const { data: userData } = await supabase
    .from('users')
    .select('id, email, credits')
    .eq('id', user.id)
    .single()

  return userData
}


export async function fetchHealthCheck() {
  try {
    const response = await fetch('http://localhost:5000/api/health', {
      cache: 'no-store'
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching health check:', error);
    throw error;
  }
}