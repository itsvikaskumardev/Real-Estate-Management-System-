import React from "react";
import { NavLink } from "react-router-dom";
import {
  HiOutlineViewGrid,
  HiOutlineHeart,
  HiOutlineChat,
  HiOutlineLocationMarker,
  HiOutlineSearch,
  HiOutlineUser,
  HiOutlineSupport,
  HiOutlineLogout,
} from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import Logo from "./common/Logo";
import { sellerSidebarStyles as s } from "../assets/dummyStyles";

const BuyerSidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();

  const navItems = [
    { name: "Dashboard", icon: HiOutlineViewGrid, path: "/buyer-dashboard" },
    { name: "Wishlist", icon: HiOutlineHeart, path: "/wishlist" },
    { name: "My Inquiries", icon: HiOutlineChat, path: "/inquiries" },
    { name: "Messages", icon: HiOutlineChat, path: "/chat-messages" },
    { name: "My Visits", icon: HiOutlineLocationMarker, path: "/my-visits" },
    { name: "Saved Searches", icon: HiOutlineSearch, path: "/saved-searches" },
    { name: "Profile", icon: HiOutlineUser, path: "/profile" },
    { name: "Support", icon: HiOutlineSupport, path: "/contact" },
  ];

  return (
    <>
      <div
        className={`${s.backdrop} ${isOpen ? s.backdropVisible : s.backdropHidden}`}
        onClick={onClose}
      />

      <aside
        className={`${s.sidebar} ${isOpen ? s.sidebarOpen : s.sidebarClosed}`}
      >
        <div className={s.logoContainer}>
          <Logo fontSize="1.25rem" iconSize={20} />
        </div>

        <nav className={s.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `${s.navLink} ${isActive ? s.navLinkActive : s.navLinkInactive}`
              }
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className={s.logoutContainer}>
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className={s.logoutButton}
          >
            <HiOutlineLogout size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default BuyerSidebar;
