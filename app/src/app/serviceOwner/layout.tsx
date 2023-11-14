"use client";

import { useAuthentication } from "../hooks/useAuthentication";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthentication();
  if (user?.role !== "serviceOwner") {
    // return "Not allowed";
    return "";
  }
  return children;
}
