"use client";
import React, { useEffect } from "react";
import SideNav from "./_components/SideNav";
import DashboardHeader from "./_components/DashboardHeader";
import { db } from "@/utils/dbConfig";
import { Budgets } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { useRouter, usePathname } from "next/navigation";

function DashboardLayout({ children }) {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user) {
      checkUserBudgets();
    }
  }, [user, pathname]);

  const checkUserBudgets = async () => {
    try {
      const result = await db
        .select()
        .from(Budgets)
        .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress));
      
      if (result?.length === 0 && pathname !== "/dashboard/budgets") {
        router.replace("/dashboard/budgets");
      }
    } catch (error) {
      console.error("Database lookup error:", error);
    }
  };

  return (
    <div>
      <div className="fixed md:w-64 hidden md:block">
        <SideNav />
      </div>
      <div className="md:ml-64">
        <DashboardHeader />
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;