import React from 'react';
import { FaInstagram, FaFacebook } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-bold text-green-600" style={{ fontFamily: "'Museo Sans', sans-serif" }}>AyokFood</h3>
            <p className="text-sm text-gray-500 mt-2">
              © 2025 AyokFood. All rights reserved. | AyokFood is a trademark of PT Aplikasi Karya Anak Bangsa.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <a href="#" className="text-gray-600 hover:text-black">Privacy policy</a>
            <a href="#" className="text-gray-600 hover:text-black">Terms of service</a>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-600">Follow us</span>
              <a href="#" className="text-gray-600 hover:text-black"><FaInstagram size={24}/></a>
              <a href="#" className="text-gray-600 hover:text-black"><FaFacebook size={24}/></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;