import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // CLOSES DROPDOWN IF USER CLICKS OUTSIDE THE SEARCH COMPONENT
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // THE DEBOUNCE ENGINE
  useEffect(() => {
    // If query is empty, clear dropdown and don't make API call
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    // ⏱️ Start a 300ms countdown timer
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/products/search?q=${query}`,
        );
        setResults(res.data);
        setIsOpen(true);
      } catch (err) {
        console.error("Search failed", err);
      }
    }, 300);

    // 🧹 CLEANUP: If the user types again within 300ms, this destroys the old timer!
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectProduct = (productId) => {
    setIsOpen(false);
    setQuery("");
    navigate(`/product/${productId}`); // Teleport user directly to that item page
  };

  return (
    <div ref={dropdownRef} className="relative w-full max-w-md mx-auto">
      {/* Search Input Box */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 pl-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
        />
        {/* Search Icon */}
        <svg
          className="absolute left-3.5 top-3 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* The Live Results Dropdown Container */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 w-full bg-white border border-gray-100 mt-2 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-gray-50">
          {results.map((product) => (
            <div
              key={product._id}
              onClick={() => handleSelectProduct(product._id)}
              className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">
                    {product.name}
                  </h4>
                  <p className="text-xs text-gray-400">{product.category}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-sm text-gray-900">
                  ₹{product.price}
                </p>
                {!product.inStock && (
                  <span className="text-[10px] font-bold text-red-500 uppercase bg-red-50 px-1.5 py-0.5 rounded">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
