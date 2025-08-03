"use client";

import LoginForm from "@/components/custom/auth/LoginForm"
import { IssueList } from "@/components/custom/issue/IssueList"
import RegisterForm from "@/components/custom/auth/RegisterForm";
import { useAuth } from "@/app/context/AuthContext"

export default function Home() {
  const { user } = useAuth()
  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Issue List</h1>
      </div> 
      <IssueList />
    </main>
  )
}
