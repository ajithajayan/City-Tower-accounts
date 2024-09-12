// PasscodeLoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/features/slices/authSlice";
import { loginWithPasscode } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RotateCcw, X } from "lucide-react";
import { Link } from "react-router-dom";

const PasscodeLoginPage = () => {
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleNumberClick = (number: number) => {
    if (passcode.length < 6) {
      setPasscode((prev) => prev + number);
    }
  };

  const handleNavigate = (user: any) => {
    if (user.role === "driver") {
      setTimeout(() => {
        navigate("/driver");
      }, 50);
    } else {
      setTimeout(() => {
        navigate("/");
      }, 50);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await loginWithPasscode({ passcode });
      const { user, access: token, refresh } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("refresh", refresh);

      dispatch(loginSuccess({ user, token }));
      handleNavigate(user);
    } catch (error: any) {
      console.error("Login failed:", error);
      setError(error.response?.data?.non_field_errors || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen">
      <img
        src="/images/nasscript_full_banner_logo.png"
        alt="Logo"
        className="align-middle h-auto w-[150px] mb-5"
      />
      <Card className="sm:w-[450px]">
        <CardHeader>
          <CardTitle>Login with Passcode</CardTitle>
          <CardDescription>Enter your 6-digit passcode</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 items-center justify-center">
              <Input
                type="password"
                value={passcode}
                readOnly
                className="text-center text-2xl h-16 mb-4"
              />
              {passcode && (
                <span
                  onClick={() => setPasscode("")}
                  className="cursor-pointer mb-4"
                >
                  <X />
                </span>
              )}
            </div>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button
                  key={num}
                  type="button"
                  onClick={() => handleNumberClick(num)}
                  className="text-2xl h-16"
                >
                  {num}
                </Button>
              ))}
            </div>
            <Button
              type="button"
              onClick={() => handleNumberClick(0)}
              className="flex w-full text-2xl h-16 mb-6"
            >
              {0}
            </Button>
            <Button
              className="w-full"
              type="submit"
              disabled={isLoading || passcode.length !== 6}
            >
              {isLoading && <RotateCcw className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 mt-2 text-center"
          >
            <span className="hover:underline">Login with username</span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasscodeLoginPage;
