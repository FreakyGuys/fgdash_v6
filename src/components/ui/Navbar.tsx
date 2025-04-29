"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  return (
    <nav className="bg-black-freaky px-6 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <div className="h-8 w-auto relative">
          {/* Logo placeholder - será substituído pelo logo real */}
          <div className="text-yellow-freaky font-bold text-xl">Freaky Guys</div>
        </div>
        <div className="ml-8 hidden md:flex space-x-6">
          <Link href="/dashboard" className="text-white hover:text-yellow-freaky transition-colors">
            Dashboard
          </Link>
          <Link href="/reports" className="text-white hover:text-yellow-freaky transition-colors">
            Relatórios
          </Link>
          <Link href="/settings" className="text-white hover:text-yellow-freaky transition-colors">
            Configurações
          </Link>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-white bg-dark-blue px-3 py-1 rounded-md flex items-center">
          <span className="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </span>
          <span className="text-sm">1 de nov. de 2024 - 30 de nov. de 2024</span>
          <span className="ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
        <button className="text-yellow-freaky hover:text-yellow-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <button className="text-yellow-freaky hover:text-yellow-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
