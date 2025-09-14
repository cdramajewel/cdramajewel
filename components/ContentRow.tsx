
import React from 'react';
import type { Content } from '../types';
import ContentCard from './ContentCard';

interface ContentRowProps {
  title: string;
  items: Content[];
}

const ContentRow: React.FC<ContentRowProps> = ({ title, items }) => {
  if (items.length === 0) return null;

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4 px-4 sm:px-6 lg:px-8">{title}</h2>
      <div className="relative">
        <div className="flex overflow-x-auto space-x-2 pb-4 pl-4 sm:pl-6 lg:pl-8 scrollbar-hide">
          {items.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
          <div className="flex-shrink-0 w-4 sm:w-6 lg:w-8"></div>
        </div>
      </div>
    </div>
  );
};

// Add CSS to hide scrollbar if not using a plugin
const style = document.createElement('style');
style.innerHTML = `
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}
`;
document.head.appendChild(style);


export default ContentRow;
