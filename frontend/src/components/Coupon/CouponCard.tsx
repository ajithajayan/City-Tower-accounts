import React, { useState } from 'react';
import { Info, Copy } from 'lucide-react';

interface CouponCardProps {
  id: number;
  code: string;
  discountAmount: string;
  discountPercentage: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit: number;
  usageCount: number;
  minPurchaseAmount: string;
  description: string;
  isExpanded: boolean;
  onInfoClick: () => void;
}

const CouponCard: React.FC<CouponCardProps> = ({
  code,
  discountAmount,
  discountPercentage,
  startDate,
  endDate,
  isActive,
  usageLimit,
  usageCount,
  minPurchaseAmount,
  description,
  isExpanded,
  onInfoClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    alert('Coupon code copied to clipboard!');
  };

  return (
    <div
      className="relative bg-customLightPurple p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        className="absolute top-2 right-2 text-red-500 hover:text-gray-700 transition"
        onClick={onInfoClick}
      >
        <Info />
      </button>

      <div className="text-center my-4">
        <h3 className="text-xl font-bold">
          {isHovered ? '' : 'Redeem Code'}
        </h3>
        <div className="text-2xl font-bold mt-2 mb-2">
          {discountAmount ? `QAR ${discountAmount}` : discountPercentage ? `${discountPercentage}%` : 'No Discount'}
        </div>
        <div className="flex items-center space-x-2">
          {isHovered && (
            <>
              <p className="border rounded-full px-2 py-1 bg-gray-100 text-gray-700 text-sm">
                {code}
              </p>
              <button className="text-black hover:text-blue-700 transition" onClick={handleCopyCode}>
                <Copy size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 text-sm">
          <p>{description}</p>
          <p className="mt-2">Start Date: {new Date(startDate).toLocaleDateString()}</p>
          <p>End Date: {new Date(endDate).toLocaleDateString()}</p>
          <p>Active: {isActive ? 'Yes' : 'No'}</p>
          <p>Usage Limit: {usageLimit}</p>
          <p>Usage Count: {usageCount}</p>
          <p>Minimum Purchase Amount: {minPurchaseAmount}</p>
        </div>
      )}
    </div>
  );
};

export default CouponCard;