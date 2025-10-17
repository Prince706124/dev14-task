# Nested Comments System

A modern, responsive commenting system with unlimited nesting levels, real-time interactions, and admin features. Built with React, FastAPI, and Docker.

## 🚀 Features

### Core Features
- **Unlimited Nested Comments**: Support for infinite comment threading with visual hierarchy
- **Real-time Interactions**: Upvoting, editing, and deleting comments
- **User Authentication**: JWT-based authentication with role-based access control
- **Admin Privileges**: Admin users can moderate all comments
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Framer Motion animations for enhanced user experience

### Advanced Features
- **Comment Sorting**: Sort by date, upvotes, or number of replies
- **Collapsible Threads**: Expand/collapse comment threads for better navigation
- **User Avatars**: Dynamic avatar generation for users
- **Time Formatting**: Smart relative time display (e.g., "2h ago", "3d ago")
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Skeleton loading animations
- **Error Handling**: Comprehensive error handling and user feedback

### Technical Features
- **RESTful API**: Well-documented FastAPI backend
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **CORS Support**: Configured for cross-origin requests
- **Docker Support**: Full containerization with Docker Compose
- **Responsive UI**: Tailwind CSS with custom animations

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with SQLAlchemy ORM
- **Database**: SQLite (easily configurable for PostgreSQL/MySQL)
- **Authentication**: JWT with bcrypt password hashing
- **API Documentation**: Auto-generated OpenAPI/Swagger docs
- **CORS**: Configured for frontend integration

### Frontend (React + Vite)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom components
- **Animations**: Framer Motion for smooth transitions
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Notifications**: React Hot Toast

### Database Schema
```sql
-- Users Table
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    avatar VARCHAR,
    hashed_password VARCHAR NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Comments Table
CREATE TABLE comments (
    id INTEGER PRIMARY KEY,
    text VARCHAR NOT NULL,
    upvotes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR REFERENCES users(id),
    parent_id INTEGER REFERENCES comments(id)
);
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nested-comments-system
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Option 2: Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed_data.py
uvicorn main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Authentication

### Demo Credentials
- **Admin User**: 
  - Email: `admin@example.com`
  - Password: `admin123`
- **Regular User**: 
  - Email: `liam.joshi.1@example.com`
  - Password: `password123`

### User Registration
- Users can register with any email
- Admin users can be created through the API endpoint `/admin/create-admin`
- Password requirements: Minimum 6 characters

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user info

### Comment Endpoints
- `GET /comments` - Get all comments with sorting options
- `POST /comments` - Create a new comment
- `PUT /comments/{id}` - Update a comment
- `DELETE /comments/{id}` - Delete a comment
- `PUT /comments/{id}/upvote` - Upvote a comment

### Admin Endpoints
- `POST /admin/create-admin` - Create admin user (admin only)

### Query Parameters
- `sort_by`: `created_at`, `upvotes`, `replies`
- `order`: `asc`, `desc`

## 🎨 UI/UX Features

### Design Principles
- **Clean Interface**: Minimalist design with focus on content
- **Visual Hierarchy**: Clear nesting with indentation and borders
- **Responsive Layout**: Mobile-first design approach
- **Accessibility**: Keyboard navigation and screen reader support

### Animation System
- **Page Transitions**: Smooth fade-in animations
- **Comment Interactions**: Hover effects and micro-interactions
- **Loading States**: Skeleton loaders and progress indicators
- **Toast Notifications**: Non-intrusive feedback system

### Color Scheme
- **Primary**: Blue gradient (#3b82f6 to #1e40af)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)
- **Neutral**: Gray scale for text and backgrounds

## 🛠️ Development

### Project Structure
```
nested-comments-system/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── seed_data.py         # Database seeding
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile          # Backend container
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main application
│   ├── package.json        # Node dependencies
│   └── Dockerfile         # Frontend container
├── docker-compose.yml      # Development setup
├── docker-compose.prod.yml # Production setup
└── README.md              # This file
```

### Key Components

#### Backend Components
- **main.py**: FastAPI application with all routes
- **seed_data.py**: Database seeding with sample data
- **Models**: User and Comment SQLAlchemy models
- **Authentication**: JWT token handling and password hashing

#### Frontend Components
- **App.jsx**: Main application component
- **AuthPage.jsx**: Login/register interface
- **CommentSystem.jsx**: Main comment interface
- **CommentItem.jsx**: Individual comment component
- **CommentForm.jsx**: Comment creation/editing form
- **SortControls.jsx**: Comment sorting interface

### State Management
- **AuthContext**: User authentication state
- **CommentContext**: Comments and interactions state
- **Local Storage**: Persistent authentication tokens

## 🚀 Deployment

### Production Deployment
```bash
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Variables
Create a `.env` file for production:
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./comments.db
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

## 🧪 Testing

### Manual Testing
1. **Authentication Flow**
   - Register new user
   - Login with credentials
   - Logout functionality

2. **Comment Operations**
   - Create top-level comments
   - Reply to comments (nesting)
   - Edit own comments
   - Delete own comments
   - Upvote comments

3. **Admin Features**
   - Admin login
   - Delete any comment
   - Create admin users

4. **UI/UX Testing**
   - Responsive design on different screen sizes
   - Animation smoothness
   - Loading states
   - Error handling

### API Testing
Use the interactive API documentation at `http://localhost:8000/docs` to test endpoints.

## 🔧 Configuration

### Backend Configuration
- **Database**: SQLite (default), easily configurable for PostgreSQL/MySQL
- **Authentication**: JWT with configurable expiration
- **CORS**: Configurable origins for security
- **Logging**: Structured logging for debugging

### Frontend Configuration
- **API Base URL**: Configurable in `src/services/api.js`
- **Theme**: Customizable in `tailwind.config.js`
- **Animations**: Configurable in component files

## 📈 Performance Considerations

### Backend Optimizations
- **Database Indexing**: Proper indexes on foreign keys
- **Query Optimization**: Efficient comment tree building
- **Caching**: Consider Redis for session management
- **Rate Limiting**: Implement for production use

### Frontend Optimizations
- **Code Splitting**: Lazy loading for better performance
- **Image Optimization**: WebP format for avatars
- **Bundle Size**: Tree shaking and minification
- **Caching**: Service worker for offline support

## 🔒 Security Features

### Authentication Security
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token generation and validation
- **Session Management**: Automatic token refresh
- **Input Validation**: Pydantic models for data validation

### API Security
- **CORS Configuration**: Restricted origins
- **Rate Limiting**: Prevent abuse (implement in production)
- **Input Sanitization**: XSS protection
- **SQL Injection**: SQLAlchemy ORM protection

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check if database file exists
   ls -la backend/comments.db
   
   # Recreate database
   rm backend/comments.db
   python backend/seed_data.py
   ```

2. **Frontend Build Issues**
   ```bash
   # Clear node modules and reinstall
   rm -rf frontend/node_modules
   cd frontend && npm install
   ```

3. **Docker Issues**
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild containers
   docker-compose down
   docker-compose up --build
   ```

### Debug Mode
Enable debug logging:
```python
# In backend/main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## Technologies Used

- **FastAPI** for the excellent Python web framework
- **React** for the powerful frontend library
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations
- **Lucide React** for beautiful icons

---

**Built with ❤️ for Inter IIT Tech Meet 14.0 Dev Team Task**
