import { User, columns } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<User[]> {
  // Fetch data from your API here.
  return [
    {
      id: "fjsa5as",
      name: "user1",   
      amount: 5, 
      create_at: "2025-03-19T12:00:00Z",
    },
    {
      id: "asfsa5as",
      name: "user2",
      amount: 8,
      create_at: "2025-03-14T12:00:00Z",
    },
    {
      id: "12sa5as",
      name: "user3",
      amount: 2,
      create_at: "2025-03-11T12:00:00Z",
    },
    {
      id: "4j2a5as",
      name: "user4",
      amount: 5,
      create_at: "2025-03-18T12:00:00Z",
    },
  ]
}

export default async function DemoPage() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <div>
        <h1 className="text-2xl font-bold text-white">User Portraits Management</h1>
        <p className="mt-1 text-white/60">
          Track user portraits
        </p>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  )
}
