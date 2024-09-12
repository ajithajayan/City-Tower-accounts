import { api } from '@/services/api';
import React, { useState, useEffect } from 'react';

interface Dish {
  name: string;
  image: string;
  price: string; // Added price to Dish interface
}

interface Meal {
  meal_type: string;
  dish: Dish;
}

interface Menu {
  name: string;
  day_of_week: string;
  menu_items: Meal[];
  mess_type: number;
  sub_total: string; // Added sub_total to Menu interface
}

const Menus: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [filter, setFilter] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const messTypeMap: { [key: number]: { name: string; type: string } } = {
    1: { name: 'Breakfast Lunch Dinner', type: 'breakfast_lunch_dinner' },
    2: { name: 'Breakfast Lunch', type: 'breakfast_lunch' },
    3: { name: 'Breakfast Dinner', type: 'breakfast_dinner' },
    4: { name: 'Lunch Dinner', type: 'lunch_dinner' }
  };

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await api.get('/menus/?is_custom=false');
        console.log("API Response:", response.data.results);
        setMenus(response.data.results);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching menus:', error);
        setError('Failed to load menus');
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const handleFilterChange = (messType: number) => {
    setFilter(messType);
    console.log("Selected filter:", messType);
  };

  const filteredMenus = menus.filter(menu => menu.mess_type === filter);

  console.log("Filtered menus:", filteredMenus);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="space-y-4 min-h-screen">
      {/* Filter Buttons */}
      <div className="mb-4 flex flex-wrap justify-around gap-4">
        {Object.entries(messTypeMap).map(([key, value]) => (
          <button
            key={key}
            onClick={() => handleFilterChange(Number(key))}
            className={`py-2 px-4 rounded-md w-full md:w-auto ${
              filter === Number(key) ? 'bg-[#6f42c1] text-white transition-all' : 'bg-gray-200'
            }`}
          >
            {value.name}
          </button>
        ))}
      </div>

      {/* Display Menu Items */}
      {filteredMenus.length === 0 && <div>No menus available for this filter.</div>}
      {filteredMenus.map((menu, index) => (
        <div key={index} className="bg-gray-100 p-4 rounded-md shadow-md">
          {/* Day and Subtotal */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{menu.day_of_week}</h2>
            <p className="text-lg font-semibold">QAR {menu.sub_total}</p>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menu.menu_items.map((meal, mealIndex) => (
              <div
                key={mealIndex}
                className="bg-white p-4 rounded-md shadow-md flex flex-col items-center"
              >
                <h3 className="text-lg font-bold mb-2">{meal.meal_type}</h3>
                {meal.dish.image ? (
                  <div className="w-full h-48 bg-gray-200 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                    <img
                      src={meal.dish.image}
                      alt={meal.dish.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-md mb-2 flex items-center justify-center">
                    <p>No Image Available</p>
                  </div>
                )}
                {/* Dish Name and Price */}
                <div className="flex justify-between w-full">
                  <p className="text-lg font-bold">
                    {meal.dish.name}
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                    QAR {meal.dish.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Menus;
