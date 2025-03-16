import { Product, columns } from "./columns"
import { DataTable } from "./data-table"
import { createClient } from '@/utils/supabase/server'
import { checkAuth } from '../actions'

async function getData(): Promise<Product[]> {
  try {
    // 验证用户身份
    await checkAuth()
    
    const supabase = await createClient()
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('create_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      return []
    }

    return products || []
  } catch (e) {
    console.error('getData error:', e)
    return []
  }
}

export default async function DemoPage() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Product proof-of-concept Management</h1>
        <p className="mt-1 text-white/60">
          Track your product portraits
        </p>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  )
}
