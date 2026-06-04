import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col">
      <NavigationBar />
      
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 pt-32 pb-24">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-silver shadow-sm text-body text-sm md:text-base">
          <h1 className="text-3xl font-bold text-charcoal-deep mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8 border-b border-silver pb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h3 className="text-lg font-bold text-charcoal-deep mt-8 mb-3">1. Introduction</h3>
          <p className="mb-4 leading-relaxed">
            Welcome to Leap Pet Essentials. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website 
            and tell you about your privacy rights.
          </p>

          <h3 className="text-lg font-bold text-charcoal-deep mt-8 mb-3">2. The Data We Collect About You</h3>
          <p className="mb-4 leading-relaxed">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Identity Data</strong> includes first name, last name.</li>
            <li><strong>Contact Data</strong> includes billing address, delivery address, email address.</li>
            <li><strong>Financial Data</strong> includes payment card details (processed securely by Stripe).</li>
            <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, browser type and version.</li>
          </ul>

          <h3 className="text-lg font-bold text-charcoal-deep mt-8 mb-3">3. How We Use Your Personal Data</h3>
          <p className="mb-4 leading-relaxed">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g. to deliver an order).</li>
            <li>Where it is necessary for our legitimate interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>

          <h3 className="text-lg font-bold text-charcoal-deep mt-8 mb-3">4. Data Security</h3>
          <p className="mb-4 leading-relaxed">We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. Payments are processed securely through Stripe.</p>

          <h3 className="text-lg font-bold text-charcoal-deep mt-8 mb-3">5. Your Legal Rights</h3>
          <p className="mb-4 leading-relaxed">
            Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Request access</strong> to your personal data (commonly known as a "data subject access request").</li>
            <li><strong>Request correction</strong> of the personal data that we hold about you.</li>
            <li><strong>Request erasure</strong> of your personal data.</li>
            <li><strong>Object to processing</strong> of your personal data where we are relying on a legitimate interest.</li>
            <li><strong>Request restriction of processing</strong> of your personal data.</li>
            <li><strong>Request the transfer</strong> of your personal data to you or to a third party.</li>
            <li><strong>Withdraw consent at any time</strong> where we are relying on consent to process your personal data.</li>
          </ul>

          <h3 className="text-lg font-bold text-charcoal-deep mt-8 mb-3">6. Contact Us</h3>
          <p className="mb-4 leading-relaxed">
            If you have any questions about this privacy policy or our privacy practices, please contact us at: <br/>
            <strong>Email:</strong> supportleappet@gmail.com <br/>
            <strong>Business Entity:</strong> Leap Pet Essentials Ltd.<br/>
          </p>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
