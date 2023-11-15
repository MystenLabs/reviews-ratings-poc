"use client";

import { Sidebar } from "flowbite-react";
import {
  HiArrowSmLeft,
  HiArrowSmRight, HiCake,
  HiChartPie,
  HiCurrencyDollar,
  HiInbox,
  HiShoppingBag,
  HiTable,
  HiUser,
  HiViewBoards,
} from "react-icons/hi";
import { useAuthentication } from "@/app/hooks/useAuthentication";

export const MySidebar = () => {
  const { user, handleLogout } = useAuthentication();

  return (
    <div>
      {user.role !== "anonymous" && (
        <Sidebar aria-label="My sidecar">
          <Sidebar.Items>
            {user.role === "serviceOwner" && (
              <Sidebar.ItemGroup>
                <Sidebar.Item href="/serviceOwner" icon={HiChartPie}>
                  Dashboard
                </Sidebar.Item>
                <Sidebar.Item
                  href="/serviceOwner/ownedServices"
                  icon={HiViewBoards}
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
                  Services
                </Sidebar.Item>
                <Sidebar.Item href="/user/ownedPoes" icon={HiUser}>
                  Recently Visited
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
