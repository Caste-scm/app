import { useEffect } from 'react';
import { SmoothScrollProvider } from '@/context/SmoothScrollContext';
import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';
import HeroSection from '@/sections/HeroSection';
import FeaturesGridSection from '@/sections/FeaturesGridSection';
import HowItWorksSection from '@/sections/HowItWorksSection';
import ProductDetailsSection from '@/sections/ProductDetailsSection';
import TestimonialsSection from '@/sections/TestimonialsSection';
import DogUsageSection from '@/sections/DogUsageSection';
import FAQSection from '@/sections/FAQSection';
import LifestyleCTASection from '@/sections/LifestyleCTASection';

export default function App() {
  useEffect(() => {
    // Scroll to hash on load if present
    if (window.location.hash) {
      setTimeout(() => {
        const el = document.querySelector(window.location.hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    
    // Track visit
    const trackVisit = async () => {
      try {
        const visitorId = localStorage.getItem('visitor_id') || `v_${Math.random().toString(36).substr(2, 9)}`;
        const isUnique = !localStorage.getItem('visitor_id');
        localStorage.setItem('visitor_id', visitorId);

        await fetch('/api/track-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorId, isUnique })
        });
      } catch (e) {}
    };
    trackVisit();
  }, []);

  return (
    <SmoothScrollProvider>
      <div className="relative">
        <NavigationBar />
        <main>
          <HeroSection />
          <FeaturesGridSection />
          <HowItWorksSection />
          <ProductDetailsSection />
          <TestimonialsSection />
          <DogUsageSection />
          <FAQSection />
          <LifestyleCTASection />
        </main>
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
}
