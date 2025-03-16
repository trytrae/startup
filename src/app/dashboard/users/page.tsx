import { Task, columns } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<Task[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      name: "task1",
      type: "User demand research",
      user_portraits: "user1",
      product_portraits: "product1",
      status: "success", 
      create_at: "2025-03-18T12:00:00Z",
    },
    {
      id: "72grs52f",
      name: "task2",
      type: "Product proof-of-concept research",
      user_portraits: "user2",
      product_portraits: "product2",
      status: "failed",
      create_at: "2025-03-13T12:00:00Z",
    },
    {
      id: "se8ed52f",
      name: "task3",
      type: "User demand research",
      user_portraits: "user3",
      product_portraits: "product3",
      status: "pending",
      create_at: "2025-03-11T12:00:00Z",
    },
    {
      id: "se8ed5vv",
      name: "task4",
      type: "Product proof-of-concept research",
      user_portraits: "user4",
      product_portraits: "product4",
      status: "processing",
      create_at: "2025-03-12T12:00:00Z",
    },
  ]
}

export default async function DemoPage() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Task Management</h1>
        <p className="mt-1 text-white/60">
          Track your tasks
        </p>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  )
}
