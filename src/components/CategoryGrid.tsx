import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Utensils, Fish, Cake, Wine, Star } from 'lucide-react';

const iconMap: { [key: string]: React.ElementType } = {
  ChefHat,
  Utensils,
  Fish,
  Cake,
  Wine,
  Star
};

interface CategoryGridProps {
  categories: any[];
  slug: string;
}

const CategoryGrid = ({ categories, slug }: CategoryGridProps) => {
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5"
    >
      {categories.map((category) => {
        const IconComponent = iconMap[category.icon] || ChefHat;
        
        return (
          <motion.div
            key={category.id}
            variants={item}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            onClick={() => navigate(`/${slug}/category/${category.id}`)}
            className="group cursor-pointer"
          >
            <div className="relative h-48 md:h-52 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent group-hover:from-brand-900/90 group-hover:via-brand-900/60 transition-colors duration-300"></div>
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-4">
                <div className="mb-2">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full group-hover:bg-brand-500 group-hover:scale-110 transition-all duration-300">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 font-serif line-clamp-1">
                  {category.name}
                </h3>
                <p className="text-gray-200 text-xs leading-relaxed opacity-90 line-clamp-2 mb-2">
                  {category.description}
                </p>
                
                {/* Arrow indicator */}
                <div className="mt-2 flex items-center text-white group-hover:text-brand-200 transition-colors">
                  <span className="text-xs font-medium">View Menu</span>
                  <svg 
                    className="w-4 h-4 ml-1.5 group-hover:translate-x-2 transition-transform duration-300" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>

              {/* Decorative corner */}
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-white/30 group-hover:border-brand-300 transition-colors duration-300"></div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default CategoryGrid;

