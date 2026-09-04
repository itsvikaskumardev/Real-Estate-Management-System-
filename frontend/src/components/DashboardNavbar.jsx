import React from "react";
import { HiMenuAlt2 } from "react-icons/hi";
import Logo from "./common/Logo";
import NotificationDropdown from "./common/NotificationDropdown";
import { dashboardNavbarStyles as s } from "../assets/dummyStyles";

const DashboardNavbar = ({ onMenuClick }) => {
  return (
    <header className={s.header}>
      <button onClick={onMenuClick} className={s.menuButton}>
        <HiMenuAlt2 size={24} />
      </button>

      <div className={s.logoContainer} style={{ flex: 1 }}>
        <Logo fontSize="1.125rem" iconSize={18} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <NotificationDropdown />
      </div>
    </header>
  );
};

export default DashboardNavbar;
