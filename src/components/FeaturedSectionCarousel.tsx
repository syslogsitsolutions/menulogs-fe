import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FeaturedSection } from '../types/menu';

interface FeaturedSectionCarouselProps {
  sections: FeaturedSection[];
}

const FeaturedSectionCarousel = ({ sections }: FeaturedSectionCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (sections.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sections.length);
    }, 3000); // Auto-advance every 3 seconds

    return () => clearInterval(timer);
  }, [sections.length, isPaused]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // If only one section, render without carousel controls
  if (sections.length === 1) {
    const section = sections[0];
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className={`grid md:grid-cols-2 gap-12 items-center ${section.imagePosition === 'right' ? 'md:grid-flow-dense' : ''}`}>
            {section.imagePosition === 'right' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="md:col-start-2"
              >
                <img 
                  src={section.image} 
                  alt={section.title}
                  className="rounded-2xl shadow-2xl w-full"
                />
              </motion.div>
            )}
            {section.imagePosition === 'left' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <img 
                  src={section.image} 
                  alt={section.title}
                  className="rounded-2xl shadow-2xl w-full"
                />
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, x: section.imagePosition === 'right' ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={section.imagePosition === 'right' ? 'md:col-start-1 md:row-start-1' : ''}
            >
              <h3 className="text-3xl md:text-4xl font-bold text-dark-900 mb-6 font-serif">
                {section.title}
              </h3>
              {section.description && (
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {section.description}
                </p>
              )}
              <ul className="space-y-4 mb-8">
                {section.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-brand-600"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-900">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {section.buttonText && (
                <a
                  href={section.buttonLink || '#'}
                  className="inline-block bg-gradient-to-r from-brand-500 to-brand-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  {section.buttonText}
                </a>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // Multiple sections - render carousel
  return (
    <section 
      className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className={`grid md:grid-cols-2 gap-12 items-center ${sections[currentIndex].imagePosition === 'right' ? 'md:grid-flow-dense' : ''}`}
          >
            {sections[currentIndex].imagePosition === 'right' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="md:col-start-2"
              >
                <img 
                  src={sections[currentIndex].image} 
                  alt={sections[currentIndex].title}
                  className="rounded-2xl shadow-2xl w-full"
                />
              </motion.div>
            )}
            {sections[currentIndex].imagePosition === 'left' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <img 
                  src={sections[currentIndex].image} 
                  alt={sections[currentIndex].title}
                  className="rounded-2xl shadow-2xl w-full"
                />
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, x: sections[currentIndex].imagePosition === 'right' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={sections[currentIndex].imagePosition === 'right' ? 'md:col-start-1 md:row-start-1' : ''}
            >
              <h3 className="text-3xl md:text-4xl font-bold text-dark-900 mb-6 font-serif">
                {sections[currentIndex].title}
              </h3>
              {sections[currentIndex].description && (
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {sections[currentIndex].description}
                </p>
              )}
              <ul className="space-y-4 mb-8">
                {sections[currentIndex].features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-brand-600"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-900">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {sections[currentIndex].buttonText && (
                <a
                  href={sections[currentIndex].buttonLink || '#'}
                  className="inline-block bg-gradient-to-r from-brand-500 to-brand-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  {sections[currentIndex].buttonText}
                </a>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Indicators */}
        {sections.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {sections.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex 
                    ? 'bg-brand-600 w-8 h-2' 
                    : 'bg-gray-300 hover:bg-gray-400 w-2 h-2'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedSectionCarousel;

