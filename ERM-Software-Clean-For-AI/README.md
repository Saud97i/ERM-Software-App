# ERM Software - Enterprise Risk Management Tool

A comprehensive, professional-grade Enterprise Risk Management application built with modern web technologies, featuring ISO 31000 compliance and international design standards.

## 🚀 Features

### Core Functionality
- **Risk Assessment Matrix** with interactive heatmap visualization
- **Workflow Management** with role-based approvals
- **User & Team Management** with dynamic assignments
- **Department Knowledge Base** with collaborative editing
- **Comprehensive Reporting** with export capabilities
- **Real-time Inbox** for workflow notifications

### Enhanced UI/UX
- **Professional Design** following Apple-inspired principles
- **Smooth Animations** and transitions throughout
- **Responsive Layout** optimized for all devices
- **Accessibility Compliant** (WCAG 2.1 AA)
- **Modern Component Library** built with Shadcn/ui

### Security & Access Control
- **Role-Based Access Control** (RBAC)
- **Department-level Restrictions** for data privacy
- **Secure Authentication** with JWT tokens
- **Audit Trail** for all system changes

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **UI Components**: Shadcn/ui, Lucide React Icons
- **Backend**: Node.js, Express.js
- **Database**: SQLite3 with Knex.js ORM
- **Authentication**: JWT with bcrypt password hashing
- **Styling**: Tailwind CSS with custom design system

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd ERM-Software

# Install dependencies
npm install

# Run database migrations
npm run migrate

# Seed the database with sample data
npm run seed

# Start the development server
npm run dev

# In another terminal, start the backend
npm run server
```

The application will be available at `http://localhost:5173`

## 🔐 Demo Credentials

### Admin Access
- **Email**: `admin@company.com`
- **Password**: `Admin123!`

### Department Users
- **Marketing Owner**: `omar@co.com` / `Owner123!`
- **Operations Owner**: `ali@co.com` / `Owner123!`
- **Marketing Champion**: `lina@co.com` / `Champion123!`
- **Operations Champion**: `sara@co.com` / `Champion123!`
- **Team Member**: `ahmed@co.com` / `Team123!`
- **Executive**: `exec@co.com` / `Executive123!`

## 🎯 User Roles & Permissions

### Admin
- Full system access
- User management
- Team assignments
- System configuration

### Risk Owner
- Department-level risk management
- Risk approval workflows
- Team oversight

### Risk Champion
- Risk identification and assessment
- Mitigation action planning
- Workflow initiation

### Team Member
- Risk submission
- Action execution
- Limited data access

### Executive
- Read-only access
- Risk overview and reporting
- Strategic decision support

## 📊 Key Features

### 1. Interactive Risk Matrix
- **Clickable cells** showing detailed risk information
- **Bubble view** with size-based risk representation
- **Professional color coding** aligned with risk severity
- **Smart tooltips** with contextual information

### 2. Workflow Management
- **Automated routing** based on user roles
- **Cross-department actions** with approval workflows
- **Real-time notifications** via inbox system
- **Comment and approval** tracking

### 3. User Management
- **Two-panel interface** for users and teams
- **Dynamic team assignments** with visual hierarchy
- **Role-based permissions** with department restrictions
- **Password management** and user activation

### 4. Department Knowledge
- **Full-page modal** for comprehensive editing
- **Collaborative suggestions** with approval workflows
- **Process documentation** and risk examples
- **Team assignment** integration

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
PORT=8081
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Database Configuration
The application uses SQLite by default. Database files are stored in `server/data/`.

### Customization
- **Risk scales** can be configured in the admin panel
- **Department structure** is fully customizable
- **Workflow rules** can be modified per organization needs

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first** approach
- **Touch-friendly** interface elements
- **Adaptive layouts** for all screen sizes
- **Optimized navigation** for mobile devices

## ♿ Accessibility

- **WCAG 2.1 AA** compliance
- **Keyboard navigation** support
- **Screen reader** compatibility
- **High contrast** mode support
- **Focus management** for all interactive elements

## 🚀 Development

### Available Scripts
```bash
npm run dev          # Start frontend development server
npm run server       # Start backend server
npm run build        # Build for production
npm run preview      # Preview production build
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data
npm run reset-admin  # Reset admin password
```

### Project Structure
```
src/
├── components/      # Reusable UI components
├── pages/          # Page components
├── lib/            # Utility functions and API
└── ui/             # Shadcn/ui components

server/
├── routes/         # API endpoints
├── middlewares/    # Authentication and RBAC
├── migrations/     # Database schema
└── scripts/        # Database seeding
```

## 🧪 Testing

### Manual Testing
1. **Login** with different user roles
2. **Navigate** through all tabs and features
3. **Test workflows** with cross-department actions
4. **Verify permissions** for different user types
5. **Check responsiveness** on different devices

### Sample Data
The application includes comprehensive sample data:
- **7 departments** with full descriptions
- **10+ risks** in various workflow states
- **Cross-department actions** for testing
- **User assignments** across all roles

## 🐛 Troubleshooting

### Common Issues

#### Login Problems
- Ensure the backend server is running (`npm run server`)
- Check database is seeded (`npm run seed`)
- Verify credentials from the demo list above

#### Database Issues
- Run migrations: `npm run migrate`
- Reset database: Delete `server/data/erm.sqlite` and run `npm run seed`

#### Port Conflicts
- Change port in `.env` file
- Kill existing processes using the port

### Getting Help
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure database is properly seeded
4. Check network connectivity for API calls

## 📈 Roadmap

### Upcoming Features
- **Advanced Analytics** dashboard
- **Risk Trend Analysis** with charts
- **Integration APIs** for external systems
- **Advanced Reporting** with custom templates
- **Mobile Application** for field workers

### Enhancement Areas
- **Performance optimization** for large datasets
- **Advanced workflow** automation
- **Multi-language** support
- **Cloud deployment** options

## 🤝 Contributing

### Development Guidelines
- Follow the established component architecture
- Maintain accessibility standards
- Use the design system consistently
- Test across different user roles
- Ensure responsive design compliance

### Code Style
- **React Hooks** for state management
- **Tailwind CSS** for styling
- **TypeScript** for type safety (future)
- **ESLint** for code quality
- **Prettier** for formatting

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Shadcn/ui** for the excellent component library
- **Tailwind CSS** for the utility-first CSS framework
- **ISO 31000** for risk management standards
- **Apple Design Guidelines** for UI/UX inspiration

---

**Note**: This is a comprehensive ERM application designed for enterprise use. For production deployment, ensure proper security measures, database backups, and monitoring are in place.
