import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="logo-footer mt-12">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-dark-text">
        <div className="flex justify-center items-center mb-4 space-x-6">
            <a 
                href="https://www.youtube.com/channel/UCFMe_i5ZjRERKt874swTl6g" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="C-Drama Jewel on YouTube"
                className="text-dark-text hover:text-dark-accent transition-colors logo-glow-pink"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M19.802 5.322a3.684 3.684 0 012.606 2.605c.348 1.32.348 4.073.348 4.073s0 2.753-.348 4.073a3.684 3.684 0 01-2.606 2.605c-1.32.348-6.802.348-6.802.348s-5.482 0-6.802-.348a3.684 3.684 0 01-2.606-2.605C.344 14.753.344 12 .344 12s0-2.753.348-4.073A3.684 3.684 0 013.3 5.322c1.32-.348 6.802-.348 6.802-.348s5.482 0 6.802.348zM9.75 14.85V9.15l4.875 2.85L9.75 14.85z" clipRule="evenodd" />
                </svg>
            </a>
            <a
                href="https://www.tiktok.com/@cdramajewelofficial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="C-Drama Jewel on TikTok"
                className="text-dark-text hover:text-dark-accent transition-colors logo-glow-pink"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.85-.38-6.75-1.77-2.06-1.48-3.06-3.75-2.9-6.33.05-1.09.34-2.16.82-3.12.51-1.02 1.2-1.93 2.02-2.72.63-.6 1.34-1.1 2.12-1.5.76-.39 1.57-.64 2.4-.76.24-.03.48-.07.72-.09.09-2.52.01-5.04.02-7.56h4.03z"></path>
                </svg>
            </a>
            <a
                href="https://www.instagram.com/cdramajewelofficial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="C-Drama Jewel on Instagram"
                className="text-dark-text hover:text-dark-accent transition-colors logo-glow-pink"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/>
                </svg>
            </a>
            <a
                href="https://www.facebook.com/share/19chYhfeNt/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="C-Drama Jewel on Facebook"
                className="text-dark-text hover:text-dark-accent transition-colors logo-glow-pink"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
            </a>
            <a
                href="https://x.com/CDJewel_Offic"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="C-Drama Jewel on X"
                className="text-dark-text hover:text-dark-accent transition-colors logo-glow-pink"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
            </a>
        </div>
        <p>&copy; {new Date().getFullYear()} C-Drama Jewel. All Rights Reserved.</p>
        <p className="text-xs mt-2">This is a fictional service for demonstration purposes.</p>
      </div>
    </footer>
  );
};

export default Footer;