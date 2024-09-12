import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/features/slices/authSlice";
import { login } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EyeIcon, EyeOffIcon, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

const LoginSchema = Yup.object().shape({
  username: Yup.string().trim().required("Username is required"),
  password: Yup.string().trim().required("Password is required"),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const response = await login(values);
        const user = response.data.user;
        const token = response.data.access;

        localStorage.setItem("token", token);
        localStorage.setItem("refresh", response.data.refresh);

        dispatch(loginSuccess({ user, token }));
        handleNavigate(user);
      } catch (error: any) {
        console.error("Login failed:", error);
        setError(error.response?.data?.detail || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen">
      <img
        src="/images/nasscript_full_banner_logo.png"
        alt="Logo"
        className="align-middle h-auto w-[150px] mb-5"
      />
      <Card className="sm:w-[450px]">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  {...formik.getFieldProps("username")}
                />
                {formik.touched.username && formik.errors.username && (
                  <p className="text-sm text-red-500">
                    {formik.errors.username}
                  </p>
                )}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...formik.getFieldProps("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOffIcon size={20} />
                    ) : (
                      <EyeIcon size={20} />
                    )}
                  </Button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-sm text-red-500">
                    {formik.errors.password}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button className="w-full mt-4" type="submit" disabled={isLoading}>
              {isLoading && <RotateCcw className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <Link to="/login-passcode" className="group flex gap-2 items-center justify-center mt-4 text-center">
            <span className="hover:underline">Login with passcode</span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
