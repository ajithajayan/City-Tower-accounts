import React from "react";

interface MenuItem {
  id: number;
  dish: {
    name: string;
    price: string | number | null; // Handle price as string or number or null
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

interface MenuCardsProps {
  menus: Menu[];
  totalAmount: number; // Add totalAmount prop
}

const MenuCards: React.FC<MenuCardsProps> = ({ menus, totalAmount }) => {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-700">
        Menu Cards
      </h3>
      <div className="relative mt-4">
      <div className="mb-4 p-2 bg-gray-200 text-gray-700 font-semibold text-right">
      Total Amount: QR{totalAmount.toFixed(2)} {/* Display the total amount */}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {menus.map((menu) => (
          <div key={menu.id} className="p-4 border rounded-lg shadow-md">
            <h4 className="text-md font-medium text-gray-700 text-center">{menu.name}</h4>
            <p className="text-sm text-gray-600">Sub Total: QR{parseFloat(menu.sub_total as string).toFixed(2)}</p>
            <div className="mt-2">
              <h5 className="text-sm font-medium text-gray-700">Menu Items:</h5>
              <div className="flex flex-col space-y-2">
                {menu.menu_items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <img src={item.dish.image} alt={item.dish.name} className="w-16 h-16 object-cover rounded-md" />
                    <div>
                      <h6 className="text-sm font-medium text-gray-700">{item.meal_type}</h6>
                      <p className="text-sm text-gray-600">
                        {item.dish.name} - QR
                        {item.dish.price !== null && !isNaN(Number(item.dish.price))
                          ? Number(item.dish.price).toFixed(2)
                          : "Price not available"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuCards;
