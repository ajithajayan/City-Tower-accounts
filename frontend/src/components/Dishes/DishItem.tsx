// import React from "react";
// import { DishItemProps } from "../../types";
// import { Plus } from "lucide-react";
// import { Button } from "../ui/button";

// const DishItem: React.FC<DishItemProps> = ({ dish, onAddDish }) => {
//   return (
//     <div className="flex flex-col justify-between bg-white shadow-md rounded-lg p-4">
//       <div>
//         <img
//           src={dish.image}
//           alt={dish.name}
//           className="w-full h-48 object-cover mb-4 rounded"
//         />
//         <h3 className="text-xl font-semibold mb-2">{dish.name}</h3>
//         <p className="text-gray-600 mb-2">{dish.description}</p>
//       </div>
//       <div className="flex justify-between items-center mt-2">
//         <span className="text-lg font-bold">QAR {dish.price}</span>
//         <Button
//           variant="ghost"
//           onClick={() => onAddDish(dish)}
//           className="ml-2"
//         >
//           <Plus size={24} />
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default DishItem;


import React from "react";
import { DishItemProps } from "../../types";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";

interface DishItemWithToggleProps extends DishItemProps {
  showImage: boolean;
}

const DishItem: React.FC<DishItemWithToggleProps> = ({ dish, onAddDish, showImage }) => {
  return (
    <div
      onClick={() => onAddDish(dish)}
      className={`flex flex-col justify-between bg-white shadow-md rounded-lg p-4 transition-all duration-300 ${
        showImage ? "w-full" : "w-full" 
      }`}
    >
      {showImage && (
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-48 object-cover mb-4 rounded"
        />
      )}
      <h3 className="text-xl font-semibold mb-2">{dish.name}</h3>
      <p className="text-gray-600 mb-2">{dish.description}</p>
      <div className="flex justify-between items-center mt-2">
        <span className="text-lg font-bold">QAR {dish.price}</span>
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation(); // Prevent the outer div click event from being triggered
            onAddDish(dish);
          }}
          className="ml-2"
        >
          <Plus size={24} />
        </Button>
      </div>
    </div>
  );
};

export default DishItem;
