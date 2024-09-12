import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import CouponCard from '../components/Coupon/CouponCard';
import { api } from '@/services/api';

interface Coupon {
  id: number;
  code: string;
  discount_amount: string;
  discount_percentage: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  usage_limit: number;
  usage_count: number;
  min_purchase_amount: string;
  description: string;
}

const CouponPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [expandedCouponId, setExpandedCouponId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await api.get('/coupons/');
        setCoupons(response.data);
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    };

    fetchCoupons();
  }, []);

  const handleInfoClick = (id: number) => {
    setExpandedCouponId((prevId) => (prevId === id ? null : id));
  };

  return (
    <Layout>
      <div className="coupon-page p-4">
        <h1 className="text-2xl font-bold mb-4">Coupons</h1>
        <div className="coupon-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              id={coupon.id}
              code={coupon.code}
              discountAmount={coupon.discount_amount}
              discountPercentage={coupon.discount_percentage}
              startDate={coupon.start_date}
              endDate={coupon.end_date}
              isActive={coupon.is_active}
              usageLimit={coupon.usage_limit}
              usageCount={coupon.usage_count}
              minPurchaseAmount={coupon.min_purchase_amount}
              description={coupon.description}
              isExpanded={expandedCouponId === coupon.id}
              onInfoClick={() => handleInfoClick(coupon.id)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CouponPage;