import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    question: "How much water does the bottle hold?",
    answer: "The Leap Dog Water Bottle holds up to 295 ml of water, providing perfect hydration for your dog during walks, hikes, and travels without being heavy to carry."
  },
  {
    question: "Is it suitable for large dog breeds?",
    answer: "Yes! The custom-designed oval bowl is wide enough for all snout shapes, from small Pugs to large Golden Retrievers or German Shepherds."
  },
  {
    question: "Can I pour unused water back into the bottle?",
    answer: "Absolutely. Our smart release button works two ways: press to dispense water, and press while tilting back to drain the unused water back into the bottle. Zero waste!"
  },
  {
    question: "Are the materials safe and BPA-free?",
    answer: "The main body is made of premium rust-proof stainless steel, while the bowl attachment uses food-grade, BPA-free silicone. Your dog's safety is our top priority."
  },
  {
    question: "Is the bottle dishwasher safe?",
    answer: "For the best result, we recommend hand washing the bottle with warm soapy water. The wide opening makes it very easy to clean!"
  },
  {
    question: "Will it leak in my backpack?",
    answer: "Not a chance. It features a secure locking mechanism. Once locked, the silicone seal prevents any leaks, even if tossed upside down in your bag."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-white page-padding">
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-charcoal-deep mb-4 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-body text-lg">Everything you need to know about the Leap Dog Bottle.</p>
        </div>
        
        <div className="flex flex-col gap-4">
          {FAQS.map((faq, index) => (
            <div 
              key={index} 
              className={`border border-silver rounded-2xl overflow-hidden transition-all duration-300 ${openIndex === index ? 'bg-[#FAFAFA] shadow-sm' : 'bg-white'}`}
            >
              <button 
                className="w-full text-left px-6 py-5 flex items-center justify-between font-bold text-charcoal-deep"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="pr-4">{faq.question}</span>
                <span className="text-brand-turquoise flex-shrink-0">
                  {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                </span>
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-[500px] pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-body text-sm leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
