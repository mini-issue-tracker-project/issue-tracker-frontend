"use client";

import { IssueList } from "@/components/ui/IssueList"
import { IssueFilters } from "@/components/ui/IssueFilters"; 

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Issue List</h1>
      <IssueFilters />
      <IssueList />
    </main>
  )
}
