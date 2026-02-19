import React, { useEffect, useState } from 'react';

const RegisterPage: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Trigger the transition immediately after the component mounts
  useEffect(() => {
    // A tiny timeout ensures the browser paints the initial "off-screen" state first
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    /* 1. Green Background Block */
    <div className="relative w-screen h-screen bg-green-700 overflow-hidden font-sans">
      
      /* 2. Red Side Rectangles */
      {/* Left Red Rectangle */}
      <div
        className={`absolute top-0 left-0 w-[10%] h-[60%] bg-red-600 transition-transform duration-2000 ease-out ${
          isLoaded ? 'translate-x-0' : '-translate-x-full'
        }`}
      />
      {/* Right Red Rectangle */}
      <div
        className={`absolute top-0 right-0 w-[10%] h-[60%] bg-red-600 transition-transform duration-2000 ease-out ${
          isLoaded ? 'translate-x-0' : 'translate-x-full'
        }`}
      />

      /* 3. Purple Bottom Squares */
      {/* Left Purple Square */}
      <div
        className={`absolute bottom-0 left-0 w-[20%] h-[20%] bg-purple-700 transition-transform duration-2000 ease-out ${
          isLoaded ? 'translate-x-0 translate-y-0' : '-translate-x-full translate-y-full'
        }`}
      />
      {/* Right Purple Square */}
      <div
        className={`absolute bottom-0 right-0 w-[20%] h-[20%] bg-purple-700 transition-transform duration-2000 ease-out ${
          isLoaded ? 'translate-x-0 translate-y-0' : 'translate-x-full translate-y-full'
        }`}
      />

      /* 4. Translucent Form Box */
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-xl shadow-2xl transition-opacity duration-500 delay-[2000ms] ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Register
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Left Side: QR Code */}
          <div className="flex flex-col items-center">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example"
              alt="QR Code"
              className="w-36 h-36 border-4 border-white rounded-lg shadow-sm"
            />
            <p className="mt-3 text-sm text-gray-600 font-medium">
              Scan to download app
            </p>
          </div>

          {/* Right Side: Form Inputs */}
          <form 
            className="flex flex-col gap-4 min-w-[280px]" 
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="text"
              placeholder="Full Name"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-shadow"
            />
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-shadow"
            />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-shadow"
            />
            <button
              type="submit"
              className="mt-2 w-full py-3 bg-green-700 hover:bg-green-800 text-white font-bold rounded-lg shadow hover:shadow-lg transition-all"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;