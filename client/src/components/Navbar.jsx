import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import SearchBar from "./SearchBar";

import React from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);

  //calculating total number of quantities
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handlelogout = () => {
    setIsMenuOpen(false);
    logout();

    window.location.href = "/";
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-3">
          <div className="shrink-0">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="text-xl sm:text-2xl font-extrabold text-indigo-600 tracking-tight hover:text-indigo-500 transition-colors"
            >
              My Store
            </Link>
          </div>

          {/* Search bar sits inline on tablet/desktop; on phones it moves into the dropdown menu below */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <SearchBar />
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* THE CART BUTTON (Shows for everyone, on every screen size) */}
            <Link
              to="/cart"
              onClick={() => setIsMenuOpen(false)}
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

            {/* Desktop / tablet controls — hidden on phones, replaced by the hamburger menu */}
            <div className="hidden md:flex items-center space-x-6">
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
                    welcome ,{" "}
                    <span className="text-indigo-600">{user.name}</span>
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

            {/* Hamburger toggle — phones/small tablets only */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              className="md:hidden p-2 -mr-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              {isMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown panel — search + account controls, phones/small tablets only */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-4 border-t border-gray-100">
            <div className="pt-3">
              <SearchBar />
            </div>

            {user ? (
              <div className="space-y-3">
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-center text-xs font-bold text-indigo-600 border border-indigo-600 px-3 py-2 rounded-md hover:bg-indigo-50 transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
                <p className="text-center text-gray-700 font-medium">
                  welcome , <span className="text-indigo-600">{user.name}</span>
                </p>
                <button
                  onClick={handlelogout}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-center text-gray-600 hover:text-indigo-600 font-bold transition-colors border border-gray-200 rounded-lg py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
