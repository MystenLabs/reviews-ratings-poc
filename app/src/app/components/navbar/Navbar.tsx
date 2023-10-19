"use client";

import Link from "next/link";
import { ConnectButton } from "@mysten/wallet-kit";
import { usePathname } from "next/navigation";
import { useGetNavigations } from "@/app/hooks/useGetNavigations";
import { isUserRole } from "@/app/helpers/isUserRole";
import { useAuthentication } from "@/app/hooks/useAuthentication";

export const Navbar = () => {
  const pathname = usePathname();
  const { navigations } = useGetNavigations();
  console.log(pathname);
  const { user, handleLogout } = useAuthentication();

  return (
    <div className="grid grid-cols-12 w-full items-center p-[8px] h-[80px] border-b-gray-400 border-b-[1px] sticky top-0">
      <div className="col-span-3 flex space-x-3 items-center">
        <div className="text-xl text-red-600 text-2xl font-bold">Restaurant Reviews</div>
      </div>

      <div className="col-span-6 flex justify-center items-center gap-[14px]">
        {navigations.map(({ title, href }) => {
          const pathParts = pathname.split("/").filter((part) => !!part);
          const pathSuffix = pathParts[pathParts.length - 1];
          const isAtHome =
            !pathParts.length ||
            (pathParts.length === 1 && pathSuffix === `${user.role}`);
          const isHomeLink = href === "/" || href === `/${user.role}`;
          const isActive =
            (isAtHome && isHomeLink) ||
            (!isHomeLink && pathname.includes(href));
          console.log({
            href,
            isAtHome,
            isHomeLink,
            pathParts,
            pathSuffix,
            isActive,
          });

          return (
            <Link
              key={href}
              className={`text-lg font-weight-500 ${
                isActive ? "underline" : ""
              }`}
              href={href}
            >
              {title}
            </Link>
          );
        })}
        {!!user.id && (
          <button
            onClick={handleLogout}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        )}
      </div>
      <div className="col-span-3 flex justify-end">
        <ConnectButton />
      </div>
    </div>
  );
};
