"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductManager } from "@/components/admin/product-manager";
import { OrderManager } from "@/components/admin/order-manager";
import { DropManager } from "@/components/admin/drop-manager";
import { LookbookManager } from "@/components/admin/lookbook-manager";
import { useUserStore } from "@/lib/stores/userStore";
import { useRouter } from "next/navigation";

export function AdminDashboard() {
  const { isAdmin } = useUserStore();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Delay render until userStore is hydrated
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (isAdmin === false) {
        router.push("/");
      }
    }, 0); // microtask, allow hydration first

    return () => clearTimeout(timer);
  }, [isAdmin, router]);

  if (isLoading) {
    return <div className="p-6 text-center text-sm text-muted">Loading...</div>;
  }

  if (isAdmin === false) {
    return <div className="p-6 text-center text-red-500">Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="drops">Drops</TabsTrigger>
              <TabsTrigger value="lookbook">Lookbook</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-6">
              <ProductManager />
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <OrderManager />
            </TabsContent>

            <TabsContent value="drops" className="mt-6">
              <DropManager />
            </TabsContent>

            <TabsContent value="lookbook" className="mt-6">
              <LookbookManager />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
