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

1. **Clone the repository**

```bash
git clone <repository-url>
cd <project-folder>

composer install

cp .env.example .env

php artisan key:generate

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_user
DB_PASSWORD=your_password

php artisan migrate

npm install

composer run dev
