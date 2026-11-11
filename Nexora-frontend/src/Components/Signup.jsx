import { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAuth from "../context/useAuth";

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data on input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!formData.phoneNumber.trim()) {
      toast.error("Please enter your contact phone number.");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim(),
      });

      toast.success("Account created successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Registration failed. Please check your details.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full min-h-screen flex flex-col font-outfit justify-center items-center bg-[#F0EAD6] gap-12">
      {/* White container box */}
      <div className="w-220 aspect-video bg-white rounded-4xl flex justify-center items-center shadow-xl shadow-gray-400/80 overflow-hidden">
        {/* Signup form */}
        <div className="w-1/2 h-full flex flex-col justify-center items-center text-black gap-6 px-6">
          <h2 className="text-4xl font-extrabold tracking-wider">SIGN UP</h2>
          <form
            className="flex flex-col justify-center items-center gap-6 w-full"
            onSubmit={handleSubmit}
            noValidate={false}
          >
            <div className="flex flex-col justify-center items-center gap-4 w-full">
              {/* Full Name */}
              <div className="relative flex justify-center items-center w-72">
                <input
                  id="signup-fullName"
                  name="fullName"
                  type="text"
                  placeholder="Full Name"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-72 p-3 pr-10 bg-gray-400/35 text-black text-lg rounded-md shadow-lg shadow-inherit outline-none tracking-wide focus:ring-2 focus:ring-[#344b75]/40 transition-all"
                  required
                />
                <FaUser className="absolute right-3 text-gray-500 pointer-events-none" />
              </div>

              {/* Contact Number */}
              <div className="relative flex justify-center items-center w-72">
                <input
                  id="signup-phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="Contact No."
                  autoComplete="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-72 p-3 pr-10 bg-gray-400/35 text-black text-lg rounded-md shadow-lg shadow-inherit outline-none tracking-wide focus:ring-2 focus:ring-[#344b75]/40 transition-all"
                  required
                />
                <IoCall className="absolute right-3 text-xl text-gray-500 pointer-events-none" />
              </div>

              {/* Email */}
              <div className="relative flex justify-center items-center w-72">
                <input
                  id="signup-email"
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
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-72 p-3 pr-16 bg-gray-400/35 text-black text-lg rounded-md shadow-lg shadow-inherit outline-none tracking-wide focus:ring-2 focus:ring-[#344b75]/40 transition-all"
                  required
                />
                <div className="absolute right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-gray-500 hover:text-gray-700 cursor-pointer focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                  </button>
                  <FaLock className="text-base text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-72 p-3 bg-[#344b75] text-white text-xl font-normal rounded-md tracking-wider shadow-lg outline-none cursor-pointer transition ease-in-out duration-350 hover:bg-[#345696ea] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Creating Account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        {/* Blue Welcome Box */}
        <div className="w-1/2 h-full rounded-4xl bg-[#344b75] text-white flex flex-col justify-center items-center gap-20 px-8 text-center">
          <div className="flex flex-col justify-center items-center gap-4">
            <h1 className="text-4xl font-extrabold tracking-wider">
              Hello Chief!!
            </h1>
            <div className="text-lg tracking-wide text-gray-200">
              It`s Nice to have you with us.
            </div>
          </div>

          <div className="flex flex-col justify-center items-center gap-6">
            <div className="text-lg tracking-wide text-gray-200">
              Wait.. Already have an account ?
            </div>
            <Link
              to="/login"
              className="p-3 w-52 flex justify-center items-center text-xl text-white tracking-wide border-2 border-white rounded-md shadow-lg outline-none cursor-pointer transition ease-in-out duration-350 hover:bg-[#345696ea]"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
