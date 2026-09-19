import React from 'react';

const Footer = () => (
  <footer className="py-8 border-t border-border/50 bg-background/80">
    <div className="container mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()}{' '}
        <span className="font-heading font-bold text-gradient">MAO SEDTHA</span>.
        {' '}All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
