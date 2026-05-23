import React from 'react';

/**
 * Responsive 4-column Flipkart footer styled with rich charcoal background tags.
 */
export default function Footer() {
  return (
    <footer className="bg-[#172337] text-white py-12 px-6 mt-16 text-xs" id="site-footer">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-gray-700">
        
        <!-- Col 1 -->
        <div>
          <h3 className="text-[#878787] font-semibold uppercase tracking-wider mb-3 font-sans">ABOUT</h3>
          <ul className="space-y-2 text-slate-300 font-sans">
            <li><a href="#" className="hover:underline">Contact Us</a></li>
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">Careers</a></li>
            <li><a href="#" className="hover:underline">Flipkart Stories</a></li>
            <li><a href="#" className="hover:underline">Press</a></li>
            <li><a href="#" className="hover:underline">Corporate Information</a></li>
          </ul>
        </div>

        <!-- Col 2 -->
        <div>
          <h3 className="text-[#878787] font-semibold uppercase tracking-wider mb-3 font-sans">HELP</h3>
          <ul className="space-y-2 text-slate-300 font-sans">
            <li><a href="#" className="hover:underline">Payments</a></li>
            <li><a href="#" className="hover:underline">Shipping</a></li>
            <li><a href="#" className="hover:underline">Cancellation & Returns</a></li>
            <li><a href="#" className="hover:underline">FAQ</a></li>
            <li><a href="#" className="hover:underline">Report Infringement</a></li>
          </ul>
        </div>

        <!-- Col 3 -->
        <div>
          <h3 className="text-[#878787] font-semibold uppercase tracking-wider mb-3 font-sans">CONSUMER POLICY</h3>
          <ul className="space-y-2 text-slate-300 font-sans">
            <li><a href="#" className="hover:underline">Cancellation & Returns</a></li>
            <li><a href="#" className="hover:underline">Terms of Use</a></li>
            <li><a href="#" className="hover:underline">Security</a></li>
            <li><a href="#" className="hover:underline">Privacy</a></li>
            <li><a href="#" className="hover:underline">Sitemap</a></li>
            <li><a href="#" className="hover:underline">Grievance Redressal</a></li>
          </ul>
        </div>

        <!-- Col 4 -->
        <div>
          <h3 className="text-[#878787] font-semibold uppercase tracking-wider mb-3 font-sans">SOCIAL</h3>
          <ul className="space-y-2 text-slate-300 font-sans">
            <li><a href="#" className="hover:underline">Facebook</a></li>
            <li><a href="#" className="hover:underline">Twitter / X</a></li>
            <li><a href="#" className="hover:underline">YouTube</a></li>
            <li><a href="#" className="hover:underline">Instagram</a></li>
          </ul>
        </div>

      </div>

      <!-- Bottom trademark line -->
      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-400 font-sans gap-4">
        <div>
          <span>© 2026 Flipkart-Clone. All rights reserved.</span>
        </div>
        <div className="flex gap-6">
          <span>Become a Seller</span>
          <span>Advertise</span>
          <span>Gift Cards</span>
          <span>Help Center</span>
        </div>
      </div>
    </footer>
  );
}
