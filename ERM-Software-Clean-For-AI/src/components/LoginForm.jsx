import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Shield, CheckCircle2, AlertCircle, Loader2, ArrowRight, X } from 'lucide-react';

export default function LoginForm({ onSubmit, error, loading, email, setEmail, password, setPassword }) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(e);
      // Show success animation before transition
      setLoginSuccess(true);
      // The parent component will handle the actual transition
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 transition-colors duration-1000" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-indigo-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            ERM Tool
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Enterprise Risk Management, simplified.
          </p>
        </div>

        {/* Login Card */}
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  autoCapitalize="off"
                  className="w-full px-4 py-3 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  autoCapitalize="off"
                  className="w-full px-4 py-3 pr-12 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-12 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-r-xl transition-colors duration-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline-offset-2 hover:underline transition-all duration-200"
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800"
            >
              {isSubmitting || loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Sign in</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </button>



            {/* Legal Footer */}
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              By signing in, you agree to our{' '}
              <button type="button" className="underline hover:text-slate-700 dark:hover:text-slate-300">
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="underline hover:text-slate-700 dark:hover:text-slate-300">
                Privacy Policy
              </button>
            </p>
          </form>
        </div>

        {/* Tips Carousel */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-1 px-3 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-white/20 dark:border-slate-700/50">
            <span className="text-xs text-slate-600 dark:text-slate-300">
              💡 Tip: Use the dashboard to monitor risk levels in real-time
            </span>
          </div>
        </div>

        {/* Contact Admin & Demo Info */}
        <div className="mt-6 text-center space-y-3">
          <button
            type="button"
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 underline-offset-2 hover:underline transition-colors duration-200"
          >
            Need help? Contact admin
          </button>
          <div className="text-xs text-slate-400 dark:text-slate-500">
            Demo: admin@company.com / Admin123!
          </div>
          <a 
            href="/DEMO_CREDENTIALS.html" 
            target="_blank" 
            className="block text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 underline-offset-2 hover:underline transition-colors duration-200"
          >
            View all demo credentials
          </a>
        </div>

        {/* Success Overlay */}
        {loginSuccess && (
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/90 to-emerald-600/90 backdrop-blur-sm flex items-center justify-center z-50 rounded-3xl">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto animate-success-pulse">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Welcome back!</h3>
              <p className="text-green-100">Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/20 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Reset Password
                </h3>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Here you would typically send the reset email
                      alert('Password reset link sent! Check your email.');
                      setShowForgotPassword(false);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200"
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
