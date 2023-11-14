"use client";

import { WalletKitProvider } from "@mysten/wallet-kit";
import { Navbar } from "./components/navbar/Navbar";
import { AuthenticationProvider } from "./contexts/Authentication/AuthenticationProvider";
import { MySidebar } from "./components/sidebar/Sidebar";

export default function GlobalContexts({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletKitProvider>
      <AuthenticationProvider>
        <Navbar />
        <div className="grid grid-cols-12 w-full top-10">
          <div className="col-span-3 flex h-full">
            <MySidebar />
          </div>
          <div className="col-span-6 flex space-x-3 justify-center">
            <main
              className="flex"
              style={{
                height: "calc(100vh - 60px)",
              }}
            >
              {children}
            </main>
          </div>
        </div>
      </AuthenticationProvider>
    </WalletKitProvider>
  );
}
