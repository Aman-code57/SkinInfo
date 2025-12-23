"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import InputField from "../component/input";

import Image from "next/image";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/registerapi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Registration successful 🎉");
      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      alert("Something went wrong");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/background.jpg')" }}
      />

      <div className="absolute left-8 top-40 w-60 h-60 rounded-full overflow-hidden shadow-2xl border-4 border-white/50">
        <Image src="/left.jpg" alt="" fill className="object-cover" />
      </div>

      <div className="absolute right-10 top-44 w-64 h-64 rounded-full overflow-hidden shadow-2xl border-4 border-white/40">
        <Image
          src="/righte.jpg"
          alt=""
          fill
          className="object-cover opacity-90"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <header className="text-center mb-8">
          <h1
            className="text-7xl md:text-6xl font-extrabold tracking-tight leading-none
                          bg-clip-text text-transparent
                          bg-gradient-to-r from-teal-400 via-cyan-500 to-purple-600"
          >
            SKININFO
          </h1>
          <p className="text-gray-800 mt-4 text-xl font-semibold">
            Secure access to AI-powered skin analysis
          </p>
        </header>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/40">
          <h2 className="text-3xl font-extrabold text-center text-purple-700 mb-2">
            Register
          </h2>

          <form onSubmit={handleRegister} className="space-y-6">
            <InputField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />

            <InputField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />

            <InputField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
            />

            <InputField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
            />

            <button
              type="submit"
              className="w-full py-2 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-teal-600 to-purple-600 hover:opacity-90 transition"
            >
              Register
            </button>
          </form>

          <p className="text-center mt-8 text-gray-700 font-medium">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-teal-600 font-bold hover:underline"
            >
              Login
            </a>
          </p>
        </div>
        <footer className="mt-8 text-gray-700 text-sm text-center max-w-md border-t pt-6">
          <span className="font-bold text-purple-700">Security Note:</span> Your
          data is encrypted and protected.
        </footer>
      </div>
    </div>
  );
}
