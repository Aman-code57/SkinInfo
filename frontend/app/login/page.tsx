"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation"; // ✅ ADDED
import InputField from "../component/input";
import Image from "next/image";

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter(); // ✅ ADDED

  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/loginapi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      alert("Login successful 🎉");

      setForm({
        email: "",
        password: "",
      });

      router.push("/"); // ✅ ADDED (redirect to UploadCapture)
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

      <div className="absolute left-8 top-40 w-60 h-60  rounded-full overflow-hidden shadow-2xl border-4 border-white/50">
        <Image src="/left.jpg" alt="" fill className="object-cover" />
      </div>

      <div className="absolute right-10 top-44 w-64 h-64  rounded-full overflow-hidden shadow-2xl border-4 border-white/40">
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

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md border border-white/40">
          <h2 className="text-3xl font-extrabold text-center text-purple-700 mb-8">
            Log in
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
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

            <div className="text-right text-sm">
              <a
                href="#"
                className="text-purple-600 font-semibold hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl text-lg font-extrabold text-white bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:opacity-90 active:scale-[0.98] transition shadow-xl"
            >
              Login
            </button>
          </form>

          <p className="text-center mt-8 text-gray-700 font-medium">
            Don’t have an account?{" "}
            <a
              href="/register"
              className="text-teal-600 font-bold hover:underline"
            >
              Register
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
