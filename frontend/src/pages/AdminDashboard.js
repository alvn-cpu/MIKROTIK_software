import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Avatar,
  Badge,
  Divider,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Router as RouterIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  WifiOff as WifiOffIcon,
  Wifi as WifiIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  NotificationImportant as AlertIcon,
  PersonAdd as PersonAddIcon,
  Assessment as ReportIcon,
  Schedule as ScheduleIcon,
  NetworkCheck as NetworkIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const drawerWidth = 280;

const AdminDashboard = () => {
  const [selectedView, setSelectedView] = useState('overview');

  // Sample data - in real app, this would come from API
  const dashboardStats = {
    totalUsers: 1254,
    onlineUsers: 342,
    offlineUsers: 912,
    dailyRevenue: 45670,
    monthlyRevenue: 1256780,
    activePlans: 8,
    totalTransactions: 5673,
    connectedRouters: 12,
    systemAlerts: 3
  };

  const revenueData = [
    { name: 'Mon', revenue: 4000, users: 24 },
    { name: 'Tue', revenue: 3000, users: 18 },
    { name: 'Wed', revenue: 5000, users: 32 },
    { name: 'Thu', revenue: 4500, users: 28 },
    { name: 'Fri', revenue: 6000, users: 45 },
    { name: 'Sat', revenue: 8000, users: 67 },
    { name: 'Sun', revenue: 7000, users: 52 }
  ];

  const planDistribution = [
    { name: 'Basic', value: 400, color: '#8884d8' },
    { name: 'Standard', value: 600, color: '#82ca9d' },
    { name: 'Premium', value: 254, color: '#ffc658' }
  ];

  const onlineUsers = [
    { id: 1, username: 'john_doe', ip: '192.168.1.100', plan: 'Standard', duration: '2h 15m', data: '2.3GB' },
    { id: 2, username: 'jane_smith', ip: '192.168.1.101', plan: 'Premium', duration: '45m', data: '1.2GB' },
    { id: 3, username: 'mike_wilson', ip: '192.168.1.102', plan: 'Basic', duration: '1h 30m', data: '0.8GB' }
  ];

  const recentTransactions = [
    { id: 1, user: 'Alice Johnson', amount: 500, plan: 'Premium', status: 'Completed', time: '10:30 AM' },
    { id: 2, user: 'Bob Smith', amount: 200, plan: 'Standard', status: 'Pending', time: '10:15 AM' },
    { id: 3, user: 'Carol White', amount: 50, plan: 'Basic', status: 'Completed', time: '9:45 AM' }
  ];

  const mikrotikRouters = [
    { id: 1, name: 'Main Router', ip: '192.168.1.1', status: 'Online', users: 45, uptime: '15 days' },
    { id: 2, name: 'Building A', ip: '192.168.2.1', status: 'Online', users: 32, uptime: '12 days' },
    { id: 3, name: 'Building B', ip: '192.168.3.1', status: 'Offline', users: 0, uptime: '0 days' }
  ];

  const systemAlerts = [
    { id: 1, type: 'warning', message: 'High bandwidth usage on Router 1', time: '5 min ago' },
    { id: 2, type: 'error', message: 'Building B router is offline', time: '15 min ago' },
    { id: 3, type: 'info', message: 'Daily backup completed successfully', time: '1 hour ago' }
  ];

  const menuItems = [
    { key: 'overview', icon: <DashboardIcon />, text: 'Overview' },
    { key: 'users', icon: <PeopleIcon />, text: 'User Management' },
    { key: 'plans', icon: <ReceiptIcon />, text: 'Billing Plans' },
    { key: 'transactions', icon: <PaymentIcon />, text: 'Transactions' },
    { key: 'routers', icon: <RouterIcon />, text: 'MikroTik Routers' },
    { key: 'reports', icon: <ReportIcon />, text: 'Reports & Analytics' },
    { key: 'monitoring', icon: <NetworkIcon />, text: 'Network Monitoring' },
    { key: 'settings', icon: <SettingsIcon />, text: 'System Settings' }
  ];

  const renderOverview = () => (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      
      {/* Alert Section */}
      {systemAlerts.filter(alert => alert.type === 'error').length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>System Alert:</strong> {systemAlerts.find(alert => alert.type === 'error')?.message}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h5">
                    {dashboardStats.totalUsers.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <WifiIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Online Users
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {dashboardStats.onlineUsers}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Daily Revenue
                  </Typography>
                  <Typography variant="h5">
                    KES {dashboardStats.dailyRevenue.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <RouterIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Routers
                  </Typography>
                  <Typography variant="h5">
                    {dashboardStats.connectedRouters}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Revenue & User Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue (KES)" />
                  <Line yAxisId="right" type="monotone" dataKey="users" stroke="#82ca9d" name="Users" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Plan Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Online Users
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Username</TableCell>
                      <TableCell>Plan</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {onlineUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>
                          <Chip label={user.plan} size="small" />
                        </TableCell>
                        <TableCell>{user.duration}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="error">
                            <WifiOffIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Alerts
              </Typography>
              <List>
                {systemAlerts.map((alert) => (
                  <ListItem key={alert.id}>
                    <ListItemIcon>
                      <AlertIcon 
                        color={
                          alert.type === 'error' ? 'error' : 
                          alert.type === 'warning' ? 'warning' : 'info'
                        } 
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary={alert.message}
                      secondary={alert.time}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderUserManagement = () => (
    <Box>
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Typography variant="h4">User Management</Typography>
        <Box>
          <Button variant="contained" startIcon={<PersonAddIcon />} sx={{ mr: 1 }}>
            Add User
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />}>
            Refresh
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            All Users ({dashboardStats.totalUsers})
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Current Plan</TableCell>
                  <TableCell>Total Spent</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>john_doe</TableCell>
                  <TableCell>john@example.com</TableCell>
                  <TableCell>
                    <Chip label="Online" color="success" size="small" />
                  </TableCell>
                  <TableCell>Standard</TableCell>
                  <TableCell>KES 2,450</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                {/* More users would be mapped here */}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );

  const renderMikrotikManagement = () => (
    <Box>
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Typography variant="h4">MikroTik Router Management</Typography>
        <Box>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ mr: 1 }}>
            Add Router
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />}>
            Refresh All
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {mikrotikRouters.map((router) => (
          <Grid item xs={12} md={4} key={router.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="between" alignItems="start" mb={2}>
                  <Typography variant="h6">{router.name}</Typography>
                  <Chip 
                    label={router.status} 
                    color={router.status === 'Online' ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                
                <Typography color="textSecondary" gutterBottom>
                  IP: {router.ip}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Connected Users: <strong>{router.users}</strong><br />
                  Uptime: <strong>{router.uptime}</strong>
                </Typography>

                <Box>
                  <Button size="small" variant="outlined" sx={{ mr: 1 }}>
                    Configure
                  </Button>
                  <Button size="small" variant="outlined" sx={{ mr: 1 }}>
                    Monitor
                  </Button>
                  <Button size="small" variant="outlined" color="error">
                    Restart
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Router Functions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Router Management Functions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button fullWidth variant="outlined" startIcon={<PeopleIcon />}>
                Manage Hotspot Users
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button fullWidth variant="outlined" startIcon={<SettingsIcon />}>
                Firewall Rules
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button fullWidth variant="outlined" startIcon={<NetworkIcon />}>
                Bandwidth Control
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button fullWidth variant="outlined" startIcon={<AnalyticsIcon />}>
                Traffic Analysis
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  const renderReports = () => (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6">Daily Income</Typography>
              <Typography variant="h4" color="primary">
                KES {dashboardStats.dailyRevenue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6">Monthly Income</Typography>
              <Typography variant="h4" color="primary">
                KES {dashboardStats.monthlyRevenue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6">Total Transactions</Typography>
              <Typography variant="h4" color="primary">
                {dashboardStats.totalTransactions.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6">Active Plans</Typography>
              <Typography variant="h4" color="primary">
                {dashboardStats.activePlans}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                <Typography variant="h6">Revenue Analytics</Typography>
                <Button startIcon={<DownloadIcon />}>
                  Export Report
                </Button>
              </Box>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue (KES)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderContent = () => {
    switch (selectedView) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUserManagement();
      case 'plans':
        return <Typography variant="h4">Billing Plans Management - Coming Soon</Typography>;
      case 'transactions':
        return <Typography variant="h4">Transaction Management - Coming Soon</Typography>;
      case 'routers':
        return renderMikrotikManagement();
      case 'reports':
        return renderReports();
      case 'monitoring':
        return <Typography variant="h4">Network Monitoring - Coming Soon</Typography>;
      case 'settings':
        return <Typography variant="h4">System Settings - Coming Soon</Typography>;
      default:
        return renderOverview();
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            WiFi Admin Panel
          </Typography>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.key}
              selected={selectedView === item.key}
              onClick={() => setSelectedView(item.key)}
            >
              <ListItemIcon>
                <Badge 
                  badgeContent={
                    item.key === 'overview' && dashboardStats.systemAlerts > 0 ? dashboardStats.systemAlerts : 0
                  } 
                  color="error"
                >
                  {item.icon}
                </Badge>
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        <Toolbar />
        <Container maxWidth="xl">
          {renderContent()}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard;