import React from "react";

const Unauthorized: React.FC = () => {
  return (
    <>
      <div className="w-full h-screen flex justify-center items-center">
        <p className="text-3xl font-extrabold mr-2">Unauthorized</p>
        <p className="text-3xl">|</p>
        <p className="text-3xl font-extrabold ml-2">401</p>
      </div>
    </>
  );
};

export default Unauthorized;
