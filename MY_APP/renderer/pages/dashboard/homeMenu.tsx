import * as React from 'react';
import { styled, useTheme, Theme, CSSObject, makeStyles } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import HomeIcon from '@mui/icons-material/Home';
import MailIcon from '@mui/icons-material/Mail';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AddIcon from '@mui/icons-material/Add';
import Router from 'next/router';
import { auth } from '../../utils/db';
import { useState } from 'react';
import NextLink from 'next/link';
import DoneIcon from '@mui/icons-material/Done';
import Head from 'next/head';
import PeopleIcon from '@mui/icons-material/People';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { Button, CardActions, CardContent } from '@mui/material';
import Card from '@material-ui/core/Card';
import WorkIcon from '@material-ui/icons/Work';
import { FaAmbulance } from 'react-icons/fa';
import { MdBedroomParent } from 'react-icons/md';
import { TbMedicineSyrup } from 'react-icons/tb';
import { GrCertificate } from 'react-icons/gr';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { useHotkeys } from 'react-hotkeys-hook';
import EventAvailableIcon from '@material-ui/icons/EventAvailable';

const drawerWidth = 240;
const menuRouteList = ["homeMenu", "registerPatient", "approveStaff", "manageStaff", "problemReport"]

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function homeMenu({children}) {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [role, setRole] = useState("");

    React.useEffect(() => {
        const storedRole = localStorage.getItem('role');
        setRole(storedRole);
    }, []);

    React.useEffect(() => {
      console.log(role)
    }, [role]);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleNotifOpen = () => {
      Router.push('/notification')
  };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const home = () => {
        Router.push('/homeMenu')
    };
    
    const logout = () => {
        auth.signOut()
        .then(() => {
            localStorage.removeItem('token');
            localStorage.clear();
            console.log(auth)
            Router.push('/login')
        })
        .catch((error) => {
            console.error('Error during logout:', error);
        });
    };  

    const menuItems = [
      { text: 'Home', icon: <HomeIcon />, route: 'homeMenu' },
      { text: 'Manage Job', icon: <WorkIcon />, route: 'manageJob' },
      { text: 'Manage Room', icon: <MdBedroomParent size={22} />, route: 'manageRoom' },
      { text: 'Manage Patient', icon: <AddIcon />, route: 'registerPatient' },
      { text: 'Approve New Staff', icon: <DoneIcon />, route: 'approveStaff' },
      { text: 'Manage Staff', icon: <PeopleIcon />, route: 'manageStaff' },      
      { text: 'Problem Report', icon: <ReportProblemIcon />, route: 'problemReport' },
      { text: 'Manage Ambulance', icon: <FaAmbulance size={22}/>, route: 'manageAmbulance' },
      { text: 'Appointment', icon: <EventAvailableIcon />, route: 'appointment' },
      { text: 'Medicine', icon: <TbMedicineSyrup size={24}/>, route: 'medicine' },
      { text: 'Certificate', icon: <GrCertificate size={22}/>, route: 'certificate' },

    ];

    const filteredMenuItems = menuItems.filter((item, index) => {
      if (role === 'Administration Staff') {
        // Show all menu items
        // return true;
        return index === 0 || index === 1 || index === 2 || index === 3 || index === 4 || index === 5 || index === 6 || index === 7 || index === 10;
      } else if (role === 'Doctor') {
        // Show only specific menu items for Doctor role
        return index === 0 || index === 1 || index === 2 || index === 3 || index === 6 || index === 8 || index === 10;
      } else if (role === 'Pharmacist') {
        // Show only specific menu items for Doctor role
        return index === 0 || index === 1 || index === 2 || index === 6 || index === 9;
      } else if (role === 'Nurse') {
        // Show only specific menu items for Doctor role
        return index === 0 || index === 1 || index === 2 || index === 3 || index === 6 || index === 8 || index === 10;
      } else if (role === 'Kitchen Staff') {
        // Show only specific menu items for Doctor role
        return index === 0 || index === 1 || index === 2 || index === 6;
      } else if (role === 'Cleaning Service') {
        // Show only specific menu items for Doctor role
        return index === 0 || index === 1 || index === 2 || index === 6;
      } else if (role === 'Ambulance Driver') {
        // Show only specific menu items for Doctor role
        return index === 0 || index === 1 || index === 2 || index === 6;
      }
    });

    useHotkeys('ctrl+n', () => {
      Router.push('/notification')
    });

    useHotkeys('ctrl+s+t', () => {
      Router.push('/dashboard/manageStaff')
    });

    useHotkeys('ctrl+p', () => {
      Router.push('/dashboard/registerPatient')
    });

    useHotkeys('ctrl+1', logout);

    return (
        <Box sx={{ display: 'flex' }} >
        <Head>
            <title>siLVoam Hospital</title>
        </Head>
        <CssBaseline />
        <AppBar position="fixed" open={open} sx={{ backgroundColor: '#176B87' }}>
            <Toolbar>
            <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={{
                marginRight: 5,
                ...(open && { display: 'none' }),
                }}
            >
                <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
                siLVoam Hospital
            </Typography>
            <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleNotifOpen}
                edge="start"
                sx={{
                marginLeft: 10,
                }}
            >
                <NotificationsIcon />
            </IconButton>
            </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
            <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
                {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
            </DrawerHeader>
            <Divider />
            <List>
            {filteredMenuItems.map((item, index) => (
                <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                  <NextLink
                     href={`/dashboard/${item.route}`} 
                  >
                  <ListItemButton
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                  </ListItemButton>
                  </NextLink>
                </ListItem>
              ))}
            </List>
            <Divider />
            <List>
            {['Logout'].map((text, index) => (
                <ListItem key={text} disablePadding sx={{ display: 'block' }}>
                <ListItemButton  onClick={logout}
                    sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    }}
                >
                    <ListItemIcon
                    sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                    }}
                    >
                    {index === 0 ? <ExitToAppIcon /> : <MailIcon />}
                    </ListItemIcon>
                    <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
                </ListItem>
            ))}
            </List>
        </Drawer>
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <DrawerHeader />
            {children}
        </Box>
        </Box>
    );
}