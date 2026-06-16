import React from "react";
import { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

const ProductDetails = () => {
  const { id } = useParams(); //Grabs the dynamic ID from the URL
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user, token } = useContext(AuthContext);

  const navigate = useNavigate();

  //condtional rendering for editing the product details(admin onlyy)

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const handleEditClick = () => {
    setIsEditing(true);
    setEditForm(product); // Fill the inputs with the current product info
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({}); // Throw away the unsaved changes
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm({
      ...editForm,
      // If it's a checkbox (inStock), use 'checked'. Otherwise, use what they typed.
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/products/${id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setProduct(response.data); // Update the screen with the newly saved data!
      setIsEditing(false); // Turn off edit mode
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to save changes.");
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const respons = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/products/${id}`,
        );
        setProduct(respons.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    // Add a simple browser popup to prevent accidental clicks!
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/products/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        navigate("/"); // Send them back to the catalog
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-bold text-gray-500">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-500">
        Product not found!
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Back Button */}
      <Link
        to="/"
        className="text-indigo-600 hover:text-indigo-800 font-medium mb-8 inline-block"
      >
        &larr; Back to Catalog
      </Link>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Giant Image */}
        <div className="md:w-1/2 h-96 md:h-auto relative bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </div>

        {/* Right Side: Product Info */}

        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          {isEditing ? (
            <div className="space-y-4 bg-yellow-50 p-6 rounded-xl border border-yellow-200">
              <h3 className="text-sm font-bold text-yellow-600 mb-4 uppercase tracking-wider">
                Admin Edit Mode
              </h3>

              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                className="w-full text-3xl font-extrabold border-gray-300 rounded p-2"
              />

              <input
                type="number"
                name="price"
                value={editForm.price}
                onChange={handleEditChange}
                className="w-full text-2xl border-gray-300 rounded p-2"
              />

              <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                rows="4"
                className="w-full text-gray-600 border-gray-300 rounded p-2"
              />

              {/* THE STOCK TOGGLE */}
              <label className="flex items-center space-x-3 cursor-pointer bg-white p-3 rounded border">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={editForm.inStock || false}
                  onChange={handleEditChange}
                  className="h-5 w-5 text-indigo-600"
                />
                <span className="font-medium text-gray-700">
                  Item is currently In Stock
                </span>
              </label>

              {/* SAVE / CANCEL BUTTONS */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                {product.name}
              </h1>
              {/* DISPLAY STOCK STATUS */}
              {product.inStock !== false ? (
                <span className="inline-block bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">
                  In Stock
                </span>
              ) : (
                <span className="inline-block bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">
                  Out of Stock
                </span>
              )}
              <p className="text-2xl font-bold text-gray-900 mb-6">
                ${product.price.toFixed(2)}
              </p>

              <div className="border-t border-gray-200 pt-6 mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <button
                onClick={() => addToCart(product)}
                className="w-full bg-gray-900 hover:bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-md hover:shadow-lg"
              >
                Add to Cart
              </button>
              {user?.isAdmin && (
                <div className="flex space-x-4 mt-6 pt-6 border-t">
                  <button
                    onClick={handleEditClick}
                    className="flex-1 bg-indigo-100 hover:bg-indigo-600 text-indigo-700 hover:text-white py-3 rounded-xl font-bold transition-colors border border-indigo-200 hover:border-transparent"
                  >
                    Edit Product
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full mt-4 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white py-3 rounded-xl font-bold text-md transition-colors border border-red-200 hover:border-transparent"
                  >
                    Delete Product (Admin)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
