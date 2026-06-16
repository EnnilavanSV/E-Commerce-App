import React from "react";
import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loginMethod, setLoginMethod] = useState("email");
  const [otpStep, setOtpStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/login`,
        formData,
      );

      login(response.data.user, response.data.token);
      window.location.href = "/";
    } catch (error) {
      console.log("AXIOS ERROR:", error);
      setError(error.response?.data?.message || "Invalid Email or password");
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/request-otp`, {
        phoneNumber,
      });
      setOtpStep(2);
    } catch (error) {
      alert("Failed to send OTP.");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/verify-otp`,
        { phoneNumber, otp: otpCode },
      );
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (error) {
      alert("Invalid Code.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        {/* Header Section */}
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Sign in to your account to continue shopping
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
          <button
            type="button"
            onClick={() => {
              setLoginMethod("email");
            }}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${loginMethod === "email" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500"}`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod("phone");
              setOtpStep(1);
            }}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${loginMethod === "phone" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500"}`}
          >
            Phone Number
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center font-bold">
            {error}
          </div>
        )}

        {loginMethod === "email" ? (
          <>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md hover:shadow-lg"
                >
                  Sign In
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div>
              {otpStep === 1 ? (
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg p-3"
                      placeholder="+1234567890"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold"
                  >
                    Send Login Code
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                      Enter 6-Digit Code
                    </label>
                    <input
                      type="text"
                      maxLength="6"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg p-3 text-center tracking-[0.5em] text-2xl font-bold"
                      placeholder="123456"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold"
                  >
                    Verify & Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtpStep(1)}
                    className="w-full text-sm text-gray-500 mt-2"
                  >
                    Try a different number
                  </button>
                </form>
              )}
            </div>
          </>
        )}
        {/* The Form */}

        {/* Switch to Register link */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
