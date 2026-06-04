import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col">
      <NavigationBar />
      
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 pt-32 pb-24">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-silver shadow-sm text-body text-sm md:text-base">
          <h1 className="text-3xl font-bold text-charcoal-deep mb-2">Cookie Policy</h1>
          <p className="text-sm text-gray-500 mb-8 border-b border-silver pb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h3 className="text-lg font-bold text-charcoal-deep mt-8 mb-3">1. What Are Cookies</h3>
          <p className="mb-4 leading-relaxed">
            As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer or mobile device, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies.
          </p>

          <h3 className="text-lg font-bold text-charcoal-deep mt-8 mb-3">2. How We Use Cookies</h3>
          <p className="mb-4 leading-relaxed">
            We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site.
          </p>

          <h3 className="text-lg font-bold text-charcoal-deep mt-8 mb-3">3. The Cookies We Set</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Site preferences cookies:</strong> In order to provide you with a great experience on this site, we provide the functionality to set your preferences for how this site runs when you use it. In order to remember your preferences (like your cookie consent), we need to set cookies or use localStorage.
            </li>
            <li>
              <strong>Cart and checkout cookies:</strong> We use local storage to temporarily save the state of your shopping cart before you proceed to checkout.
            </li>
          </ul>

          <h3 className="text-lg font-bold text-charcoal-deep mt-8 mb-3">4. Third Party Cookies</h3>
          <p className="mb-4 leading-relaxed">
            In some special cases, we also use cookies provided by trusted third parties. The following section details which third party cookies you might encounter through this site.
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              We use <strong>Stripe</strong> for payment processing. Stripe may set cookies essential for fraud prevention and to process your payment securely.
            </li>
            <li>
              We may use analytics tools (like Google Analytics) to help us to understand how you use the site and ways that we can improve your experience. These cookies may track things such as how long you spend on the site and the pages that you visit.
            </li>
          </ul>

          <h3 className="text-lg font-bold text-charcoal-deep mt-8 mb-3">5. Managing Cookies</h3>
          <p className="mb-4 leading-relaxed">
            You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Therefore, it is recommended that you do not disable cookies.
          </p>

          <h3 className="text-lg font-bold text-charcoal-deep mt-8 mb-3">6. More Information</h3>
          <p className="mb-4 leading-relaxed">
            Hopefully, that has clarified things for you. If there is something that you aren't sure whether you need or not, it's usually safer to leave cookies enabled in case it does interact with one of the features you use on our site.
          </p>
          <p className="mb-4 leading-relaxed">
            For more information, you can contact us at: <br/>
            <strong>Email:</strong> supportleappet@gmail.com <br/>
          </p>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
