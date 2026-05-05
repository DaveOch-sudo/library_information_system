/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Phone,
  School,
  HelpCircle,
  Globe,
  BookOpen,
} from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await api.post("/auth/register", data);
      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen flex items-center justify-center p-gutter">
      <main className="w-full max-w-5xl bg-white shadow-xl flex flex-col md:flex-row overflow-hidden border border-outline-variant rounded-xl">
        {/* Left Side: Visual */}
        <div className="hidden md:flex md:w-1/2 relative bg-primary overflow-hidden items-center justify-center p-stack_lg">
          <div className="absolute inset-0 opacity-40">
            <img
              alt="Institutional Library"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCag1_-xseS_PRONpv1_35AJdvZb6iJwhqCsCoNW8t50JPK_xgPsLNT2Nnnu88NAIMIZBRd9vmqI8Kf8NF6yX2mKWzsyJSu-D92hpO4gH1uXssUt3R3ywg2qlyEXKcgqzPPmjVAqpj2ceBC0K1t3WzarVfIWmuUBXOC3m1JmdGsv9O-ABH_LtA2VuzJ5HgtOpMWa4zA9N0OmQk3Rbgb5zKYx-xlGhEnRZaAnOpLcN-DmvAdijlYXe9uBehdmZjSZhiHyZmUw8fm3oE"
            />
          </div>
          <div className="relative z-10 text-center">
            <div className="mb-stack_md flex justify-center">
              <BookOpen className="text-secondary-fixed-dim h-16 w-16" />
            </div>
            <h1 className="headline-lg text-white mb-stack_sm">
              Create Account
            </h1>
            <p className="text-on-primary-container body-md max-w-xs mx-auto">
              Join our academic community and manage your resources
              effortlessly.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 flex flex-col p-8 md:p-12 bg-white overflow-y-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-secondary font-bold text-sm tracking-widest uppercase">
                Institutional Access
              </span>
            </div>
            <h2 className="headline-lg text-primary mb-6">Register</h2>

            <div className="flex border-b border-outline-variant mb-stack_lg">
              <Link
                to="/login"
                className="px-6 py-2 border-b-2 border-transparent text-outline hover:text-primary font-medium body-md transition-colors"
              >
                Login
              </Link>
              <button className="px-6 py-2 border-b-2 border-secondary text-secondary font-semibold body-md transition-colors">
                Register
              </button>
            </div>
          </div>

          <form className="space-y-stack_md" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1">
              <label className="label-sm text-on-surface-variant block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-outline h-4 w-4" />
                <input
                  className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded focus:border-primary outline-none transition-all body-md"
                  placeholder="John Doe"
                  {...register("fullName", { required: true })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="label-sm text-on-surface-variant block">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-outline h-4 w-4" />
                <input
                  className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded focus:border-primary outline-none transition-all body-md"
                  placeholder="name@institution.edu"
                  type="email"
                  {...register("email", { required: true })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="label-sm text-on-surface-variant block">
                  Contact
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-outline h-4 w-4" />
                  <input
                    className="w-full pl-10 pr-2 py-2 bg-surface-container-low border border-outline-variant rounded focus:border-primary outline-none transition-all body-md"
                    placeholder="Phone"
                    {...register("contactNumber")}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="label-sm text-on-surface-variant block">
                  Role
                </label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 text-outline h-4 w-4" />
                  <select
                    className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded focus:border-primary outline-none transition-all body-md appearance-none"
                    {...register("role", { required: true })}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="LIBRARIAN">Librarian</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="label-sm text-on-surface-variant block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline h-4 w-4" />
                <input
                  className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded focus:border-primary outline-none transition-all body-md"
                  placeholder="Create strong password"
                  type="password"
                  {...register("password", { required: true, minLength: 6 })}
                />
              </div>
            </div>

            <button
              className="w-full bg-secondary text-white py-3 headline-md rounded hover:bg-secondary/90 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 mt-4"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant/30">
            <p className="label-sm text-outline">
              Already have an account?{" "}
              <Link
                className="text-primary font-semibold hover:underline"
                to="/login"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
