import type { MenuCategory, MenuItem, Banner } from '../types/menu';

export const banners: Banner[] = [
  {
    id: '1',
    title: 'Experience Culinary Excellence',
    subtitle: 'Discover our signature dishes crafted by world-class chefs',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&h=600&fit=crop',
    cta: 'Explore Menu',
    ctaLink: '#categories'
  },
  {
    id: '2',
    title: 'Fresh Ingredients, Exceptional Taste',
    subtitle: 'Locally sourced, sustainably prepared',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&h=600&fit=crop',
    cta: 'View Selection',
    ctaLink: '#categories'
  },
  {
    id: '3',
    title: 'An Unforgettable Dining Journey',
    subtitle: 'Where tradition meets innovation',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600&h=600&fit=crop',
    cta: 'Discover More',
    ctaLink: '#categories'
  }
];

export const categories: MenuCategory[] = [
  {
    id: 'starters',
    name: 'Starters',
    description: 'Begin your culinary journey with our exquisite appetizers',
    image: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=800&h=600&fit=crop',
    icon: 'ChefHat'
  },
  {
    id: 'mains',
    name: 'Main Course',
    description: 'Our signature dishes that define luxury dining',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
    icon: 'Utensils'
  },
  {
    id: 'seafood',
    name: 'Seafood',
    description: 'Fresh catches from the ocean, prepared to perfection',
    image: 'https://images.unsplash.com/photo-1559737558-2f5a2f3a3d0c?w=800&h=600&fit=crop',
    icon: 'Fish'
  },
  {
    id: 'desserts',
    name: 'Desserts',
    description: 'Sweet endings to remember',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&h=600&fit=crop',
    icon: 'Cake'
  },
  {
    id: 'drinks',
    name: 'Drinks',
    description: 'Curated beverages and fine wines',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop',
    icon: 'Wine'
  },
  {
    id: 'specials',
    name: "Chef's Specials",
    description: 'Limited time creations by our master chefs',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop',
    icon: 'Star'
  }
];

