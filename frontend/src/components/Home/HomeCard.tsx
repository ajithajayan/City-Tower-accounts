import React from 'react';
import { Truck, HandPlatter, ShoppingBag } from 'lucide-react';

interface CardProps {
  card: { id: number; title: string; content: string; iconType: 'Delivery' | 'Takeaway' | 'Dining' };
  onClick: () => void;
  isActive: boolean; // New prop to check if the card is active
}

const HomeCard: React.FC<CardProps> = ({ card, onClick, isActive }) => {
  const renderIcon = () => {
    switch (card.iconType) {
      case 'Delivery':
        return <Truck className="w-24 h-24 text-white" />;
      case 'Dining':
        return <HandPlatter className="w-24 h-24 text-white" />;
      case 'Takeaway':
        return <ShoppingBag className="w-24 h-24 text-white" />;
      default:
        return null;
    }
  };

  const renderName = () => {
    switch (card.iconType) {
      case 'Delivery':
        return 'Delivery';
      case 'Dining':
        return 'Dining';
      case 'Takeaway':
        return 'Takeaway';
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`w-24 h-24 p-4 ${
        isActive ? 'bg-[#6f42c1]' : 'bg-gradient-to-r from-purple-500 to-pink-500'
      } flex flex-col items-center justify-center cursor-pointer rounded-lg shadow-lg`}
    >
      {renderIcon()}
      <p className="mt-2 text-white text-sm">{renderName()}</p>
    </div>
  );
};

export default HomeCard;
