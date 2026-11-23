
import { NavLink } from "react-router-dom";

import {
  Home24Regular,
  Airplane24Regular,
} from "@fluentui/react-icons";

import "./SideBar.css";

const navigationItems = [
  {
    label: "Overview",
    path: "/",
    icon: <Home24Regular />,
  },
  {
    label: "My trips",
    path: "/trips",
    icon: <Airplane24Regular />,
  },
];

export default function SideBar() {
  return (
    <aside className="azure-sidebar">
      <div className="sidebar-section-label">
        WORKSPACE
      </div>

      <nav className="sidebar-navigation">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="sidebar-link-icon">
              {item.icon}
            </span>

            <span className="sidebar-link-label">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

    </aside>
  );
}
