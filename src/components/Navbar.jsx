import React, { useState } from 'react';
    import { Link, NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Menu, X, Briefcase, LogIn, LogOut, UserCircle, Settings, ShieldCheck, Info as InfoIcon } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useAuth } from '@/contexts/AuthContext';
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    } from "@/components/ui/dropdown-menu";
    import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

    const NavLink = ({ to, children, Icon, onClick, className = '' }) => (
      <RouterNavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
          `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out
           ${isActive
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-foreground hover:bg-primary/10 hover:text-primary dark:text-slate-200 dark:hover:bg-primary/20 dark:hover:text-primary'
          } ${className}`
        }
      >
        {Icon && <Icon className="mr-2 h-5 w-5" />}
        {children}
      </RouterNavLink>
    );
    
    const UserNav = ({ authNavLinks }) => {
      const { user, signOut, isAdmin, profile } = useAuth();
      const navigate = useNavigate();

      if (!user) {
        return (
          <Button variant="outline" onClick={() => navigate('/auth')} className="ml-2">
            <LogIn className="mr-2 h-4 w-4" />
            Login / Sign Up
          </Button>
        );
      }
    
      const userInitial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : '?');
      const userDisplayName = profile?.full_name || user.email;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full ml-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar_url} alt={userDisplayName} />
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userDisplayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {authNavLinks.filter(link => !link.public && (!link.adminOnly || (link.adminOnly && isAdmin))).map(link => (
                <DropdownMenuItem key={link.to} onClick={() => navigate(link.to)}>
                    {link.Icon && <link.Icon className={`mr-2 h-4 w-4 ${link.to === '/admin-dashboard' || link.to === '/admin/instructions' ? 'text-emerald-500' : ''}`} />}
                    <span>{link.label}</span>
                </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={() => navigate('/settings')} disabled>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    };


    const Navbar = ({ baseNavLinks, authNavLinks }) => {
      const [isOpen, setIsOpen] = useState(false);
      const { user, isAdmin } = useAuth();

      const toggleMenu = () => setIsOpen(!isOpen);

      const mobileMenuVariants = {
        closed: { opacity: 0, y: -20 },
        open: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
      };

      const mobileLinkVariants = {
        closed: { opacity: 0, y: -10 },
        open: { opacity: 1, y: 0 },
      };
      
      let displayedNavLinks = baseNavLinks.filter(l => l.public !== false);
      // For mobile menu, we add auth links if user is logged in
      let mobileDisplayedNavLinks = [...displayedNavLinks];
      if (user) {
        mobileDisplayedNavLinks = [
            ...mobileDisplayedNavLinks,
            ...authNavLinks.filter(link => !link.public && (!link.adminOnly || (link.adminOnly && isAdmin)))
        ];
      }


      return (
        <nav className="bg-background/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-primary">
                <Briefcase className="h-8 w-8" />
                <span>Jeremiah Gadway</span>
              </Link>

              <div className="hidden md:flex items-center">
                <div className="flex items-center space-x-1">
                  {displayedNavLinks.map(link => (
                    <NavLink key={link.to} to={link.to} Icon={link.Icon}>
                      {link.label}
                    </NavLink>
                  ))}
                </div>
                <UserNav authNavLinks={authNavLinks} />
              </div>


              <div className="md:hidden flex items-center">
                 <UserNav authNavLinks={authNavLinks} />
                <Button variant="ghost" onClick={toggleMenu} aria-label="Toggle menu" className="ml-2">
                  {isOpen ? <X className="h-6 w-6 text-primary" /> : <Menu className="h-6 w-6 text-primary" />}
                </Button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                variants={mobileMenuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="md:hidden absolute top-full left-0 right-0 bg-background/95 dark:bg-slate-900/95 shadow-xl pb-4 border-t border-border"
              >
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                  {mobileDisplayedNavLinks.map(link => (
                    <motion.div key={link.to} variants={mobileLinkVariants}>
                      <NavLink to={link.to} Icon={link.Icon} onClick={() => setIsOpen(false)}>
                        {link.label}
                      </NavLink>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      );
    };

    export default Navbar;