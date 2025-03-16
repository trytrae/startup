import { Product, columns } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<Product[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      name: "智能手表产品概念",  
      image:"URL_ADDRESSicsum.photos/200/300",
      description: "智能手表产品概念是。。。", 
      create_at: "2025-03-18T12:00:00Z",
    },
    {
      id: "728ed52f",
      name: "智能居家控制器产品概念",
      image:"URL_ADDRESSicsum.photos/200/300",
      description: "智能居家控制器产品概念。。。",
      create_at: "2025-03-13T12:00:00Z",
    },
   
  ]
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
