# Cars Empire 🚗

A comprehensive vehicle marketplace platform built with modern web technologies. Buy and sell cars, bikes, and commercial vehicles with confidence.

## 🚀 Features

- **User Authentication** - Secure registration and login system
- **Vehicle Listings** - Create, edit, and manage vehicle listings
- **Advanced Search & Filters** - Find vehicles by make, model, price, location
- **Image Upload** - Multiple image support with S3 integration
- **Real-time Chat** - Communication between buyers and sellers
- **Admin Dashboard** - Comprehensive admin panel with Laravel Nova
- **Payment Integration** - Stripe integration for premium features
- **Mobile Responsive** - Optimized for all devices

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Server state management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Framer Motion** - Animations

### Backend
- **Laravel 12** - PHP framework
- **MySQL/SQLite** - Database
- **Laravel Sanctum** - API authentication
- **Laravel Scout** - Full-text search
- **Meilisearch** - Search engine
- **Redis** - Caching and sessions
- **Laravel Nova** - Admin panel
- **Stripe** - Payment processing

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- PHP (v8.2 or higher)
- Composer
- Git

### Clone the Repository
```bash
git clone https://github.com/yourusername/cars-empire.git
cd cars-empire
```

### Backend Setup
```bash
cd server
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed --class=VehicleCategorySeeder
php artisan serve
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
APP_NAME="Cars Empire"
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

DB_CONNECTION=sqlite
# or for MySQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=cars_empire

# Add your API keys
STRIPE_KEY=your_stripe_key
STRIPE_SECRET=your_stripe_secret
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

#### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Cars Empire
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## 🚀 Usage

1. **Start the backend server:**
   ```bash
   cd server && php artisan serve
   ```

2. **Start the frontend development server:**
   ```bash
   cd frontend && npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api
   - Admin Panel: http://localhost:8000/nova (after Nova setup)

## 📱 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get authenticated user

### Vehicles
- `GET /api/vehicles` - List vehicles
- `POST /api/vehicles` - Create vehicle listing
- `GET /api/vehicles/{id}` - Get vehicle details
- `PUT /api/vehicles/{id}` - Update vehicle
- `DELETE /api/vehicles/{id}` - Delete vehicle

### Categories
- `GET /api/categories` - Get vehicle categories

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Laravel community for the amazing framework
- React team for the powerful frontend library
- Tailwind CSS for the utility-first approach
- All contributors and supporters

## 📞 Support

For support, email support@carsempire.com or join our Slack channel.

---

**Built with ❤️ by the Cars Empire Team**
