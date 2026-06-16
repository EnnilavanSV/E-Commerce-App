import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import axios from "axios";

import React from "react";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart } = useContext(CartContext);

  const [isSyncing, setIsSyncing] = useState(true);
  const [cartNotices, setCartNotices] = useState([]);

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const token = localStorage.getItem("token");

  useEffect(() => {
    const syncCartWithDatabase = async () => {
      // If the cart is empty, skip the check
      if (cart.length === 0) {
        setIsSyncing(false);
        return;
      }

      try {
        //  Grab all the IDs currently in the cart
        const cartItemIds = cart.map((item) => item._id);

        //  Ask Express for the live data
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/cart/validate-cart`,
          { cartItemIds },
          {
            headers: {
              Authorization: `Bearer ${token}`, // <-- Added the security badge!
            },
          },
        );

        const liveProducts = res.data;

        let notices = [];

        //  Compare your cart against the live database
        cart.forEach((cartItem) => {
          const liveItem = liveProducts.find((p) => p._id === cartItem._id);

          if (!liveItem) {
            // SCENARIO A: Admin deleted the product completely
            notices.push(
              `"${cartItem.name}" is no longer available and was removed.`,
            );
            removeFromCart(cartItem._id); // Uses your existing context function!
          } else if (!liveItem.inStock) {
            // SCENARIO B: Admin marked it Out of Stock
            notices.push(
              `"${cartItem.name}" just went out of stock and was removed.`,
            );
            removeFromCart(cartItem._id); // Uses your existing context function!
          }
        });

        // Display any notices to the user
        setCartNotices(notices);
      } catch (error) {
        console.error("Failed to sync cart", error);
      } finally {
        setTimeout(() => {
          setIsSyncing(false);
        }, 2000);
      }
    };

    // Run the engine!
    syncCartWithDatabase();
  }, []);

  if (isSyncing) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <div className="text-xl text-gray-500 font-bold animate-pulse flex flex-col items-center gap-4">
          <svg
            className="w-10 h-10 animate-spin text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Verifying stock availability...
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        {/*  Show warnings if items were removed  */}
        {cartNotices.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl mb-6">
            <p className="font-bold mb-2">Cart Updates:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {cartNotices.map((notice, i) => (
                <li key={i}>{notice}</li>
              ))}
            </ul>
          </div>
        )}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Your cart is empty
        </h2>
        <Link
          to="/"
          className="text-indigo-600 hover:text-indigo-500 font-medium"
        >
          &larr; Continue Shopping
        </Link>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        Shopping Cart
      </h1>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {cart.map((item) => (
            <li key={item._id} className="p-6 flex items-center sm:p-8">
              {/* Product Image */}
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 rounded-md object-cover object-center sm:w-32 sm:h-32"
              />

              {/* Product Info */}
              <div className="ml-4 flex-1 flex flex-col sm:ml-6">
                <div className="flex justify-between">
                  <h4 className="text-lg font-medium text-gray-900">
                    {item.name}
                  </h4>
                  <p className="text-lg font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Qty: <span className="font-bold">{item.quantity}</span>
                  </p>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Checkout Footer */}
        <div className="border-t border-gray-200 p-6 sm:p-8 bg-gray-50">
          <div className="flex justify-between text-xl font-medium text-gray-900 mb-4">
            <p>Subtotal</p>
            <p>${cartTotal.toFixed(2)}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Shipping and taxes calculated at checkout.
          </p>
          <button
            onClick={() => navigate("/checkout")}
            className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Checkout Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
