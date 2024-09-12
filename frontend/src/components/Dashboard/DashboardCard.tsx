import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, trend }) => (
  <Card className="flex flex-col justify-between h-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <h3 className="text-sm font-medium">{title}</h3>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend !== undefined ? (
        <p className={`text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
          {trend > 0 ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
          {Math.abs(trend)}% from last period 
        </p>
      ) : (
        <div className='w-4 h-4'></div>
      )}
    </CardContent>
  </Card>
);

export default DashboardCard;
