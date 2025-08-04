"use client";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui";
import LoginForm from "../components/custom/auth/LoginForm"
import RegisterForm from "../components/custom/auth/RegisterForm"
import { useState, useEffect, useRef } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleGoToProfile = () => {
    setShowProfileDropdown(false);
    if (user) {
      router.push(`/profile/${user.id}`);
    }
  };

  return (
    <header className="w-full flex justify-end items-center p-4 border-b">
      {user ? (
        <div className="relative" ref={dropdownRef}>
          <Button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            {user.name}
          </Button>
          
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={handleGoToProfile}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Go to Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <LoginForm />
          <RegisterForm />
        </div>
      )}
    </header>
  );
} 