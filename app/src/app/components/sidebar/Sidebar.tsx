"use client";

import { Sidebar } from "flowbite-react";
import {
  HiArrowSmLeft,
  HiCake,
  HiChartPie,
  HiChartSquareBar,
  HiCurrencyDollar,
  HiStar,
  HiTrash,
  HiUser,
  HiPlus,
  HiMinus,
} from "react-icons/hi";
import { useAuthentication } from "@/app/hooks/useAuthentication";
import { HiRocketLaunch } from "react-icons/hi2";
import { usePathname } from "next/navigation";

export const MySidebar = () => {
  const pathname = usePathname();
  const { user, handleLogout } = useAuthentication();

  return (
    <div>
      {pathname !== "/" && (
        <Sidebar aria-label="My sidecar">
          <Sidebar.Items>
            {user.role === "serviceOwner" && (
              <Sidebar.ItemGroup>
                <Sidebar.Item href="/serviceOwner" icon={HiChartPie}>
                  Dashboard
                </Sidebar.Item>
                <Sidebar.Item
                  href="/serviceOwner/ownedServices"
                  icon={HiUser}
                  label="Owner"
                  labelColor="dark"
                >
                  Customer
                </Sidebar.Item>
                <Sidebar.Item
                  href="/serviceOwner/topUp"
                  icon={HiCurrencyDollar}
                  label="Owner"
                  labelColor="dark"
                >
                  Top Up
                </Sidebar.Item>
                <Sidebar.Item
                  href="/serviceOwner/reward"
                  icon={HiCake}
                  label="Owner"
                  labelColor="dark"
                >
                  Reward
                </Sidebar.Item>
              </Sidebar.ItemGroup>
            )}

            {user.role === "user" && (
              <Sidebar.ItemGroup>
                <Sidebar.Item href="/user" icon={HiChartPie}>
                  Top Reviews
                </Sidebar.Item>
                <Sidebar.Item href="/user/reviews" icon={HiChartSquareBar}>
                  Reviews
                </Sidebar.Item>
                <Sidebar.Item href="/user/ownedPoes" icon={HiRocketLaunch}>
                  Recently Visited
                </Sidebar.Item>
              </Sidebar.ItemGroup>
            )}

            {user.role === "moderator" && (
              <Sidebar.ItemGroup>
                <Sidebar.Item href="/moderator" icon={HiStar}>
                  Services
                </Sidebar.Item>
                <Sidebar.Item
                  href="/moderator/add"
                  icon={HiPlus}
                  label="Admin"
                  labelColor="dark"
                >
                  Add
                </Sidebar.Item>
                <Sidebar.Item
                  href="/moderator/delete"
                  icon={HiMinus}
                  label="Owner"
                  labelColor="dark"
                >
                  Delete
                </Sidebar.Item>
              </Sidebar.ItemGroup>
            )}

            <Sidebar.ItemGroup>
              <Sidebar.Item onClick={handleLogout} icon={HiArrowSmLeft}>
                Logout
              </Sidebar.Item>
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </Sidebar>
      )}
    </div>
  );
};
