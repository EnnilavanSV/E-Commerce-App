import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // BOOTUP: Fetch the Cloud Cart when the app loads
  useEffect(() => {
    const fetchCloudCart = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Show the bouncer our ticket to get our items!
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/cart`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          setCart(response.data);
        } catch (error) {
          console.error("Error fetching cloud cart:", error);
        }
      }
    };
    fetchCloudCart();
  }, []);

  // A smart function to update MongoDB silently in the background
  const syncCartToCloud = async (newCart) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/cart`,
          { cart: newCart },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } catch (error) {
        console.error("Error saving cart to cloud:", error);
      }
    }
  };

  //  Update React's memory AND the Database
  const addToCart = (product) => {
    setCart((prevCart) => {
      let newCart;
      const existingItem = prevCart.find((item) => item._id === product._id);

      if (existingItem) {
        newCart = prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        newCart = [...prevCart, { ...product, quantity: 1 }];
      }

      syncCartToCloud(newCart); // Upload to MongoDB!
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item._id !== productId);
      syncCartToCloud(newCart); // Upload to MongoDB!
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    syncCartToCloud([]); // Upload an empty array to MongoDB!
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
