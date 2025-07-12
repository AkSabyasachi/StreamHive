import React from "react";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import Footer from "./Footer.jsx";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Header />
      <div className="flex pt-16"> {/* Push down below fixed header */}
        <Sidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)] px-4 pb-16 ml-16 md:ml-64">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}