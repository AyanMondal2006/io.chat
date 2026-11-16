import { useState } from "react";
import { Link } from "react-router";
import useLogin from "../hooks/useLogin.js";
import BrandLogo from "../components/BrandLogo.jsx";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const { isPending, error, loginMutation } = useLogin();

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8" data-theme="forest">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-base-100 shadow-2xl lg:flex-row">
        {/* LOGIN FORM SECTION */}
        <div className="flex w-full flex-col p-6 sm:p-10 lg:w-1/2">
          {/* BRAND LOGO */}
          <div className="mb-6 flex items-center justify-start">
            <BrandLogo size="lg" withLink={false} />
          </div>

          {/* ERROR MESSAGE DISPLAY */}
          {error && (
            <div className="alert alert-error mb-4 rounded-xl">
              <span>{error.response?.data?.message || "An error occurred"}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
                  <p className="mt-1 text-sm text-base-content/70">
                    Sign in to your account to continue your conversations on io.chat
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="form-control w-full space-y-2">
                    <label className="label">
                      <span className="label-text font-medium">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="hello@example.com"
                      className="input input-bordered w-full rounded-xl focus:border-primary focus:outline-none"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-control w-full space-y-2">
                    <label className="label">
                      <span className="label-text font-medium">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="input input-bordered w-full rounded-xl focus:border-primary focus:outline-none"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary mt-2 w-full rounded-xl font-semibold shadow-md shadow-primary/20"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  <div className="mt-4 text-center">
                    <p className="text-sm text-base-content/70">
                      Don&apos;t have an account?{" "}
                      <Link to="/signup" className="font-semibold text-primary hover:underline">
                        Create one
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* IMAGE / HERO SECTION */}
        <div className="hidden w-full items-center justify-center bg-gradient-to-br from-primary/15 via-base-200/50 to-secondary/10 p-8 lg:flex lg:w-1/2">
          <div className="max-w-md text-center">
            <div className="relative mx-auto aspect-square max-w-sm drop-shadow-xl">
              <img src="/i.png" alt="io.chat connection illustration" className="h-full w-full object-contain" />
            </div>

            <div className="mt-6 space-y-3">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Connect with partners worldwide
              </h2>
              <p className="text-sm text-base-content/70">
                Experience crystal-clear messaging, language translation, video calls, and community on io.chat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
