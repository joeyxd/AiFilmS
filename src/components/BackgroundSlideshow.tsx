import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const backgroundImages = [
  "/img/Lucid_Realism_A_captivating_macro_shot_of_a_single_tears_drop.jpg",
  "/img/Lucid_Realism_A_close-up_shot_of_a_human_eye_with_intricate__0.jpg",
  "/img/Lucid_Realism_A_close-up_shot_of_a_human_eye_with_intricate__1.jpg",
  "/img/Lucid_Realism_A_hyperrealistic_macro_shot_of_a_human_eye_sho_0.jpg",
  "/img/Lucid_Realism_A_macro_shot_hyperrealistic_intricate_human_eye__1.jpg"
];

const BackgroundSlideshow: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={backgroundImages[currentImageIndex]}
            alt="Background"
            className="w-full h-full object-cover slideshow-image transform scale-110"
            style={{
              objectPosition: 'center center',
              filter: 'brightness(1.05) contrast(1.1) saturate(1.2)'
            }}
            onLoad={() => {
              // Optional: Add loading state management here
            }}
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BackgroundSlideshow;
