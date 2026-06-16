import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import SearchBar from "./SearchBar";

import React from "react";

const Navbar = () => {
  const navigate = useNavigate();

  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);

  //calculating total number of quantities
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handlelogout = () => {
    logout();

    window.location.href = "/";
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className=" flex justify-between items-center h-16">
          <div className=" shrink-0">
            <Link
              to="/"
              className="text-2xl font-extrabold text-indigo-600 tracking-tight hover:text-indigo-500 transition-colors"
            >
              My Store
            </Link>
          </div>

          <div className="flex-1 max-w-2xl hidden md:block">
            <SearchBar />
          </div>

          <div className=" flex items-center space-x-6">
            {/* THE NEW CART BUTTON (Shows for everyone) */}
            <Link
              to="/cart"
              className="relative text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {/* THE NOTIFICATION BADGE */}
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center space-x-4 border-l pl-6 border-gray-200">
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className="text-xs font-bold text-indigo-600 border border-indigo-600 px-3 py-1 rounded-md hover:bg-indigo-50 transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
                <span className="text-gray-700 font-medium">
                  {" "}
                  welcome , <span className="text-indigo-600">{user.name}</span>
                </span>
                <button
                  onClick={handlelogout}
                  className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-indigo-600 font-bold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
