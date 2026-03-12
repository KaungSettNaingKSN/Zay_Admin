# Zay Admin

Admin dashboard for managing the **Zay E-Commerce Platform**.  
This panel allows administrators to manage products, orders, users, and monitor store performance through a clean and responsive interface.

---

## Features

- Admin authentication
- Dashboard analytics and charts
- Product management (create, update, delete)
- Order management
- User management
- Category and inventory management
- Image preview and zoom
- Toast notifications for system feedback
- Responsive admin interface

---

## Tech Stack

Frontend

- React
- Vite
- Tailwind CSS
- Material UI
- Flowbite
- React Router

Libraries

- Axios
- Recharts (analytics charts)
- React Icons
- React Hot Toast
- Swiper
- React Collapse

---

## Related Repositories

Backend API  
https://github.com/KaungSettNaingKSN/Zay_Backend

Client Storefront  
https://github.com/KaungSettNaingKSN/Zay_Client

---

## Installation

Clone the repository

```bash
git clone https://github.com/KaungSettNaingKSN/Zay_Admin.git
```

Navigate into the project

```bash
cd Zay_Admin
```

Install dependencies

```bash
npm install
```

Start development server

```bash
npm run dev
```

---

## Environment Variables

Create a `.env` file in the project root.

```
VITE_API_URL=your_backend_api_url
```

Example

```
VITE_API_URL=http://localhost:5000
```

---

## Available Scripts

Run development server

```
npm run dev
```

Build project for production

```
npm run build
```

Preview production build

```
npm run preview
```

Run ESLint

```
npm run lint
```

---

## Project Structure

```
src
 ├── components
 ├── pages
 ├── hooks
 ├── services
 ├── utils
 ├── assets
 └── App.jsx
```

---

## Dashboard Modules

The admin panel includes the following management modules:

- Dashboard analytics
- Product management
- Order management
- User management
- Inventory control

---

## Future Improvements

- Role-based admin permissions
- Sales reports and analytics export
- Notification system
- Admin activity logs

---

## Author

Kaung Sett Naing

GitHub  
https://github.com/KaungSettNaingKSN