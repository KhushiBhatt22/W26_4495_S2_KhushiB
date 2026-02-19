import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, formData);
      const { token } = response.data;
      
      const profileResponse = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });

      login(profileResponse.data, token);
      toast.success("Welcome back to Bookstagram!");
      navigate("/dashboard");
      // navigate("/home");
    } catch (error) {
      localStorage.clear()
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* Updated background: Using your fuchsia-to-orange pastel glow */
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-white to-orange-50 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative Blobs for that upbeat vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-10 space-y-2">
          {/* Logo: Swapped from Violet to your Primary-to-Secondary Gradient */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-4 shadow-lg shadow-primary/20 hover:scale-110 transition-transform duration-300">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500">Continue your AI storytelling journey</p>
        </div>

        {/* Form Card: Added backdrop blur and rounded corners to match the landing page */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-primary/5 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              required
              /* Note: Ensure your InputField component uses var(--color-primary) for its focus state! */
            />
            <InputField
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <div className="flex justify-end">
              <button type="button" className="text-sm font-semibold text-primary hover:text-secondary transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Button will automatically use the primary color if styled with bg-primary inside the component */}
            <Button 
              type="submit" 
              isLoading={isLoading} 
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Sign In to Bookstagram
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-10">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-primary hover:text-secondary transition-colors underline-offset-4 hover:underline">
              Join the community
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage;