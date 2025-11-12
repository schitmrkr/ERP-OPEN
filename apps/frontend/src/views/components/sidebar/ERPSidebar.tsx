import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, IconButton, Button } from '@mui/material';
import { LayoutDashboard, ShoppingCart, Package, Receipt, Users, Building2, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

const drawerWidth = 240;
const collapsedWidth = 72;

interface ERPSidebarProps {
    isCollapsed: boolean;
    // toggleCollapse is a synchronous function to update the state
    toggleCollapse: () => void;
  }

interface NavItem {
    name: string;
    icon: React.ComponentType<{ size: number }>;
    route: string;
}

interface SidebarNavItemProps {
item: NavItem;
isCollapsed: boolean;
isActive: boolean;
}

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, route: '/' },
  { name: 'Orders', icon: ShoppingCart, route: '/orders' },
  { name: 'Items', icon: Package, route: '/items' },
  { name: 'Expenses', icon: Receipt, route: '/expenses' },
  { name: 'Users', icon: Users, route: '/users' },
  { name: 'Organizations', icon: Building2, route: '/organizations' },
];

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ item, isCollapsed, isActive }) => {
  const navigate = useNavigate();
  const Icon = item.icon;
  const activeStyles = {
    color: 'white',
    bgcolor: 'primary.paper', 
    '&:hover': { bgcolor: 'primary.dark' },
    borderRadius: '4px',
    margin: isCollapsed ? '0 auto' : '0px 8px',
  };
  
  const defaultStyles = {
    color: 'white', 
    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
    borderRadius: '4px',
    margin: isCollapsed ? '0 auto' : '0 8px',
    
  };

  return (
    <ListItemButton
      key={item.name}
      onClick={() => navigate(item.route)}
      sx={{
        ...(isActive ? activeStyles : defaultStyles),
        minHeight: 48,
        justifyContent: 'center', // Always center content when collapsed
        alignItems: 'center',     // Ensures vertical centering
        px: isCollapsed ? 0 : 2.5,
        py: 0,                    // Remove default vertical padding
        gap: isCollapsed ? 0 : 1, // Optional: control spacing when not collapsed
      }}
    >
      <ListItemIcon
        sx={{
            minWidth: 0,
            mr: isCollapsed ? 0 : 0,
            ml: 1,
            justifyContent: 'center',
            alignItems: 'center',     // Ensures icon is vertically centered
            color: 'inherit',
            width: 40,                // Optional: fixed width for consistency
            height: 40,               // Optional: fixed height to center icon
          display: 'flex',
        }}
      >
        <Icon size={24} />
      </ListItemIcon>
      <ListItemText
        primary={item.name}
        slotProps={{
            primary: {
                noWrap: true,
                sx: { opacity: isCollapsed ? 0 : 1, transition: 'opacity 300ms' },
            }
        }}
      />
    </ListItemButton>
  );
};



const ERPSidebar: React.FC<ERPSidebarProps> = ({ isCollapsed, toggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentWidth = isCollapsed ? collapsedWidth : drawerWidth;
  const ToggleIcon = isCollapsed ? ChevronRight : ChevronLeft;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      component="nav"
      sx={{
        width: currentWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: currentWidth, boxSizing: 'border-box' },
        transition: 'width 300ms ease',
        height: '100vh',
        bgcolor: 'primary.secondary',
        boxShadow: 3,
        borderRight: "1px solid gray",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box 
        sx={{ 
          p: 2.5, 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
          mb: 1, 
          height: 80, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography 
          variant="h6" 
          noWrap 
          component="div"
          sx={{
            fontWeight: 'bold',
            color: 'white',
            display: isCollapsed ? 'none' : 'block',
            overflow: 'hidden',
            fontSize: '1.3rem'
          }}
        >
          Mo:
        </Typography>
         <Typography 
          variant="h6" 
          component="div"
          sx={{
            fontWeight: 'bold',
            color: 'white',
            display: isCollapsed ? 'block' : 'none',
            fontSize: '1.3rem',
          }}
        >
          M:
        </Typography>
      </Box>

      <List sx={{ px: isCollapsed ? 0 : 1, flexGrow: 1 }}>
        {navItems.map((item) => (
          <SidebarNavItem 
            key={item.name} 
            item={item} 
            isCollapsed={isCollapsed} 
            isActive={location.pathname === item.route} 
          />
        ))}
      </List>
      
      <Box sx={{ p: isCollapsed ? 1 : 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          startIcon={!isCollapsed ? <LogOut size={20} /> : undefined}
          sx={{
            bgcolor: 'error.main',
            color: 'white',
            '&:hover': { bgcolor: 'error.dark' },
            width: '100%',
            borderRadius: '4px',
            py: 1.5,
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            textTransform: 'none',
            gap: isCollapsed ? 0 : 1,
          }}
        >
          {isCollapsed ? <LogOut size={20} /> : 'Logout'}
        </Button>

        {/* Collapse Button */}
        <IconButton
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          sx={{
            bgcolor: 'primary.dark',
            color: 'white',
            '&:hover': { bgcolor: 'primary.light' },
            width: '100%',
            borderRadius: '4px',
            py: 1,
            transition: 'all 300ms ease',
            ...(!isCollapsed && { justifyContent: 'space-between', pr: 1 }),
          }}
        >
          {!isCollapsed && (
            <Typography variant="subtitle2" sx={{ ml: 1, color: 'white' }}>
              Collapse
            </Typography>
          )}
          <ToggleIcon size={20} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ERPSidebar;