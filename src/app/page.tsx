"use client";
import { LoginForm } from "@/components/auth/LoginForm";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { push } = useRouter();
  useEffect(() => {
    const isAuthenticated =
      Cookies.get("token") !== null && Cookies.get("token") !== undefined;
    if (isAuthenticated) {
      push("/dashboard");
    }
  }, [push]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 px-4">
      <LoginForm />
    </div>
  );
}
