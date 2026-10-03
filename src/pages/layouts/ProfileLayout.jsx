import { Outlet, NavLink } from "react-router-dom";
import ProfileSideNav from "../../components/ProfileSideNav";
import { useUser } from "../../contexts/userContext";

export default function ProfileLayout() {
  const { user } = useUser();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar - hidden on mobile, visible on md and up */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <ProfileSideNav />
        </aside>

        {/* Mobile Navigation - visible only on mobile */}
        <nav className="md:hidden flex gap-2 mb-6 border-b border-gray-200">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`
            }
          >
            Profile
          </NavLink>
          <NavLink
            to="/order-history"
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`
            }
          >
            Order History
          </NavLink>
          {user?.role === "admin" && <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`
            }
          >
            Dashboard
          </NavLink>}
        </nav>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
