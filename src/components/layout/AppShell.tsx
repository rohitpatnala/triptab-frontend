
import type { ReactNode } from "react";

import SideBar from "./SideBar";

import "./AppShell.css";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <SideBar />

      <div className="app-workspace">
        {children}
      </div>
    </div>
  );
}
