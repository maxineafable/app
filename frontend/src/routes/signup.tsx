import { Button } from '@/components/ui/button';
import { meQuery } from '@/lib/query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router'
import { Link } from "@tanstack/react-router";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { useState } from 'react';

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
})

export type Credentials = {
  email: string;
  password: string;
}

function RouteComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // const queryClient = useQueryClient();
  const navigate = useNavigate()

  const me = useQuery(meQuery)

  const mutation = useMutation({
    mutationFn: async (c: Credentials) => {
      const res = await fetch("/api/auth/register", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(c),
      })

      if (!res.ok)
        throw new Error("Error creating an account");

      const loginRes = await fetch("/api/auth/login?useCookies=true", {
        method: 'POST',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(c),
      })

      if (!loginRes.ok)
        throw new Error("Error log in");
    },
    onSuccess: () => navigate({ to: '/' })
  })

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    mutation.mutate({ email, password })
  }

  if (me.isPending) return null
  if (me.data) return <Navigate to="/" />

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-12">
        <section className="my-auto py-10">
          <div className="rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <div className="mb-5 text-center">
              <h2 className="text-lg font-bold">Create an account</h2>
              <p className="text-xs text-neutral-600">
                Start tracking your workouts and personal records
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Email Address
                </label>

                <div className="flex items-center gap-3 border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                  <Mail size={18} className="shrink-0 text-neutral-600" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    autoFocus
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Password
                </label>

                <div className="flex items-center gap-3 border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                  <LockKeyhole size={18} className="shrink-0 text-neutral-600" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                    className="w-full bg-transparent text-sm outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-neutral-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mutation.isError && (
                <p className="text-sm text-red-600">
                  {mutation.error.message}
                </p>
              )}

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-5 bg-pink-400 hover:bg-pink-500"
              >
                {mutation.isPending ? "Creating Account..." : "Create Account"}
                {!mutation.isPending && <ArrowRight />}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-pink-800 hover:text-pink-900"
            >
              Sign in
            </Link>
          </p>
        </section>

      </div>
    </div>
  )
}
