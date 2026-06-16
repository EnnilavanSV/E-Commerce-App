import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import axios from "axios";

import React from "react";

const Checkout = () => {
  const { cart, clearCart } = useContext(CartContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  // This dynamically loads the Razorpay security script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!cartTotal || cartTotal <= 0) return;

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Razorpay failed to load. Are you online?");
      return;
    }

    try {
      //  Create the Order on your Backend
      const orderResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/create-order`,
        {
          amount: cartTotal,
        },
      );
      const orderData = orderResponse.data;

      // 2. Configure the Razorpay Window
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "My Awesome Store",
        description: "Secure Checkout",
        order_id: orderData.id,

        //  THIS RUNS IF PAYMENT IS SUCCESSFUL
        handler: async function (response) {
          try {
            await axios.post(
              `${import.meta.env.VITE_API_URL}/api/payment/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            );
          } catch (err) {
            alert("Payment verification failed on the server.");
          }
        },
        theme: {
          color: "#4f46e5",
        },
      };

      //  Open the window
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment initialization failed", error);
      alert("Could not start payment.");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Order Confirmed!
          </h2>
          <p className="text-gray-500 mb-8">
            Your items will be shipped shortly. Thank you for shopping with us!
          </p>
          <Link
            to="/"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors inline-block w-full"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        Secure Checkout
      </h1>

      <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200 p-8">
        <div className="mb-8 pb-8 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Total Amount to Pay:
          </h2>
          <span className="text-3xl font-extrabold text-indigo-600">
            ${cartTotal.toFixed(2)}
          </span>
        </div>

        <form onSubmit={(e) => handlePayment(e)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipping Address
              </label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 hover:bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-md disabled:bg-gray-400 mt-8"
          >
            place Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
