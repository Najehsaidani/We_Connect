
import React from 'react';

interface ClubsHeaderProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ClubsHeader = ({ 
  categories, 
  activeCategory, 
  onCategoryChange,
  searchQuery,
  onSearchChange
}: ClubsHeaderProps) => {
  return (
    <>
      <div className="mb-8">
        <h1 className="page-title">Clubs & Associations</h1>
        <p className="page-subtitle">
          Découvrez et rejoignez les clubs et associations du campus
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex overflow-x-auto pb-2 space-x-2 w-full md:w-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <input
            type="text"
            placeholder="Rechercher un club..."
            className="pl-10 pr-4 py-2 w-full md:w-64 rounded-md border border-input"
            value={searchQuery}
            onChange={onSearchChange}
          />
        </div>
      </div>
    </>
  );
};

export default ClubsHeader;
