import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [dashboardProducts, setDashboardProducts] = useState([]);
  const [userCount, setUserCount] = useState(0);

  // If a normal user somehow types /admin in the URL, kick them out immediately!
  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">403 Forbidden</h1>
        <p className="text-gray-600">
          You do not have permission to view this page.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 text-indigo-600 font-bold hover:underline"
        >
          Return Home
        </button>
      </div>
    );
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch all products to count them
        const productRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/products`,
        );
        setDashboardProducts(productRes.data);

        // Fetch all users to count them (Requires your backend token)
        const userRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setUserCount(userRes.data.length);
      } catch (error) {
        console.error("Failed to load dashboard metrics", error);
      }
    };

    fetchStats();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
    description: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Uploading...");

    try {
      // THIS IS THE VIP REQUEST
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/products`,
        {
          ...formData,
          price: Number(formData.price),
        },
        {
          headers: { Authorization: `Bearer ${token}` }, // Present the ticket!
        },
      );

      setStatus("Success! Product added to store.");
      setFormData({
        name: "",
        price: "",
        category: "",
        image: "",
        description: "",
      });
      setTimeout(() => setStatus(""), 3000);
    } catch (error) {
      console.error(error);
      setStatus(error.response?.data?.message || "Error adding product.");
    }
  };

  const availableCount = dashboardProducts.filter(
    (p) => p.inStock !== false,
  ).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 font-bold mb-1 text-xs uppercase tracking-wider">
            Total Products
          </h3>
          <p className="text-4xl font-black text-gray-900">
            {dashboardProducts.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 font-bold mb-1 text-xs uppercase tracking-wider">
            Available (In Stock)
          </h3>
          <p className="text-4xl font-black text-green-600">{availableCount}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 font-bold mb-1 text-xs uppercase tracking-wider">
            Registered Users
          </h3>
          <p className="text-4xl font-black text-indigo-600">{userCount}</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Admin Command Center
        </h1>
        <p className="text-gray-500 mb-8">
          Add a new product to the live database.
        </p>

        {status && (
          <div
            className={`p-4 mb-6 rounded-lg font-bold ${status.includes("Success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {status}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" disabled>
                  Select a category
                </option>
                <option value="Electronics">Electronics</option>
                <option value="Apparel">Apparel</option>
                <option value="Home">Home</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gray-900 hover:bg-indigo-600 text-white py-4 rounded-xl font-bold transition-colors"
          >
            Publish to Store
          </button>
        </form>
      </div>
    </div>
  );
}
