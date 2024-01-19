"use client";

import { Sidebar } from "flowbite-react";
import {
  HiArrowSmLeft,
  HiCake,
  HiChartPie,
  HiCurrencyDollar,
  HiStar,
  HiTrash,
  HiUser,
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
                  href="/serviceOwner/moderator"
                  icon={HiStar}
                  label="Owner"
                  labelColor="dark"
                >
                  Moderator
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
                  Services
                </Sidebar.Item>
                <Sidebar.Item href="/user/ownedPoes" icon={HiRocketLaunch}>
                  Recently Visited
                </Sidebar.Item>
                <Sidebar.Item href="/user/moderator" icon={HiStar}>
                  Moderator For
                </Sidebar.Item>
                <Sidebar.Item href="/user/delisted" icon={HiTrash}>
                  Delisted Reviews
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
