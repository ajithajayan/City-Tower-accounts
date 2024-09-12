import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react"; 

const RealTimeClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval); 
  }, []);

  const formattedTime = time.toLocaleTimeString();

  return (
    <div className="flex items-center text-white text-2xl">
      <Clock className="mr-2" />
      {formattedTime}
    </div>
  );
};

export default RealTimeClock;
