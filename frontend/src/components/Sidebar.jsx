import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser.js";

import {
  Bell,
  Home,
  MessageCircle,
  LogOut,
} from "lucide-react";

import useLogout from "../hooks/useLogout.js";
import BrandLogo from "./BrandLogo.jsx";

const Sidebar = ({ expanded }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const { logoutMutation, isPending } = useLogout();

  const isHome = location.pathname === "/";
  const isChat = location.pathname.startsWith("/chat");
  const isNotifications = location.pathname === "/notifications";

  const navItems = [
    {
      label: "Home",
      icon: Home,
      to: "/",
      active: isHome,
    },
    {
      label: "Chat",
      icon: MessageCircle,
      to: "/chat",
      active: isChat,
    },
    {
      label: "Notifications",
      icon: Bell,
      to: "/notifications",
      active: isNotifications,
    },
  ];

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-indigo-300/10
      bg-[#0c1427] transition-[width] duration-300 lg:flex
      ${expanded ? "w-64" : "w-[76px]"}`}
    >
      {/* Brand */}
      <div
        className={`flex h-20 shrink-0 items-center border-b border-white/5
        ${expanded ? "justify-start px-5" : "justify-center px-2"}`}
      >
        <BrandLogo
          size="md"
          collapsed={!expanded}
          className={!expanded ? "justify-center" : ""}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-6">
        {navItems.map(({ label, icon: Icon, to, active }) => (
          <Link
            key={label}
            to={to}
            title={!expanded ? label : undefined}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={`group flex min-h-12 items-center gap-3 rounded-xl
              transition-colors duration-200
              ${
                expanded
                  ? "px-4"
                  : "justify-center px-2"
              }
              ${
                active
                  ? "bg-gradient-to-r from-violet-600/35 to-indigo-600/25 text-white ring-1 ring-violet-400/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
          >
            <Icon
              className={`size-5 shrink-0 ${
                active
                  ? "text-violet-300"
                  : "text-slate-400 group-hover:text-violet-300"
              }`}
            />

            {expanded && (
              <span className="truncate text-sm font-medium">
                {label}
              </span>
            )}

            {active && expanded && (
              <span className="ml-auto size-1.5 rounded-full bg-violet-400" />
            )}
          </Link>
        ))}
      </nav>

      {/* Profile */}
      <div className="border-t border-white/10 p-3">
        <div
          className={`flex items-center gap-3 rounded-xl p-2
          ${expanded ? "" : "justify-center"}`}
          title={!expanded ? authUser?.fullName : undefined}
        >
          <div className="relative size-10 shrink-0">
            <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-indigo-950 ring-2 ring-violet-400/30">
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

            <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-[#0c1427] bg-emerald-400" />
          </div>

          {expanded && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {authUser?.fullName || "Your Profile"}
              </p>

              <p className="mt-0.5 text-xs text-emerald-400">
                Account
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => logoutMutation()}
          disabled={isPending}
          title={!expanded ? "Log out" : undefined}
          aria-label="Log out"
          className={`mt-3 flex min-h-11 w-full items-center gap-3 rounded-xl
            text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300
            disabled:cursor-not-allowed disabled:opacity-50
            ${expanded ? "px-4" : "justify-center px-2"}`}
        >
          <LogOut className="size-5 shrink-0" />

          {expanded && (
            <span className="text-sm font-medium">
              {isPending ? "Logging out..." : "Log out"}
            </span>
          )}
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;