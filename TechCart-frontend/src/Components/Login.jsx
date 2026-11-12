import { useState } from "react";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAuth from "../context/useAuth";
import { getApiErrorMessage } from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data on change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle standard Login submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }
    if (!formData.password) {
      toast.error("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(formData.email.trim(), formData.password);
      const displayName = result.user?.fullName || "User";
      toast.success(`Welcome back, ${displayName}!`);
      navigate("/");
    } catch (err) {
      const errorMsg = getApiErrorMessage(
        err,
        "Invalid email or password. Please try again.",
      );
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // One-click demo login for instant testing without manual typing
  const handleQuickDemoLogin = async () => {
    setIsSubmitting(true);
    try {
      const result = await login("sima@gmail.com", "Password@123");
      const displayName = result.user?.fullName || "Sima Chakraborty";
      toast.success(`Welcome back, ${displayName}!`);
      navigate("/");
    } catch (err) {
      const errorMsg = getApiErrorMessage(err, "Demo login failed.");
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full min-h-screen flex flex-col font-outfit justify-center items-center bg-[#F0EAD6] gap-12">
      {/* White container box */}
      <div className="w-220 aspect-video bg-white rounded-4xl flex justify-center items-center shadow-xl shadow-gray-400/80 overflow-hidden">
        {/* Blue Welcome Box */}
        <div className="w-1/2 h-full rounded-4xl bg-[#344b75] text-white flex flex-col justify-center items-center gap-14 px-8 text-center">
          <div className="flex flex-col justify-center items-center gap-4">
            <h1 className="text-3xl font-extrabold tracking-wider">
              Welcome back!!
            </h1>
            <div className="text-lg tracking-wide text-gray-200">
              It`s good to see you again.
            </div>
          </div>

          <div className="flex flex-col justify-center items-center gap-6">
            <div className="text-lg tracking-wide text-gray-200">
              Ohh! You don`t have an account ?
            </div>
            <Link
              to="/signup"
              className="w-52 p-3 flex justify-center items-center border-2 border-white text-white text-xl rounded-md tracking-wider shadow-lg outline-none cursor-pointer transition ease-in-out duration-350 hover:bg-[#345696ea]"
            >
              Register Now
            </Link>
          </div>
        </div>

        {/* Login form */}
        <div className="w-1/2 h-full flex flex-col justify-center items-center text-black gap-6 px-6">
          <h2 className="text-4xl font-extrabold tracking-wider">LOG IN</h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-center items-center gap-5 w-full"
            noValidate={false}
          >
            <div className="flex flex-col justify-center items-center gap-4 w-full">
              {/* Email */}
              <div className="relative flex justify-center items-center w-72">
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  autoComplete="username"
                  spellCheck="false"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-72 p-3 pr-10 bg-gray-400/35 text-black text-lg rounded-md shadow-lg shadow-inherit outline-none tracking-wide focus:ring-2 focus:ring-[#344b75]/40 transition-all"
                  required
                />
                <MdOutlineAlternateEmail className="absolute right-3 text-xl text-gray-500 pointer-events-none" />
              </div>

              {/* Password */}
              <div className="relative flex justify-center items-center w-72">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-72 p-3 pr-16 bg-gray-400/35 text-black text-lg rounded-md shadow-lg shadow-inherit outline-none tracking-wide focus:ring-2 focus:ring-[#344b75]/40 transition-all"
                  required
                />
                <div className="absolute right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="text-gray-500 hover:text-gray-700 cursor-pointer focus:outline-none"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-lg" />
                    ) : (
                      <FaEye className="text-lg" />
                    )}
                  </button>
                  <FaLock className="text-base text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Standard Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-72 p-3 bg-[#344b75] text-white text-xl rounded-md tracking-wider shadow-lg outline-none cursor-pointer transition ease-in-out duration-350 hover:bg-[#345696ea] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Logging in...</span>
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
