import { Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-muted rounded-md relative">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">AU</span>
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">Admin User</p>
              <p className="text-muted-foreground">admin@bookbridge.com</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}