"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema } from "@/lib/validation";

export default function LoginPage() {
  const router = useRouter();

  // One object holds every field on the form, same as formData in class.
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const [error, setError] = useState("");

  function handleChange(e: any) {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    // Ask zod: "does this data follow the rules?"
    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      // Just show the first problem it found.
      setError(result.error.issues[0].message);
      return;
    }

    try {
      // Ask the real backend to check the email/phone + password.
      // "/api/..." gets forwarded to the backend by next.config.ts.
      const response = await axios.post("/api/auth/login", {
        login: formData.login,
        password: formData.password,
      });

      // Just save the token and the user straight into localStorage,
      // plain and simple, no helper functions needed.
      localStorage.setItem("access_token", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setError("");
      router.push(`/dashboard/${response.data.user.role}`);
    } catch (err: any) {
      // The backend sends back a nice message when something is wrong,
      // like "Wrong email/phone or password".
      setError(err.response?.data?.message || "Something went wrong, please try again");
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center bg-base-200 px-4 py-16">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title">Log in</h1>
          <p className="text-sm text-base-content/60">
            Use the email or phone you registered with.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
            <fieldset className="fieldset">
              <label className="label">Email or phone</label>
              <input
                type="text"
                name="login"
                value={formData.login}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input w-full"
              />
            </fieldset>

            <fieldset className="fieldset">
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input w-full"
              />
            </fieldset>

            {error && <p className="text-error text-sm">{error}</p>}

            <button type="submit" className="btn btn-primary mt-2">
              Log in
            </button>
          </form>

          <p className="text-sm text-center mt-4">
            No account yet?{" "}
            <Link href="/register" className="link link-primary">
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
