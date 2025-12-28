export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  images: string[];
  video?: string;
  ingredients: string[];
  allergens: string[];
  nutritionalInfo?: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  spicyLevel?: number;
  preparationTime?: string;
  chefSpecial?: boolean;
  // Included from API when fetching single item
  category?: {
    id: string;
    name: string;
  };
  location?: {
    id: string;
    name: string;
    business?: {
      name: string;
      logo: string;
    };
  };
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cta?: string;
  ctaLink?: string;
}

export interface FeaturedSection {
  id: string;
  title: string;
  description?: string;
  image: string;
  features: Array<{ title: string; description: string }>;
  buttonText?: string;
  buttonLink?: string;
  imagePosition: 'left' | 'right';
}

