"use client";

import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { networkConfig } from "../config/networks";
import { Navbar } from "./components/navbar/Navbar";
import { AuthenticationProvider } from "./contexts/Authentication/AuthenticationProvider";
import { MySidebar } from "./components/sidebar/Sidebar";

// Create a query client for React Query
const queryClient = new QueryClient();

export default function GlobalContexts({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider>
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
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
