// import React from 'react';
// import DishItem from './DishItem';
// import { DishListProps } from '../../types';

// const DishList: React.FC<DishListProps> = ({ dishes, onAddDish }) => {
//   if (dishes.length === 0) return <div>No dishes available</div>;

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//       {dishes.map((dish) => (
//         <DishItem key={dish.id} dish={dish} onAddDish={onAddDish} />
//       ))}
//     </div>
//   );
// };

// export default DishList;

import React, { useState } from "react";
import DishItem from "./DishItem";
import { DishListProps } from "../../types";
import { Button } from "../ui/button";

const DishList: React.FC<DishListProps> = ({ dishes, onAddDish }) => {
  const [showImage, setShowImage] = useState(true);
  const [itemsPerRow, setItemsPerRow] = useState(4);

  const handleAddDish = (dish: any) => {
    onAddDish(dish);
    setItemsPerRow(4); 
  };

  return (
    <div>
      <div className="flex justify-start mb-4">
        <Button
          onClick={() => {
            setShowImage(true);
            setItemsPerRow(4);
          }}
          className={`${
            showImage ? "bg-[#6f42c1] text-white" : ''
          } rounded-lg px-3 py-1 transition-colors duration-300`}
          variant={showImage ? "default" : "outline"}
        >
          With Images
        </Button>
        <Button
          onClick={() => {
            setShowImage(false);
            setItemsPerRow(5); 
          }}
          className={`${
            !showImage ? "bg-[#6f42c1] text-white" : ''
          } rounded-lg px-3 py-1 mx-2 transition-colors duration-300`}
          variant={!showImage ? "default" : "outline"}
        >
          Without Images
        </Button>
      </div>

      <div
        className={`grid ${
          showImage
            ? `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${itemsPerRow} gap-6`
            : `grid-cols-2 sm:grid-cols-3 lg:grid-cols-${itemsPerRow} gap-6`
        }`}
      >
        {dishes.map((dish) => (
          <DishItem
            key={dish.id}
            dish={dish}
            onAddDish={handleAddDish} 
            showImage={showImage}
          />
        ))}
      </div>
    </div>
  );
};

export default DishList;
