import React, { useState, useEffect } from "react";
import AddMenuModal from "./AddMenuModal";
import AddItemModal from "./AddItemModal";
import { api } from "@/services/api";

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
  created_by: string; 
}

interface CustomMenuProps {
  menus: Menu[];
  mobile_number: string;
  onMenuAdded: () => void;
}

const CustomMenu: React.FC<CustomMenuProps> = ({ menus, mobile_number, onMenuAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<Menu | null>(null);
  const [updatedMenus, setUpdatedMenus] = useState<Menu[]>(menus); // Local state for menus
  // const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Filter menus based on the mobile_number
    const filteredMenus = menus.filter(menu => menu.created_by === mobile_number);
    setUpdatedMenus(filteredMenus); // Update local state with filtered menus
  }, [menus, mobile_number]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openItemModal = (menu: Menu) => {
    setCurrentMenu(menu);
    setIsItemModalOpen(true);
  };

  const closeItemModal = () => setIsItemModalOpen(false);

  const fetchUpdatedMenus = async () => {
    // setLoading(true);
    try {
      const response = await api.get("/menus/");
      if (response.data && Array.isArray(response.data)) {
        setUpdatedMenus(response.data);
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching updated menus:", error);
    } finally {
      // setLoading(false);
    }
  };

  const handleMenuAdded = async () => {
    await onMenuAdded(); // Notify parent of menu addition
    await fetchUpdatedMenus(); // Fetch updated menus from API
  };

  return (
    <div className="relative p-4 bg-white shadow rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-700">Custom Menu</h3>
        {updatedMenus.length < 7 && (
          <button
            onClick={openModal}
            className="py-2 px-4 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700"
          >
            Add Menu
          </button>
        )}
      </div>

      {isModalOpen && (
        <AddMenuModal 
          onClose={() => {
            closeModal();
            handleMenuAdded(); // Refresh menus after closing the modal
          }} 
          onMenuAdded={handleMenuAdded} // Pass onMenuAdded prop here
        />
      )}

      {updatedMenus.length === 0 ? (
        <p className="text-center text-gray-500">No menus available</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {updatedMenus.map((menu) => (
            <div key={menu.id} className="relative p-4 border rounded-lg shadow-md">
              <button
                onClick={() => openItemModal(menu)}
                className="absolute top-2 right-2 py-1 px-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700"
              >
                Add Item
              </button>
              <h4 className="text-md font-medium text-gray-700 text-center">{menu.name}</h4>
              <p className="text-sm text-gray-600">Sub Total: QR{parseFloat(menu.sub_total as string).toFixed(2)}</p>
              <div className="mt-2">
                <h5 className="text-sm font-medium text-gray-700">Menu Items:</h5>
                <div className="flex flex-col space-y-2">
                  {menu.menu_items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <img src={item.dish.image} alt={item.dish.name} className="w-12 h-12 object-cover rounded-md" />
                      <div className="flex-1">
                      <h6 className="text-sm font-medium text-gray-700">{item.meal_type}</h6>
                        <p className="font-medium text-gray-700">{item.dish.name}</p>
                        <p className="text-sm text-gray-500">Price: QR{parseFloat(item.dish.price as string).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isItemModalOpen && currentMenu && (
        <AddItemModal
          menu={currentMenu}
          onClose={closeItemModal}
          onItemAdded={async () => {
            await handleMenuAdded(); // Update menus after adding item
            closeItemModal();
          }}
        />
      )}
    </div>
  );
};

export default CustomMenu;
