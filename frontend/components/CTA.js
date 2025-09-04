import React from 'react';

const CTA = () => {
  return (
    <section className="bg-red-600 text-white">
      <div className="container mx-auto px-6 py-12 text-center md:text-left">
        <div className="grid md:grid-cols-2 items-center gap-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              It's like having the entire neighborhood's kitchen in your pocket
            </h2>
            <p className="mb-8">
              Enjoy a large variety of meals, deals, and member-only features in the AyokFoodFood app.
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href="#"><img src="https://lelogama.go-jek.com/component/factsheet/apple-badge.svg" alt="App Store" className="h-12" /></a>
              <a href="#"><img src="https://lelogama.go-jek.com/component/factsheet/google-badge.svg" alt="Google Play" className="h-12" /></a>
            </div>
          </div>
          <div className="flex justify-center">
            <img src="https://lelogama.go-jek.com/component/factsheet/gf-section-4.png" alt="AyokFood App" className="max-w-xs md:max-w-sm" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;