import { SmoothScrollProvider } from '@/context/SmoothScrollContext';
import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';
import HeroSection from '@/sections/HeroSection';
import FeaturesGridSection from '@/sections/FeaturesGridSection';
import HowItWorksSection from '@/sections/HowItWorksSection';
import ProductDetailsSection from '@/sections/ProductDetailsSection';
import TestimonialsSection from '@/sections/TestimonialsSection';
import DogUsageSection from '@/sections/DogUsageSection';
import LifestyleCTASection from '@/sections/LifestyleCTASection';

export default function App() {
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
          <LifestyleCTASection />
        </main>
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
}
