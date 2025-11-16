import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, IconButton, Button } from '@mui/material';
import { LayoutDashboard, ShoppingCart, Package, Receipt, Users, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

export const drawerWidth = 240;
export const collapsedWidth = 72;

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
        py: 0,                  // Remove default vertical padding
        gap: isCollapsed ? 0 : 1, // Optional: control spacing when not collapsed
        mx: isCollapsed ? 1 : 0,
        paddingRight: isCollapsed ? 2 : 0
      }}
    >
      <ListItemIcon
        sx={{
            minWidth: 0,
            mr: isCollapsed ? 0 : 0,
            ml: 1,
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            alignItems: 'center',    
            color: 'inherit',
            width: isCollapsed ? '100%': 'auto',      
            height: 40,       
            display: 'flex',
            paddingLeft: isCollapsed ? 0.6 : 0,
        }}
      >
        <Icon size={24} />
      </ListItemIcon>
      {!isCollapsed && (
      <ListItemText
        primary={item.name}
        slotProps={{
          primary: {
            noWrap: true,
            sx: { opacity: 1, 
                  transition: 'opacity 300ms',
                  marginLeft: 2,
            },
          },
        }}
      />
    )}
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
      sx={(theme) => ({
        width: currentWidth,
        flexShrink: 0,
        position: 'fixed', 
        '& .MuiDrawer-paper': { width: currentWidth, boxSizing: 'border-box' },
        transition: 'width 300ms ease',
        height: '100vh',
        bgcolor: 'primary.secondary',
        boxShadow: 3,
        borderRight: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <Box 
        sx={{ 
          p: 2.5, 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
          mb: 0, 
          mt: 1,
          height: 60, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center': 'left',
          ml: isCollapsed ? 0: 2,
          overflow: "hidden",
        }}
      >
          <Typography
            sx={{
              fontWeight: 550,
              fontSize: "1.2rem",
              color: "white",
              textTransform: "none",
              letterSpacing: "1px",
              display: isCollapsed ? "none": "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            Mo:
            <span
              style={{
                background: "white",
                color: "#1A1A1A",
                padding: "2px 6px",
                borderRadius: "4px",
                marginLeft: "10px",
                display: isCollapsed ? "none": "block",
                fontWeight: 800,
                fontSize: "1rem",
              }}
            >
              Console
            </span>
          </Typography>

         <Typography 
          variant="h6" 
          component="div"
          sx={{
            fontWeight: 'bold',
            color: 'white',
            display: isCollapsed ? 'block' : 'none',
            fontSize: '1.2rem',
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
      
      <Box sx={{ p: 1, borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', gap: 1, alignItems: isCollapsed ? 'center' : 'stretch' }}>
        <Button
          onClick={handleLogout}
          //startIcon={!isCollapsed ? <LogOut size={20} /> : undefined}
          sx={{
            bgcolor: 'error.main',
            color: 'white',
            '&:hover': { bgcolor: 'error.dark' },
            width: '100%',
            minWidth: isCollapsed ? 0 : undefined,
            borderRadius: '4px',
            py: 1,
            px: isCollapsed ? 0 : 2,
            ...(!isCollapsed && { justifyContent: 'space-between', pr: 1 }),
            textTransform: 'none',
            gap: isCollapsed ? 0 : 1,
            alignSelf: isCollapsed ? 'center' : 'stretch',
          }}
        >
          {!isCollapsed && (
            <Typography variant="subtitle2" sx={{ ml: 1, color: 'white' }}>
              Logout
            </Typography>
          )}
          <LogOut size={20} />
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
            px: isCollapsed ? 0 : 2,
            transition: 'all 300ms ease',
            alignSelf: isCollapsed ? 'center' : 'stretch',
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