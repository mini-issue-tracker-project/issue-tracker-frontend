"use client";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import LoginForm from "@/components/custom/auth/LoginForm"
import RegisterForm from "@/components/custom/auth/RegisterForm"

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  return (
    <header className="w-full flex justify-end items-center p-4 border-b">
      {user ? (
        <>
          <span className="mr-4 text-sm">Hello, {user.name}</span>
          <Button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            onClick={() => { logout(); router.push("/"); }}
          >
            Logout
          </Button>
        </>
      ) : (
        <div className="flex gap-2">
          <LoginForm />
          <RegisterForm />
        </div>
      )}
    </header>
  );
} 