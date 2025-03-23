import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// import { deepseek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';
const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? '',
});
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // 获取系统消息（包含summary）和用户消息
  const systemMessage = messages.find((m: { role: string; }) => m.role === 'system')?.content || '';
  
  const result = streamText({
    model: deepseek('deepseek-chat'),
    system: `You are a helpful assistant. You must answer based on the following context and messages. ${systemMessage}`,
    messages: messages.filter((m: { role: string; }) => m.role !== 'system'), // 过滤掉系统消息，避免重复
  });
  
  return result.toDataStreamResponse();
}



// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// })

// export async function POST(req: Request) {
//   try {
//     const supabase = await createClient()
//     const { messages } = await req.json()

//     // Check authentication
//     const { data: { user }, error: authError } = await supabase.auth.getUser()
//     if (authError || !user) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       )
//     }

//     // Check if user has enough credits
//     const { data: credits, error: creditsError } = await supabase
//       .from('user_credits')
//       .select('credits')
//       .eq('user_id', user.id)
//       .single()

//     if (creditsError) {
//       console.error('Error fetching credits:', creditsError)
//       return NextResponse.json(
//         { error: 'Error checking credits' },
//         { status: 500 }
//       )
//     }

//     if (!credits || credits.credits < 1) {
//       return NextResponse.json(
//         { error: 'Insufficient credits' },
//         { status: 402 }
//       )
//     }

//     // Make request to OpenAI
//     const completion = await openai.chat.completions.create({
//       model: 'gpt-4',
//       messages: messages,
//       temperature: 0.7,
//       max_tokens: 1000,
//     })

//     // Deduct credits
//     const { error: updateError } = await supabase
//       .from('user_credits')
//       .update({
//         credits: credits.credits - 1,
//         updated_at: new Date().toISOString(),
//       })
//       .eq('user_id', user.id)

//     if (updateError) {
//       console.error('Error updating credits:', updateError)
//       // Continue anyway since we've already made the API call
//     }

//     return NextResponse.json(completion.choices[0].message)
//   } catch (error) {
//     console.error('Error in chat route:', error)
//     return NextResponse.json(
//       { error: 'Error processing request' },
//       { status: 500 }
//     )
//   }
// }