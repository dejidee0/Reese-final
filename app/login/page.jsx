import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Login - ReeseBlank",
  description: "Sign in to your ReeseBlank account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-600 mt-2">
            Sign in to your ReeseBlank account
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
