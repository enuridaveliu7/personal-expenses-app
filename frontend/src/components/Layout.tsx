import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut, Home, FolderTree, Receipt } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/categories", label: "Categories", icon: FolderTree },
    { path: "/transactions", label: "Transactions", icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

    
      <nav className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">

           
            <div className="flex items-center space-x-8">
              
              <Link to="/dashboard" className="text-xl font-bold tracking-tight">
                Expenses
              </Link>

              <div className="flex space-x-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link key={item.path} to={item.path}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className="flex items-center gap-2 rounded-lg"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>

           
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {user?.name}
              </span>

              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>

          </div>
        </div>
      </nav>

     
      <main className="container mx-auto px-6 py-10">
        {children}
      </main>

    </div>
  );
};

export default Layout;
