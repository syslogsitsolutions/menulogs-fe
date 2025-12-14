# 🍽️ Luxe Dining - Premium Restaurant Menu

A modern, fully responsive restaurant menu landing page built with React, TypeScript, Tailwind CSS, and Framer Motion.

## ✨ Features

### 🏠 Landing Page
- **Beautiful Hero Carousel** - Auto-rotating banners showcasing signature dishes
- **Elegant Welcome Section** - Introduction to the restaurant with call-to-action buttons
- **Statistics Display** - Engaging stats about the restaurant
- **Category Grid** - Visually rich, clickable category cards with hover effects
- **Featured Section** - Highlighting chef expertise and quality standards

### 📋 Menu Listing Page
- **Dynamic Category Display** - View all menu items for a specific category
- **Advanced Filters**:
  - Search bar for finding dishes by name or description
  - Price range slider
  - Dietary preferences (Vegetarian, Vegan, Gluten-free)
  - Chef's specials filter
  - Spicy level filter
- **Responsive Grid Layout** - Beautifully displayed menu items with images
- **Item Cards** - Rich cards with badges, prices, prep time, and calories
- **Real-time Filter Count** - Shows active filters and result count

### 🔍 Menu Item Detail Page
- **Image Gallery** - Multiple high-quality images with navigation
- **Comprehensive Information**:
  - Full description
  - Ingredients list
  - Allergen warnings
  - Nutritional information (Calories, Protein, Carbs, Fat)
  - Preparation time
  - Dietary badges (Vegetarian, Vegan, Gluten-free, Spicy level)
- **Interactive Elements**:
  - Add to order button
  - Favorite/wishlist functionality
  - Image carousel
- **Related Items** - Suggestions from the same category
- **Breadcrumb Navigation** - Easy navigation back to previous pages

### 🎨 Design Features
- **Premium Design** - Clean, elegant, high-end restaurant aesthetic
- **Smooth Animations** - Powered by Framer Motion for delightful interactions
- **Responsive Layout** - Fully optimized for mobile, tablet, and desktop
- **Modern Typography** - Playfair Display (serif) for headings, Inter (sans) for body
- **Color Scheme** - Sophisticated orange/primary gradient with dark accents
- **Hover Effects** - Smooth transitions and scale effects
- **Sticky Navigation** - Header and filter bar stay accessible
- **Loading States** - Smooth page transitions

## 🚀 Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icon library

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🗂️ Project Structure

```
MenuLogs/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Header.tsx       # Navigation header
│   │   ├── Footer.tsx       # Footer with links and info
│   │   ├── HeroCarousel.tsx # Landing page carousel
│   │   ├── CategoryGrid.tsx # Category cards grid
│   │   └── MenuItemCard.tsx # Individual menu item card
│   ├── pages/              # Page components
│   │   ├── LandingPage.tsx # Home page
│   │   ├── MenuListingPage.tsx # Category items with filters
│   │   └── MenuItemDetailPage.tsx # Item details
│   ├── data/               # Mock data
│   │   └── mockData.ts     # Categories, items, banners
│   ├── types/              # TypeScript types
│   │   └── menu.ts         # Interface definitions
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx           # App entry point
│   └── index.css          # Global styles with Tailwind
├── public/                # Static assets
├── index.html            # HTML template
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── package.json          # Dependencies and scripts
```

## 🎯 Key Components

### Data Structure

**MenuCategory**
- id, name, description
- image, icon

**MenuItem**
- Basic info: id, name, description, price
- Media: image, images array, video (optional)
- Details: ingredients, allergens, nutritional info
- Attributes: vegetarian, vegan, gluten-free, spicy level
- Special flags: chef's special, preparation time

**Banner**
- title, subtitle, image
- CTA button and link

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to change the color scheme:
- `primary` - Main brand color (currently orange)
- `dark` - Text and dark elements

### Fonts
Update Google Fonts import in `src/index.css`:
- Heading font: Playfair Display
- Body font: Inter

### Mock Data
Modify `src/data/mockData.ts` to update:
- Banner content and images
- Menu categories
- Menu items and details

## 🔄 API Integration

The app currently uses mock data. To integrate with a real API:

1. Create API service files in `src/services/`
2. Replace mock data imports with API calls
3. Add loading states and error handling
4. Implement data fetching with React Query or SWR (recommended)

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🎭 Animation Details

- Page transitions: Smooth fade and slide effects
- Card hover: Lift and shadow enhancement
- Image gallery: Fade transitions between images
- Filter panel: Height animation with opacity
- Category cards: Scale on hover with gradient overlay

## 🌟 Future Enhancements

- [ ] Shopping cart functionality
- [ ] User authentication
- [ ] Order placement system
- [ ] Table reservation system
- [ ] Reviews and ratings
- [ ] Admin panel for menu management
- [ ] Real-time inventory updates
- [ ] Multiple language support
- [ ] Dark mode toggle
- [ ] Accessibility improvements (ARIA labels)

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[START_HERE.md](START_HERE.md)** - Quick start guide for new developers
- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** - Frontend-backend integration guide
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick command and API reference
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Complete project file structure
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Database schema and relationships
- **[docs/README.md](docs/README.md)** - Complete documentation index

### Backend Documentation
- **[backend/README.md](backend/README.md)** - Backend setup and overview
- **[backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)** - Complete API reference
- **[backend/SETUP.md](backend/SETUP.md)** - Backend setup instructions

### Feature Guides
- **[docs/guides/](docs/guides/)** - Feature-specific guides (Razorpay, Subscriptions, etc.)

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

---

**Built with ❤️ for premium dining experiences**
