import React from 'react';
import { Header } from "@/components/landing/Header";

const News = () => {
  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] text-white">
      <Header isScrolled={true} />
      <div className="container mx-auto px-4 pt-32">
        <h1 className="text-4xl font-bold mb-8">News</h1>
        <p>Coming soon...</p>
      </div>
    </div>
  );
};

export default News;