import { api } from "@/services/api";
import React, { useState, useEffect, useRef } from "react";

interface Dish {
  id: number;
  name: string;
}

interface MenuItem {
  id: number;
  dish: {
    name: string;
    price: string | number | null;
    image: string;
  };
  meal_type: string;
}

interface Menu {
  id: number;
  name: string;
  sub_total: string | number;
  menu_items: MenuItem[];
}

interface AddItemProps {
  menu: Menu;
  onClose: () => void;
  onItemAdded: () => void;
}

const AddItemModal: React.FC<AddItemProps> = ({ menu, onClose, onItemAdded }) => {
  const [mealType, setMealType] = useState("");
  const [selectedDish, setSelectedDish] = useState<number | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const selectRef = useRef<HTMLSelectElement>(null);
  console.log("dishes",dishes)

  useEffect(() => {
    const fetchDishes = async () => {
      if (loading || !hasMore) return;
      setLoading(true);
      try {
        const response = await api.get("/dishes/", {
          params: { page }
        });
        if (response.data && Array.isArray(response.data.results)) {

          setDishes(response.data.results);
          if (response.data.next) {
            setPage(prevPage => prevPage + 1);
          } else {
            setHasMore(false);
          }
        } else {
          console.error("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching dishes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, [page]);

  useEffect(() => {
    const handleScroll = (event: any) => {
      if (!selectRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = event.target;
      if (scrollHeight - scrollTop === clientHeight) {
        setPage(prevPage => prevPage + 1);
      }
    };

    const selectElement = selectRef.current;
    if (selectElement) {
      selectElement.addEventListener("scroll", handleScroll);
      return () => {
        selectElement.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealType || selectedDish === null) {
      alert("Please fill out all fields.");
      return;
    }

    const data = {
      meal_type: mealType,
      menu: menu.id,
      dish_id: selectedDish,
    };

    try {
      const response = await api.post("/menu-items/", data);
      console.log("Menu item added:", response.data);
      onItemAdded();
      onClose();
    } catch (error) {
      console.error("Error adding menu item:", error);
      alert("An error occurred while adding the menu item.");
    }
  };



  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h4 className="text-lg font-medium text-gray-700 mb-4">Add Menu Item</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="mealType">
              Meal Type
            </label>
            <select
              id="mealType"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select meal type</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="dish">
              Dish
            </label>
            <select
              id="dish"
              ref={selectRef}
              value={selectedDish || ""}
              onChange={(e) => setSelectedDish(Number(e.target.value))}
              className="block w-full p-2 border border-gray-300 rounded-md max-h-40 overflow-y-auto text-black"
              style={{ position: 'relative' }} // Add relative position
            >
              <option value="">Select dish</option>
              {dishes.map((dish) => (
                <option key={dish.id} value={dish.id}>
                  {dish.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 mr-2 bg-gray-600 text-white rounded-md shadow-sm hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
