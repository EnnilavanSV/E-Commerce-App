import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  //getting the add to cart function from cartcontext
  const { addToCart } = useContext(CartContext);

  //  By default, we want to show everything.
  const [selectedCategory, setSelectedCategory] = useState("All");

  // The list of categories we want to show as buttons
  const categories = ["All", "Electronics", "Apparel", "Home", "Accessories"];

  // useEffect runs ONCE as soon as the component loads
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/products`,
        );
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // THE FILTER ENGINE
  const filteredProducts =
    selectedCategory === "All"
      ? products // If 'All' is clicked, show the original full list
      : products.filter((product) => product.category === selectedCategory); // Otherwise, strictly match the category

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-bold text-gray-500">
        Loading store...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Latest Arrivals
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Upgrade your style with our premium collection. Free shipping on all
          orders over $100.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 ${
              selectedCategory === category
                ? "bg-indigo-600 text-white shadow-md transform scale-105" // Active button style
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200" // Inactive button style
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 group"
          >
            <Link to={`/product/${product._id}`} className="flex-1">
              <div className="relative h-64 overflow-hidden bg-gray-200">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 pb-0">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                  {product.category}
                </p>
                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                  {product.name}
                </h3>
              </div>
            </Link>

            <div className="p-5 pt-4 mt-auto border-t border-gray-100 flex items-center justify-between">
              <span className="text-xl font-extrabold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              <button
                onClick={() => addToCart(product)}
                className="bg-gray-900 hover:bg-indigo-600 text-white p-2 rounded-lg font-bold transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
