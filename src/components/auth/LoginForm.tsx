"use client";
import { useState } from "react";

import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import HttpService from "@/service/httpService";
import { routes } from "@/service/api-routes";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { push } = useRouter();
  const navigate = push;
  const LoginUser = async () => {
    Cookies.remove("token");
    const response = await HttpService.postDataWithoutToken(
      {
        email: email,
        password: password,
      },
      routes.login()
    );
    //@ts-expect-error - we are sure that the response will have a jwt
    Cookies.set("token", response?.jwt);

    toast({
      title: "Login successful",
      description: "Welcome to the admin dashboard",
    });
    setIsLoading(false);
    navigate("/dashboard");
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    LoginUser();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Admin Login
        </CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access the admin dashboard
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Button
                variant="link"
                type="button"
                className="px-0 font-normal h-auto"
              >
                Forgot password?
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
