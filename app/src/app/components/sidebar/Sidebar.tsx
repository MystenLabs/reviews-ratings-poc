"use client";

import { Sidebar } from "flowbite-react";
import {
  HiArrowSmLeft,
  HiArrowSmRight,
  HiChartPie,
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
                  label="Owned"
                  labelColor="dark"
                >
                  Services
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
