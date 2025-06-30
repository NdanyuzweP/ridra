# Ridra Admin Dashboard

A comprehensive React web dashboard for managing the Ridra bus tracking platform. Built with React, TypeScript, and modern web technologies.

## Features

### 🎛️ **Complete Platform Management**
- **Dashboard Overview**: Real-time analytics and key performance indicators
- **User Management**: Manage all users, drivers, and administrators
- **Bus Fleet Management**: Complete bus inventory and assignment control
- **Route Management**: Create and manage bus routes with pickup points
- **Schedule Management**: Oversee all bus schedules and timing
- **Analytics**: Comprehensive insights and performance metrics

### 👥 **User Management**
- **User Roles**: Manage users, drivers, and administrators
- **Status Control**: Activate/deactivate user accounts
- **Role Assignment**: Change user roles and permissions
- **User Analytics**: Track user engagement and activity

### 🚌 **Fleet Management**
- **Bus Inventory**: Complete bus database with specifications
- **Driver Assignment**: Assign drivers to specific buses
- **Route Assignment**: Connect buses to their designated routes
- **Real-time Status**: Monitor online/offline status of buses
- **Capacity Management**: Track bus capacity and utilization

### 🗺️ **Route & Location Management**
- **Route Creation**: Design and manage bus routes
- **Pickup Points**: Add and manage pickup locations with GPS coordinates
- **Route Analytics**: Performance metrics for each route
- **Geographic Management**: Visual route planning and optimization

### 📊 **Analytics & Reporting**
- **Performance Metrics**: Key performance indicators and trends
- **Revenue Analytics**: Financial performance and revenue tracking
- **User Engagement**: User activity and platform usage statistics
- **Operational Insights**: Bus utilization and efficiency metrics

### ⚙️ **System Administration**
- **Settings Management**: Platform configuration and preferences
- **Database Management**: Backup and maintenance tools
- **Security Controls**: User permissions and access management
- **Notification System**: Email and SMS notification management

## Technology Stack

### **Frontend**
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development with full IntelliSense
- **React Router**: Client-side routing and navigation
- **Recharts**: Beautiful and responsive data visualization
- **React Hot Toast**: Elegant notification system

### **Styling & UI**
- **Custom CSS**: Tailored design system matching mobile apps
- **Responsive Design**: Works perfectly on all screen sizes
- **Dark/Light Theme**: Complete theme switching capability
- **Modern Components**: Professional UI components and layouts

### **State Management**
- **React Context**: Centralized state management
- **Custom Hooks**: Reusable data fetching and management
- **Local Storage**: Persistent user preferences

### **API Integration**
- **RESTful API**: Full integration with backend services
- **Real-time Updates**: Live data synchronization
- **Error Handling**: Comprehensive error management
- **Loading States**: Smooth user experience with loading indicators

## Installation and Setup

### **Prerequisites**
- Node.js 16+ and npm
- Backend API running on port 3001
- Admin user account in the database

### **Installation Steps**

1. **Navigate to admin directory**
   ```bash
   cd admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Create .env file (optional)
   echo "REACT_APP_API_URL=http://localhost:3001/api" > .env
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Access the dashboard**
   - Open http://localhost:3000
   - Login with admin credentials

### **Production Build**
```bash
npm run build
```

## Project Structure

```
admin/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Layout.tsx     # Main layout with navigation
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── contexts/          # React contexts
│   │   ├── AuthContext.tsx    # Authentication state
│   │   └── ThemeContext.tsx   # Theme management
│   ├── pages/             # Main application pages
│   │   ├── Dashboard.tsx      # Overview dashboard
│   │   ├── Users.tsx          # User management
│   │   ├── Drivers.tsx        # Driver management
│   │   ├── Buses.tsx          # Bus fleet management
│   │   ├── Routes.tsx         # Route management
│   │   ├── PickupPoints.tsx   # Pickup point management
│   │   ├── Schedules.tsx      # Schedule management
│   │   ├── Analytics.tsx      # Analytics dashboard
│   │   ├── Settings.tsx       # System settings
│   │   └── Login.tsx          # Authentication
│   ├── services/          # API services
│   │   └── api.ts         # Backend communication
│   ├── index.css          # Global styles
│   ├── App.tsx            # Main application component
│   └── index.tsx          # Application entry point
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Key Features Breakdown

### **Dashboard Overview**
- Real-time statistics and KPIs
- Interactive charts and graphs
- Recent activity feed
- Quick action buttons
- Performance metrics

### **User Management**
- Comprehensive user listing with pagination
- Advanced filtering and search
- Role-based access control
- User status management
- Bulk operations support

### **Fleet Management**
- Complete bus inventory
- Driver-bus assignments
- Real-time location tracking
- Maintenance scheduling
- Utilization analytics

### **Route Planning**
- Interactive route creation
- GPS-based pickup points
- Route optimization tools
- Performance analytics
- Schedule integration

### **Analytics Dashboard**
- Revenue tracking and forecasting
- User engagement metrics
- Operational efficiency reports
- Custom date range analysis
- Export capabilities

## API Integration

### **Authentication**
- JWT-based authentication
- Role-based access control
- Session management
- Automatic token refresh

### **Data Management**
- Real-time data synchronization
- Optimistic updates
- Error handling and retry logic
- Caching for performance

### **Security**
- Secure API communication
- Input validation and sanitization
- XSS and CSRF protection
- Rate limiting compliance

## Design System

### **Color Palette**
- **Primary**: #16697a (Teal)
- **Secondary**: #52796f (Sage)
- **Success**: #28a745 (Green)
- **Warning**: #ffc107 (Amber)
- **Error**: #dc3545 (Red)

### **Typography**
- **Font Family**: Inter (Google Fonts)
- **Weights**: Regular (400), Medium (500), SemiBold (600), Bold (700)
- **Responsive scaling**: Optimized for all screen sizes

### **Components**
- Consistent button styles and states
- Form components with validation
- Data tables with sorting and filtering
- Modal dialogs and overlays
- Toast notifications

## Development Guidelines

### **Code Quality**
- TypeScript for type safety
- ESLint for code quality
- Consistent naming conventions
- Component composition patterns

### **Performance**
- Lazy loading for routes
- Optimized re-renders
- Efficient data fetching
- Image optimization

### **Accessibility**
- WCAG 2.1 compliance
- Keyboard navigation
- Screen reader support
- High contrast support

## Deployment

### **Build Process**
```bash
npm run build
```

### **Deployment Options**
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: CloudFront, CloudFlare
- **Traditional Hosting**: Apache, Nginx

### **Environment Configuration**
- Production API endpoints
- Analytics tracking
- Error monitoring
- Performance monitoring

## Security Considerations

### **Authentication**
- Secure token storage
- Automatic logout on inactivity
- Role-based route protection
- API request authentication

### **Data Protection**
- Input sanitization
- XSS prevention
- CSRF protection
- Secure communication (HTTPS)

## Monitoring and Analytics

### **Performance Monitoring**
- Page load times
- API response times
- Error tracking
- User interaction analytics

### **Business Metrics**
- User engagement
- Feature usage
- Conversion rates
- System performance

## Support and Maintenance

### **Regular Updates**
- Security patches
- Feature enhancements
- Performance optimizations
- Bug fixes

### **Backup and Recovery**
- Database backups
- Configuration backups
- Disaster recovery procedures
- Data retention policies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request
5. Ensure code quality and documentation

## License

This project is licensed under the MIT License.

---

**Ridra Admin Dashboard** - Professional platform management for Rwanda's bus tracking system.