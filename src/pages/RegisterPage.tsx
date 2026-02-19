import React, { useEffect, useState } from 'react';

import bottomLeft from '../assets/register/left-bottom.png';
import bottomRight from '../assets/register/right-bottom.png';
import background from '../assets/register/background.png';
import leftSide from '../assets/register/side-left.png';
import rightSide from '../assets/register/side-right.png';

export function RegisterPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animation shortly after mount
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    /* Main Background Block */
    <div 
      className="relative w-screen h-screen bg-transparent bg-cover bg-center bg-no-repeat overflow-hidden font-sans"
      style={{ backgroundImage: `url(${background})` }}
    >
      
      {/* --- LEFT SIDE (3 vertical pieces acting as 1 full image) --- */}
      {/* Top Piece */}
      <div
        className={`absolute top-0 left-0 w-[10%] h-[20%] bg-transparent bg-no-repeat transition-transform duration-2000 ease-out delay-0 ${
          isLoaded ? 'translate-x-0' : '-translate-x-[100vw]'
        } bg-[length:100%_300%] bg-[position:0%_0%]`}
        style={{ backgroundImage: `url(${leftSide})` }}
      />
      {/* Middle Piece */}
      <div
        className={`absolute top-[20%] left-0 w-[10%] h-[20%] bg-transparent bg-no-repeat transition-transform duration-2000 ease-out delay-100 ${
          isLoaded ? 'translate-x-0' : '-translate-x-[100vw]'
        } bg-[length:100%_300%] bg-[position:0%_50%]`}
        style={{ backgroundImage: `url(${leftSide})` }}
      />
      {/* Bottom Piece */}
      <div
        className={`absolute top-[40%] left-0 w-[10%] h-[20%] bg-transparent bg-no-repeat transition-transform duration-2000 ease-out delay-200 ${
          isLoaded ? 'translate-x-0' : '-translate-x-[100vw]'
        } bg-[length:100%_300%] bg-[position:0%_100%]`}
        style={{ backgroundImage: `url(${leftSide})` }}
      />


      {/* --- RIGHT SIDE (3 vertical pieces acting as 1 full image) --- */}
      {/* Top Piece */}
      <div
        className={`absolute top-0 right-0 w-[10%] h-[20%] bg-transparent bg-no-repeat transition-transform duration-2000 ease-out delay-0 ${
          isLoaded ? 'translate-x-0' : 'translate-x-[100vw]'
        } bg-[length:100%_300%] bg-[position:0%_0%]`}
        style={{ backgroundImage: `url(${rightSide})` }}
      />
      {/* Middle Piece */}
      <div
        className={`absolute top-[20%] right-0 w-[10%] h-[20%] bg-transparent bg-no-repeat transition-transform duration-2000 ease-out delay-100 ${
          isLoaded ? 'translate-x-0' : 'translate-x-[100vw]'
        } bg-[length:100%_300%] bg-[position:0%_50%]`}
        style={{ backgroundImage: `url(${rightSide})` }}
      />
      {/* Bottom Piece */}
      <div
        className={`absolute top-[40%] right-0 w-[10%] h-[20%] bg-transparent bg-no-repeat transition-transform duration-2000 ease-out delay-200 ${
          isLoaded ? 'translate-x-0' : 'translate-x-[100vw]'
        } bg-[length:100%_300%] bg-[position:0%_100%]`}
        style={{ backgroundImage: `url(${rightSide})` }}
      />


      {/* --- BOTTOM SQUARES --- */}
      {/* Left Square */}
      <div
        className={`absolute bottom-0 left-0 w-[20%] h-[20%] bg-transparent bg-cover bg-center transition-transform duration-2000 ease-out ${
          isLoaded ? 'translate-x-0 translate-y-0' : '-translate-x-[100vw] translate-y-[100vh]'
        }`}
        style={{ backgroundImage: `url(${bottomLeft})` }}
      />
      {/* Right Square */}
      <div
        className={`absolute bottom-0 right-0 w-[20%] h-[20%] bg-transparent bg-cover bg-center transition-transform duration-2000 ease-out ${
          isLoaded ? 'translate-x-0 translate-y-0' : 'translate-x-[100vw] translate-y-[100vh]'
        }`}
        style={{ backgroundImage: `url(${bottomRight})` }}
      />


      {/* --- TRANSLUCENT FORM BOX --- */}
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
              className="w-36 h-36 border-4 border-white/50 rounded-lg shadow-sm"
            />
            <p className="mt-3 text-sm text-gray-700 font-medium">
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
              className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-shadow"
            />
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-shadow"
            />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-shadow"
            />
            <button
              type="submit"
              className="mt-2 w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-lg shadow hover:shadow-lg transition-all"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};