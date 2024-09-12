import React, { useState, useEffect } from "react";
import { fetchDriverProfile, updateDriverStatus } from "@/services/api";
import { DeliveryDriver } from "@/types";
import { useSelector } from "react-redux";
import Loader from "@/components/Layout/Loader";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export const DeliveryDriverProfile: React.FC = () => {
  const driverId = useSelector((state: any) => state.auth.user?.driver_profile);
  const [driver, setDriver] = useState<DeliveryDriver | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const response = await fetchDriverProfile(driverId);
      setDriver(response.data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (driver) {
      await updateDriverStatus(driverId, "toggle_active");
      getProfile();
    }
  };

  const handleToggleAvailable = async () => {
    if (driver) {
      await updateDriverStatus(driverId, "toggle_available");
      getProfile();
    }
  };

  if (isLoading || !driver) {
    return <Loader />;
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold">Profile</h1>
        </CardHeader>
        <CardContent className="py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Username:</p>
              <p className="text-gray-600">{driver.username}</p>
            </div>
            <div>
              <p className="font-medium">Email:</p>
              <p className="text-gray-600">{driver.email}</p>
            </div>
            <div>
              <p className="font-medium">Mobile:</p>
              <p className="text-gray-600">{driver.mobile_number}</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Active</span>
              <Switch
                checked={driver.is_active}
                onCheckedChange={handleToggleActive}
              />
            </div>
            {driver.is_active && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Available for Orders</span>
                <Switch
                  checked={driver.is_available}
                  onCheckedChange={handleToggleAvailable}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
