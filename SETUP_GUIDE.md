# Authentication System Setup Guide

## Overview
This application now has a complete authentication system with protected routes for:
- Dashboard
- Student Management
- Faculty Management
- Reports
- System Settings

## Setup Instructions

### 1. Database Configuration
Edit your `.env` file and configure your database:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 2. Run Migrations
Execute the following commands in your terminal:
```bash
php artisan migrate
```

This will create the following tables:
- users
- students
- faculties
- reports
- system_settings
- profiles (existing)

### 3. Create Admin User
You need to create a user account to log in. Run this command:
```bash
php artisan tinker
```

Then execute:
```php
\App\Models\User::create([
    'name' => 'Admin User',
    'email' => 'admin@example.com',
    'password' => bcrypt('password123')
]);
```

Exit tinker by typing `exit`

### 4. Install NPM Dependencies & Build Assets
```bash
npm install
npm run dev
```

Or for production:
```bash
npm run prod
```

### 5. Start the Development Server
```bash
php artisan serve
```

### 6. Access the Application
Open your browser and navigate to:
```
http://localhost:8000
```

**Login Credentials:**
- Email: `admin@example.com`
- Password: `password123`

## Features

### Authentication
- ✅ Login page with session-based authentication
- ✅ Protected routes - users must be logged in to access admin pages
- ✅ Automatic redirect to login if not authenticated
- ✅ Logout functionality

### Modules
1. **Dashboard** - Overview statistics and recent data
2. **Students** - Full CRUD operations for student management
3. **Faculty** - Full CRUD operations for faculty management
4. **Reports** - Generate and manage various reports
5. **System Settings** - Configure application settings

### Navigation
- Sidebar menu with icons
- Active route highlighting
- User info display
- Logout button

## API Endpoints

### Public Routes
- `POST /api/login` - User login
- `POST /api/register` - User registration

### Protected Routes (require authentication)
- `GET /api/auth/check` - Check authentication status
- `POST /api/logout` - Logout user
- `GET /api/dashboard` - Dashboard statistics
- `GET /api/students` - List all students
- `POST /api/students` - Create student
- `PUT/PATCH /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student
- Similar routes for faculties, reports, and settings

## Troubleshooting

### Session Issues
If you experience session issues, make sure:
1. `SESSION_DRIVER=file` in your `.env`
2. The `storage/framework/sessions` directory is writable
3. Clear your browser cookies

### CSRF Token Issues
Laravel automatically handles CSRF tokens. Make sure:
1. Your app has generated an `APP_KEY` (run `php artisan key:generate`)
2. Cookies are enabled in your browser

### Database Connection
If you get database errors:
1. Verify your database credentials in `.env`
2. Make sure your database server is running
3. Create the database if it doesn't exist

## File Structure

### Backend
- `app/Models/` - Student, Faculty, Report, SystemSetting models
- `app/Http/Controllers/` - All module controllers
- `routes/api.php` - API routes with authentication middleware
- `database/migrations/` - Database schema migrations

### Frontend
- `resources/js/components/AuthContext.js` - Authentication state management
- `resources/js/components/ProtectedRoute.js` - Route protection wrapper
- `resources/js/components/Layout.js` - Admin layout with sidebar
- `resources/js/components/Dashboard.js` - Dashboard component
- `resources/js/components/Students.js` - Student management
- `resources/js/components/Faculty.js` - Faculty management
- `resources/js/components/Reports.js` - Reports module
- `resources/js/components/Settings.js` - System settings
- `resources/js/components/login.js` - Login page
- `resources/js/components/Routers.js` - Route configuration

### Styles
- `resources/sass/admin.scss` - Admin panel styles
- `resources/sass/app.scss` - Main stylesheet

## Next Steps

1. Customize the login page branding
2. Add more fields to student/faculty forms as needed
3. Implement role-based permissions (admin, teacher, etc.)
4. Add profile picture upload functionality
5. Enhance report generation with PDF export
6. Add email notifications
7. Implement password reset functionality

## Security Notes

- All admin routes are protected by authentication middleware
- Passwords are hashed using bcrypt
- CSRF protection is enabled by default
- Session cookies are HTTP-only
- Remember to change default credentials in production
