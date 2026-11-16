import { Link } from "react-router";
import { Bell, Menu } from "lucide-react";

import useAuthUser from "../hooks/useAuthUser.js";
import ThemeSelector from "./ThemeSelector.jsx";
import BrandLogo from "./BrandLogo.jsx";

const Navbar = ({ onToggleSidebar, showSidebarToggle = false }) => {
  const { authUser } = useAuthUser();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-indigo-300/10 bg-[#0c1427]/95 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {showSidebarToggle && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-white"
          >
            <Menu size={21} />
          </button>
        )}

        <BrandLogo size="md" />
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <Link
          to="/notifications"
          aria-label="Notifications"
          title="Notifications"
          className="relative flex size-10 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
          <Bell size={20} />
        </Link>

        <ThemeSelector />

        <div
          className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-violet-400/30 bg-indigo-950"
          title={authUser?.fullName || "Your profile"}
        >
          {authUser?.profilePic ? (
            <img
              src={authUser.profilePic}
              alt={authUser.fullName || "Your profile"}
              className="size-full object-cover"
            />
          ) : (
            <span className="font-semibold text-violet-200">
              {(authUser?.fullName || "U")
                .charAt(0)
                .toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;


