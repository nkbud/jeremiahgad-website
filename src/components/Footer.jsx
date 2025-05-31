
    import React from 'react';
    import { Link } from 'react-router-dom';
    import { Facebook, Linkedin, Instagram, Twitter, Briefcase } from 'lucide-react';

    const Footer = () => {
      const currentYear = new Date().getFullYear();

      return (
        <footer className="bg-slate-800 dark:bg-slate-950 text-slate-300 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-primary-foreground mb-4">
                  <Briefcase className="h-7 w-7 text-primary" />
                  <span>Jeremiah Gadway</span>
                </Link>
                <p className="text-sm">Helping you buy & sell real estate with confidence. Your trusted partner in property.</p>
              </div>

              <div>
                <p className="text-lg font-semibold text-primary-foreground mb-4">Quick Links</p>
                <ul className="space-y-2">
                  <li><Link to="/buyer-academy" className="hover:text-primary transition-colors">Buyer Academy</Link></li>
                  <li><Link to="/seller-academy" className="hover:text-primary transition-colors">Seller Academy</Link></li>
                  <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                  <li><Link to="/consultation" className="hover:text-primary transition-colors">Book a Consultation</Link></li>
                </ul>
              </div>

              <div>
                <p className="text-lg font-semibold text-primary-foreground mb-4">Connect With Me</p>
                <div className="flex space-x-4">
                  <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" aria-label="Facebook"><Facebook /></a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" aria-label="LinkedIn"><Linkedin /></a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" aria-label="Instagram"><Instagram /></a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" aria-label="Twitter"><Twitter /></a>
                </div>
                <p className="mt-4 text-sm">
                  123 Main Street, Anytown, USA
                  <br />
                  (555) 123-4567
                  <br />
                  jeremiah@example.com
                </p>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-8 text-center text-sm">
              <p>&copy; {currentYear} Jeremiah Gadway. All rights reserved.</p>
              <p className="mt-1">Website designed by Hostinger Horizons.</p>
            </div>
          </div>
        </footer>
      );
    };

    export default Footer;
  