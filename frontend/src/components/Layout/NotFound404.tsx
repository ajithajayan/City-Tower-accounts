import React from "react";

const NotFound404: React.FC = () => {
  return (
      <div className="w-full h-screen flex justify-center items-center">
        <p className="text-3xl font-extrabold mr-2">Not Found</p>
        <p className="text-3xl">|</p>
        <p className="text-3xl font-extrabold ml-2">404</p>
      </div>
  );
};

export default NotFound404;
