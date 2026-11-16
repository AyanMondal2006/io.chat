import { useState } from "react";
import { Link } from "react-router";
import useSignUp from "../hooks/useSignUp.js";
import BrandLogo from "../components/BrandLogo.jsx";

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { isPending, error, signupMutation } = useSignUp();

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-base-100 shadow-2xl lg:flex-row">
        {/* SIGNUP FORM - LEFT SIDE */}
        <div className="flex w-full flex-col p-6 sm:p-10 lg:w-1/2">
          {/* BRAND LOGO */}
          <div className="mb-6 flex items-center justify-start">
            <BrandLogo size="lg" withLink={false} />
          </div>

          {/* ERROR MESSAGE IF ANY */}
          {error && (
            <div className="alert alert-error mb-4 rounded-xl">
              <span>{error.response?.data?.message || "An error occurred"}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleSignup}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Create an Account</h2>
                  <p className="mt-1 text-sm text-base-content/70">
                    Join io.chat and start your real-time conversation adventure!
                  </p>
                </div>

                <div className="space-y-3">
                  {/* FULLNAME */}
                  <div className="form-control w-full space-y-1.5">
                    <label className="label">
                      <span className="label-text font-medium">Full Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="input input-bordered w-full rounded-xl focus:border-primary focus:outline-none"
                      value={signupData.fullName}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          fullName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="form-control w-full space-y-1.5">
                    <label className="label">
                      <span className="label-text font-medium">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      className="input input-bordered w-full rounded-xl focus:border-primary focus:outline-none"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({ ...signupData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* PASSWORD */}
                  <div className="form-control w-full space-y-1.5">
                    <label className="label">
                      <span className="label-text font-medium">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="input input-bordered w-full rounded-xl focus:border-primary focus:outline-none"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({ ...signupData, password: e.target.value })
                      }
                      required
                    />
                    <p className="mt-1 text-xs text-base-content/60">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <div className="form-control pt-1">
                    <label className="label cursor-pointer justify-start gap-2.5">
                      <input type="checkbox" className="checkbox checkbox-primary checkbox-sm rounded-md" required />
                      <span className="text-xs leading-tight text-base-content/75">
                        I agree to the{" "}
                        <span className="text-primary hover:underline">terms of service</span> and{" "}
                        <span className="text-primary hover:underline">privacy policy</span>
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  className="btn btn-primary mt-2 w-full rounded-xl font-semibold shadow-md shadow-primary/20"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="mt-4 text-center">
                  <p className="text-sm text-base-content/70">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* SIGNUP FORM - RIGHT SIDE */}
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
                Practice conversations, make friends, and enhance your real-time communication on io.chat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
