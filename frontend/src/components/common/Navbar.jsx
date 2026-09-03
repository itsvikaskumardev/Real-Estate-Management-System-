import { useState } from "react";
import { Link } from "react-router-dom";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import Logo from "./Logo";
import { navbarStyles as s } from "../../assets/dummyStyles";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = (
    <>
      <Link
        to="/properties"
        className={s.navLink}
        onClick={() => setIsOpen(false)}
      >
        Browse Properties
      </Link>

      {user && user.role === "buyer" && (
        <Link
          to="/buyer-dashboard"
          className={s.navLink}
          onClick={() => setIsOpen(false)}
        >
          Dashboard
        </Link>
      )}

      {user && user.role === "seller" && (
        <Link
          to="/dashboard"
          className={s.navLink}
          onClick={() => setIsOpen(false)}
        >
          Dashboard
        </Link>
      )}

      {user && user.role === "admin" && (
        <Link
          to="/admin-dashboard"
          className={s.navLink}
          onClick={() => setIsOpen(false)}
        >
          Admin Panel
        </Link>
      )}

      {!user && (
        <>
          <Link
            to="/login"
            className={s.navLink}
            onClick={() => setIsOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/register"
            className={s.navLink}
            onClick={() => setIsOpen(false)}
          >
            Register
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      <nav className={s.nav}>
        <div className={s.container}>
          <div className={s.grid}>
            {/* Left: Logo */}
            <div className="justify-self-start">
              <Logo />
            </div>

            {/* Center: Desktop Menu */}
            <div className={s.desktopMenu}>{navLinks}</div>

            {/* Right: Profile Section */}
            <div className={s.rightSection}>
              {user ? (
                <div className={s.userSection}>
                  <Link to="/profile" className="flex items-center">
                    <img
                      src={
                        user.profilePic ||
                        `https://ui-avatars.com/api/?name=${user.name}&background=0d6e59&color=fff`
                      }
                      alt="Profile"
                      className={s.avatar}
                    />
                  </Link>
                  <button onClick={logout} className={s.logoutButton}>
                    Logout
                  </button>
                </div>
              ) : null}

              {/* Mobile Toggle */}
              <div className={s.mobileToggle} onClick={toggleMenu}>
                {isOpen ? <HiX size={28} /> : <HiMenuAlt3 size={28} />}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      <div className={s.backdrop(isOpen)} onClick={() => setIsOpen(false)} />

      {/* Mobile Menu Drawer */}
      <div className={s.drawer(isOpen)}>
        <div className={s.drawerHeader}>
          <Logo onClick={() => setIsOpen(false)} />
          <HiX
            size={28}
            onClick={() => setIsOpen(false)}
            className={s.drawerCloseIcon}
          />
        </div>

        <div className={s.drawerNavLinks}>{navLinks}</div>

        {user && (
          <div className={s.drawerUserSection}>
            <div className={s.drawerUserInfo}>
              <img
                src={
                  user.profilePic ||
                  `https://ui-avatars.com/api/?name=${user.name}&background=0d6e59&color=fff`
                }
                alt="Profile"
                className={s.drawerAvatar}
              />
              <div>
                <div className={s.drawerUserName}>{user.name}</div>
                <div className={s.drawerUserEmail}>{user.email}</div>
              </div>
            </div>
            <button onClick={logout} className={s.drawerLogoutButton}>
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
