"use client"

import Link from "next/link"
import { Milk, Lock } from "lucide-react"
import Button from "@/components/yden/ui/button"

export default function PortalPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
            <Milk size={24} />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Member Portal</h2>
          <p className="mt-2 text-sm text-slate-600">Sign in to access resources, training materials, and mentorship.</p>
        </div>
        <form className="mt-8 space-y-6" action="#" method="POST">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-blue-600 focus:border-blue-600 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-blue-600 focus:border-blue-600 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-slate-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <Button className="w-full justify-center flex items-center gap-2">
              <Lock size={16} /> Sign in
            </Button>
          </div>
        </form>
        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
