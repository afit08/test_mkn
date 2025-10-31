# Laravel Project

This is a Laravel application configured to run using Composer scripts. It includes backend PHP logic and frontend assets handled with Vite.

## Requirements

- PHP >= 8.1  
- Composer  
- Node.js >= 18  
- npm or yarn  
- MySQL / MariaDB  

---

## Installation

```bash
# Clone the repository
git clone https://github.com/afit08/test_mkn.git
cd test_mkn

# Install PHP dependencies
composer install

# Copy and configure environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run database migrations or import database in folder /database/db.sql
php artisan migrate

# Install frontend dependencies
npm install

# Run laravel
composer run dev
