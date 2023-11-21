"use client";

import { ConnectButton } from "@mysten/wallet-kit";
import { usePathname } from "next/navigation";
import { useAuthentication } from "@/app/hooks/useAuthentication";

export const Navbar = () => {
  const pathname = usePathname();
  console.log(pathname);
  const { user, handleLogout } = useAuthentication();

  return (
    <div
      className="grid grid-cols-12 w-full items-center p-[8px] h-[80px] border-b-gray-400 border-b-[1px] sticky top-0"
      style={{
        background: "white",
      }}
    >
      <div className="col-span-3 flex space-x-3 items-center">
        <div
          className="text-red-600 text-2xl font-bold cursor-pointer"
          onClick={handleLogout}
        >
          Restaurant Reviews
        </div>
      </div>

      <div className="col-span-6 flex space-x-3 justify-center">
        {pathname !== "/" && (
          <h6 className="mb-4 text-2xl leading-none tracking-tight text-gray-400">
            logged in as{" "}
            <span className="underline underline-offset-3 decoration-8 decoration-blue-400 dark:decoration-blue-600">
              {user.role === "user" && "USER"}
              {user.role === "serviceOwner" && "SERVICE OWNER"}
            </span>
          </h6>
        )}
      </div>

      <div className="col-span-3 flex justify-end gap-[14px]">
        <ConnectButton />
      </div>
    </div>
  );
};
