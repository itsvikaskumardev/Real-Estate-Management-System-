import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import BuyerSidebar from "./BuyerSidebar";
import DashboardNavbar from "./DashboardNavbar";
import { sellerLayoutStyles as s } from "../assets/dummyStyles";

const BuyerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={s.container}>
      <BuyerSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className={s.contentWrapper}>
        <DashboardNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className={s.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BuyerLayout;
