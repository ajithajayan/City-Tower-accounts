import React, { useState, useEffect, useRef } from "react";
import { Dish } from "../../types";
import { api } from "../../services/api";

interface AddProductModalProps {
  onClose: () => void;
  onSubmit: (products: { dish: Dish; quantity: number }[]) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [productSearch, setProductSearch] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Dish[]>([]);
  const [addedProducts, setAddedProducts] = useState<
    { dish: Dish; quantity: number }[]
  >([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (productSearch.length > 1) {
        try {
          // Use the correct API endpoint here
          const response = await api.get(
            `search-dishes/?search=${productSearch}`
          );
          if (response && response.data && response.data.results) {
            setSuggestions(response.data.results);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error("Error fetching product suggestions:", error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [productSearch]);

  const handleAddProduct = (dish: Dish) => {
    setAddedProducts((prevProducts) => {
      const existingProduct = prevProducts.find(
        (product) => product.dish.id === dish.id
      );

      if (existingProduct) {
        return prevProducts.map((product) =>
          product.dish.id === dish.id
            ? { ...product, quantity: product.quantity + 1 }
            : product
        );
      } else {
        return [...prevProducts, { dish, quantity: 1 }];
      }
    });

    setProductSearch("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setAddedProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index].quantity = Math.max(quantity, 1);
      return updatedProducts;
    });
  };

  const handleRemoveProduct = (index: number) => {
    setAddedProducts((prevProducts) =>
      prevProducts.filter((_, i) => i !== index)
    );
  };

  const calculateTotal = () => {
    const totalValue = addedProducts.reduce(
      (sum, product) => sum + product.quantity * product.dish.price,
      0
    );
    setTotalAmount(totalValue);
  };

  useEffect(() => {
    calculateTotal();
  }, [addedProducts]);

  const handleFinalSubmit = () => {
    // Map added products with is_newly_added set to true
    const productsToSubmit = addedProducts.map(product => ({
      dish: product.dish,
      quantity: product.quantity,
      is_newly_added: true  // Marking as newly added
    }));
  
    onSubmit(productsToSubmit);  // Pass only the newly added products
    onClose();
  };
  
  

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
        <h3 className="text-lg font-semibold mb-4 text-center">
          Add Products to Order
        </h3>
        <input
          type="text"
          value={productSearch}
          ref={inputRef}
          onChange={(e) => setProductSearch(e.target.value)}
          placeholder="Search product..."
          className="border rounded p-2 w-full mb-4 focus:outline-none focus:ring focus:border-blue-300"
        />
        {suggestions.length > 0 && (
          <ul className="border rounded mb-4 max-h-40 overflow-y-auto bg-white">
            {suggestions.map((dish) => (
              <li
                key={dish.id}
                onClick={() => handleAddProduct(dish)}
                className="p-2 cursor-pointer hover:bg-gray-200"
              >
                {dish.name} - QAR {dish.price}
              </li>
            ))}
          </ul>
        )}

        {addedProducts.length > 0 && (
          <div className="mb-4">
            <h4 className="text-md font-semibold mb-2">Added Products:</h4>
            <table className="w-full border-collapse border">
              <thead>
                <tr>
                  <th className="border p-2 text-left">Product</th>
                  <th className="border p-2 text-left">Qty</th>
                  <th className="border p-2 text-left">Price</th>
                  <th className="border p-2 text-left">Total</th>
                  <th className="border p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {addedProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="border p-2">{product.dish.name}</td>
                    <td className="border p-2">
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) =>
                          handleQuantityChange(index, parseInt(e.target.value))
                        }
                        className="border rounded p-1 w-16 text-center"
                        min="1"
                      />
                    </td>
                    <td className="border p-2">
                      QAR {product.dish.price}
                    </td>
                    <td className="border p-2">
                      QAR {(product.quantity * product.dish.price).toFixed(2)}
                    </td>
                    <td className="border p-2">
                      <button
                        onClick={() => handleRemoveProduct(index)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <span className="text-lg font-semibold">
            Total: QAR {totalAmount.toFixed(2)}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => inputRef.current?.focus()}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Add More
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleFinalSubmit}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