export const menuItems: MenuItem[] = [
  // Starters
  {
    id: 'starter-1',
    categoryId: 'starters',
    name: 'Truffle Burrata',
    description: 'Creamy burrata cheese with black truffle, heirloom tomatoes, and aged balsamic',
    price: 24,
    image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800&h=600&fit=crop'
    ],
    ingredients: ['Burrata cheese', 'Black truffle', 'Heirloom tomatoes', 'Basil', 'Extra virgin olive oil', 'Aged balsamic'],
    allergens: ['Dairy'],
    nutritionalInfo: {
      calories: 320,
      protein: '18g',
      carbs: '12g',
      fat: '24g'
    },
    isVegetarian: true,
    preparationTime: '10 mins',
    chefSpecial: true
  },
  {
    id: 'starter-2',
    categoryId: 'starters',
    name: 'Seared Scallops',
    description: 'Pan-seared scallops with cauliflower purée, crispy pancetta, and lemon foam',
    price: 28,
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=800&h=600&fit=crop'
    ],
    ingredients: ['Sea scallops', 'Cauliflower', 'Pancetta', 'Lemon', 'Microgreens', 'White wine'],
    allergens: ['Shellfish', 'Pork'],
    nutritionalInfo: {
      calories: 280,
      protein: '24g',
      carbs: '14g',
      fat: '16g'
    },
    preparationTime: '15 mins'
  },
  {
    id: 'starter-3',
    categoryId: 'starters',
    name: 'Foie Gras Terrine',
    description: 'Duck foie gras terrine with toasted brioche, fig compote, and micro herbs',
    price: 32,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop'
    ],
    ingredients: ['Duck foie gras', 'Brioche', 'Fresh figs', 'Port wine', 'Micro herbs', 'Fleur de sel'],
    allergens: ['Gluten', 'Dairy', 'Alcohol'],
    nutritionalInfo: {
      calories: 420,
      protein: '14g',
      carbs: '22g',
      fat: '32g'
    },
    preparationTime: '12 mins',
    chefSpecial: true
  },
  {
    id: 'starter-4',
    categoryId: 'starters',
    name: 'Crispy Calamari',
    description: 'Lightly fried calamari with saffron aioli and lemon wedges',
    price: 18,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop'
    ],
    ingredients: ['Fresh calamari', 'Flour', 'Saffron', 'Garlic', 'Lemon', 'Parsley'],
    allergens: ['Shellfish', 'Gluten', 'Eggs'],
    nutritionalInfo: {
      calories: 310,
      protein: '22g',
      carbs: '28g',
      fat: '12g'
    },
    preparationTime: '12 mins'
  },

  // Main Course
  {
    id: 'main-1',
    categoryId: 'mains',
    name: 'Wagyu Beef Tenderloin',
    description: 'Premium A5 Wagyu beef with roasted root vegetables, red wine demi-glace',
    price: 89,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop'
    ],
    video: 'https://www.youtube.com/watch?v=example',
    ingredients: ['A5 Wagyu beef', 'Root vegetables', 'Red wine', 'Beef jus', 'Fresh thyme', 'Butter'],
    allergens: ['Dairy', 'Alcohol'],
    nutritionalInfo: {
      calories: 680,
      protein: '52g',
      carbs: '18g',
      fat: '46g'
    },
    preparationTime: '25 mins',
    chefSpecial: true
  },
  {
    id: 'main-2',
    categoryId: 'mains',
    name: 'Duck Breast à l\'Orange',
    description: 'Pan-roasted duck breast with orange reduction, sautéed spinach, and pommes Anna',
    price: 58,
    image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop'
    ],
    ingredients: ['Duck breast', 'Fresh oranges', 'Spinach', 'Potatoes', 'Grand Marnier', 'Duck stock'],
    allergens: ['Alcohol'],
    nutritionalInfo: {
      calories: 620,
      protein: '42g',
      carbs: '32g',
      fat: '36g'
    },
    preparationTime: '30 mins',
    chefSpecial: true
  },
  {
    id: 'main-3',
    categoryId: 'mains',
    name: 'Rack of Lamb',
    description: 'Herb-crusted lamb rack with minted pea purée, roasted garlic, and lamb jus',
    price: 72,
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&h=600&fit=crop'
    ],
    ingredients: ['Lamb rack', 'Fresh herbs', 'Peas', 'Mint', 'Garlic', 'Dijon mustard'],
    allergens: ['Mustard'],
    nutritionalInfo: {
      calories: 710,
      protein: '56g',
      carbs: '22g',
      fat: '48g'
    },
    preparationTime: '35 mins'
  },
  {
    id: 'main-4',
    categoryId: 'mains',
    name: 'Wild Mushroom Risotto',
    description: 'Creamy arborio rice with wild mushrooms, parmesan, and truffle oil',
    price: 42,
    image: 'https://images.unsplash.com/photo-1476124369491-c4ca9e0ff253?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1476124369491-c4ca9e0ff253?w=800&h=600&fit=crop'
    ],
    ingredients: ['Arborio rice', 'Wild mushrooms', 'Parmesan', 'White wine', 'Truffle oil', 'Vegetable stock'],
    allergens: ['Dairy', 'Alcohol'],
    nutritionalInfo: {
      calories: 520,
      protein: '18g',
      carbs: '62g',
      fat: '22g'
    },
    isVegetarian: true,
    preparationTime: '25 mins'
  },

  // Seafood
  {
    id: 'seafood-1',
    categoryId: 'seafood',
    name: 'Grilled Chilean Sea Bass',
    description: 'Miso-glazed sea bass with bok choy, shiitake mushrooms, and ginger-soy reduction',
    price: 68,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&h=600&fit=crop'
    ],
    ingredients: ['Chilean sea bass', 'White miso', 'Bok choy', 'Shiitake mushrooms', 'Ginger', 'Soy sauce'],
    allergens: ['Fish', 'Soy'],
    nutritionalInfo: {
      calories: 420,
      protein: '48g',
      carbs: '16g',
      fat: '18g'
    },
    preparationTime: '20 mins',
    chefSpecial: true
  },
  {
    id: 'seafood-2',
    categoryId: 'seafood',
    name: 'Lobster Thermidor',
    description: 'Whole lobster with brandy cream sauce, gruyère cheese, and herb breadcrumbs',
    price: 95,
    image: 'https://images.unsplash.com/photo-1559737558-2f5a2f3a3d0c?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1559737558-2f5a2f3a3d0c?w=800&h=600&fit=crop'
    ],
    ingredients: ['Maine lobster', 'Heavy cream', 'Brandy', 'Gruyère cheese', 'Shallots', 'Fresh tarragon'],
    allergens: ['Shellfish', 'Dairy', 'Gluten', 'Alcohol'],
    nutritionalInfo: {
      calories: 680,
      protein: '52g',
      carbs: '14g',
      fat: '46g'
    },
    preparationTime: '40 mins',
    chefSpecial: true
  },
  {
    id: 'seafood-3',
    categoryId: 'seafood',
    name: 'Pan-Seared Salmon',
    description: 'Atlantic salmon with lemon-dill sauce, asparagus, and fingerling potatoes',
    price: 48,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop'
    ],
    ingredients: ['Atlantic salmon', 'Fresh dill', 'Lemon', 'Asparagus', 'Fingerling potatoes', 'Butter'],
    allergens: ['Fish', 'Dairy'],
    nutritionalInfo: {
      calories: 520,
      protein: '42g',
      carbs: '28g',
      fat: '26g'
    },
    preparationTime: '18 mins'
  },
  {
    id: 'seafood-4',
    categoryId: 'seafood',
    name: 'Seafood Paella',
    description: 'Traditional Spanish paella with mixed seafood, saffron rice, and chorizo',
    price: 56,
    image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&h=600&fit=crop'
    ],
    ingredients: ['Bomba rice', 'Shrimp', 'Mussels', 'Calamari', 'Saffron', 'Chorizo', 'Peas'],
    allergens: ['Shellfish', 'Pork'],
    nutritionalInfo: {
      calories: 580,
      protein: '38g',
      carbs: '64g',
      fat: '18g'
    },
    preparationTime: '45 mins'
  },

  // Desserts
  {
    id: 'dessert-1',
    categoryId: 'desserts',
    name: 'Chocolate Soufflé',
    description: 'Dark chocolate soufflé with vanilla bean ice cream and raspberry coulis',
    price: 18,
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=600&fit=crop'
    ],
    ingredients: ['Dark chocolate', 'Eggs', 'Sugar', 'Butter', 'Vanilla beans', 'Fresh raspberries'],
    allergens: ['Eggs', 'Dairy', 'Gluten'],
    nutritionalInfo: {
      calories: 420,
      protein: '8g',
      carbs: '48g',
      fat: '22g'
    },
    isVegetarian: true,
    preparationTime: '25 mins',
    chefSpecial: true
  },
  {
    id: 'dessert-2',
    categoryId: 'desserts',
    name: 'Crème Brûlée',
    description: 'Classic French vanilla custard with caramelized sugar and fresh berries',
    price: 14,
    image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&h=600&fit=crop'
    ],
    ingredients: ['Heavy cream', 'Egg yolks', 'Vanilla beans', 'Sugar', 'Mixed berries'],
    allergens: ['Eggs', 'Dairy'],
    nutritionalInfo: {
      calories: 380,
      protein: '6g',
      carbs: '36g',
      fat: '24g'
    },
    isVegetarian: true,
    preparationTime: '15 mins'
  },
  {
    id: 'dessert-3',
    categoryId: 'desserts',
    name: 'Tiramisu',
    description: 'Italian classic with espresso-soaked ladyfingers, mascarpone, and cocoa',
    price: 16,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&h=600&fit=crop'
    ],
    ingredients: ['Mascarpone', 'Ladyfingers', 'Espresso', 'Marsala wine', 'Cocoa powder', 'Eggs'],
    allergens: ['Dairy', 'Eggs', 'Gluten', 'Alcohol'],
    nutritionalInfo: {
      calories: 450,
      protein: '10g',
      carbs: '42g',
      fat: '26g'
    },
    isVegetarian: true,
    preparationTime: '20 mins'
  },
  {
    id: 'dessert-4',
    categoryId: 'desserts',
    name: 'Lemon Tart',
    description: 'Tangy lemon curd in a buttery pastry shell with meringue kisses',
    price: 15,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop'
    ],
    ingredients: ['Fresh lemons', 'Butter', 'Eggs', 'Sugar', 'Flour', 'Cream'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    nutritionalInfo: {
      calories: 340,
      protein: '6g',
      carbs: '44g',
      fat: '16g'
    },
    isVegetarian: true,
    preparationTime: '15 mins'
  },

  // Drinks
  {
    id: 'drink-1',
    categoryId: 'drinks',
    name: 'Dom Pérignon Vintage 2012',
    description: 'Prestige cuvée champagne with notes of white fruits and citrus',
    price: 450,
    image: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800&h=600&fit=crop'
    ],
    ingredients: ['Champagne grapes', 'Minimal sulfites'],
    allergens: ['Sulfites', 'Alcohol'],
    preparationTime: 'Chilled'
  },
  {
    id: 'drink-2',
    categoryId: 'drinks',
    name: 'Signature Old Fashioned',
    description: 'Premium bourbon, house-made bitters, orange peel, and maple syrup',
    price: 22,
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop'
    ],
    ingredients: ['Bourbon', 'Angostura bitters', 'Orange peel', 'Maple syrup', 'Ice'],
    allergens: ['Alcohol'],
    preparationTime: '5 mins'
  },
  {
    id: 'drink-3',
    categoryId: 'drinks',
    name: 'Lavender Lemonade',
    description: 'House-made lemonade infused with fresh lavender and honey',
    price: 12,
    image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=800&h=600&fit=crop'
    ],
    ingredients: ['Fresh lemons', 'Lavender', 'Honey', 'Sparkling water'],
    allergens: [],
    preparationTime: '3 mins',
    isVegetarian: true,
    isVegan: true
  },
  {
    id: 'drink-4',
    categoryId: 'drinks',
    name: 'Espresso Martini',
    description: 'Premium vodka, fresh espresso, coffee liqueur, and vanilla',
    price: 18,
    image: 'https://images.unsplash.com/photo-1574095786815-022143f681e4?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1574095786815-022143f681e4?w=800&h=600&fit=crop'
    ],
    ingredients: ['Vodka', 'Fresh espresso', 'Kahlúa', 'Vanilla syrup', 'Coffee beans'],
    allergens: ['Alcohol'],
    preparationTime: '5 mins'
  },

  // Chef's Specials
  {
    id: 'special-1',
    categoryId: 'specials',
    name: 'Black Truffle Risotto',
    description: 'Luxurious risotto with fresh black truffles, aged parmesan, and butter',
    price: 78,
    image: 'https://images.unsplash.com/photo-1612871689345-68d0e1c4b6e8?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1612871689345-68d0e1c4b6e8?w=800&h=600&fit=crop'
    ],
    ingredients: ['Arborio rice', 'Black truffles', 'Parmesan', 'Butter', 'White wine', 'Vegetable stock'],
    allergens: ['Dairy', 'Alcohol'],
    nutritionalInfo: {
      calories: 620,
      protein: '22g',
      carbs: '68g',
      fat: '28g'
    },
    isVegetarian: true,
    preparationTime: '30 mins',
    chefSpecial: true
  },
  {
    id: 'special-2',
    categoryId: 'specials',
    name: 'Beef Wellington',
    description: 'Prime beef fillet wrapped in mushroom duxelles and puff pastry',
    price: 98,
    image: 'https://images.unsplash.com/photo-1625937286074-9ca519d5d9df?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1625937286074-9ca519d5d9df?w=800&h=600&fit=crop'
    ],
    ingredients: ['Beef tenderloin', 'Mushroom duxelles', 'Puff pastry', 'Prosciutto', 'Dijon mustard', 'Egg wash'],
    allergens: ['Gluten', 'Eggs', 'Dairy'],
    nutritionalInfo: {
      calories: 820,
      protein: '54g',
      carbs: '38g',
      fat: '52g'
    },
    preparationTime: '45 mins',
    chefSpecial: true
  }
];

