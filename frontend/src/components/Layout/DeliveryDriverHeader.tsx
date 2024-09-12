import LogoutBtn from "./LogoutBtn";

export const DeliveryDriverHeader = () => {
  return (
    <header className="w-full flex gap-2 justify-between items-center">
      <div className="flex items-center justify-center">
        <img
          src="/images/nasscript_full_banner_logo.png"
          alt="Logo"
          className="block h-8 w-auto"
        />
      </div>
      <div className="flex justify-end">
        <LogoutBtn />
      </div>
    </header>
  );
};
