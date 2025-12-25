import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Book, 
  Heart, 
  Settings,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  // { name: 'Message', href: '/messages', icon: MessageSquare },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Books', href: '/books', icon: Book },
  { name: 'Donation', href: '/donation', icon: Heart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={`bg-sidebar-bg border-r border-border transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    } min-h-screen relative`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-sidebar-text">Book Bridge</h1>
              <p className="text-sm text-sidebar-text/70">Admin</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-primary/10 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-sidebar-text" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-sidebar-text" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-active text-sidebar-text-active'
                  : 'text-sidebar-text hover:bg-primary/10'
              }`}
            >
              <Icon className={`w-5 h-5 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}