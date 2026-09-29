import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Bell, Heart, User, ShoppingBag } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import { motion } from 'framer-motion';

const MobileBottomNav = () => {
    const location = useLocation();
    
    const leftItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Wishlist', path: '/wishlist', icon: Heart },
    ];
    
    const { unreadCount } = useNotification();

    const rightItems = [
        { name: 'Inbox', path: '/notifications', icon: Bell, badge: unreadCount },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[200] pb-safe drop-shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pointer-events-none">
            {/* The actual navigation bar container with pointer events enabled */}
            <div className="relative h-16 pointer-events-auto flex">
                {/* Left Background */}
                <div className="flex-1 bg-white h-full rounded-tr-[20px]" />
                
                {/* Center SVG Cutout Background */}
                <div className="w-[100px] h-[64px] bg-transparent relative flex-shrink-0">
                    <svg width="100" height="64" viewBox="0 0 100 64" className="absolute top-0 left-0 w-full h-full fill-white">
                        <path d="M 0,0 Q 20,0 20,20 A 30,30 0 0,0 80,20 Q 80,0 100,0 V 64 H 0 Z" />
                    </svg>
                </div>
                
                {/* Right Background */}
                <div className="flex-1 bg-white h-full rounded-tl-[20px]" />

                {/* Navigation Items Overlay */}
                <div className="absolute inset-0 flex items-center justify-between px-2">
                    
                    {/* Left Items */}
                    <div className="flex flex-1 justify-around h-full items-center">
                        {leftItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative ${
                                        isActive ? 'text-brand-plum' : 'text-brand-taupe hover:text-brand-espresso'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && (
                                            <motion.div layoutId="nav-indicator" className="absolute -top-1 w-1.5 h-1.5 bg-brand-champagne rounded-full" />
                                        )}
                                        <div className="relative">
                                            <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'fill-current scale-110' : 'scale-100'}`} strokeWidth={isActive ? 2.5 : 2} />
                                            {item.badge > 0 && (
                                                <span className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-brand-espresso font-bold" style={{ width: 14, height: 14, fontSize: 8, background: 'linear-gradient(135deg, #D8C3A5, #B8956A)' }}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`text-[10px] tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>
                                            {item.name}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>

                    {/* Center Floating Action Button */}
                    <div className="w-[70px] flex justify-center h-full relative z-10">
                        <NavLink
                            to="/shop"
                            className={({ isActive }) =>
                                `absolute -top-6 flex items-center justify-center w-14 h-14 rounded-full shadow-[0_4px_18px_rgba(184,149,106,0.35)] transition-transform active:scale-95 border border-brand-champagne/40 ${
                                    isActive ? 'bg-brand-plum scale-105' : 'bg-brand-plum'
                                }`
                            }
                        >
                            <ShoppingBag className="w-6 h-6 text-brand-champagne-light" strokeWidth={2.5} />
                        </NavLink>
                    </div>

                    {/* Right Items */}
                    <div className="flex flex-1 justify-around h-full items-center">
                        {rightItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative ${
                                        isActive ? 'text-brand-plum' : 'text-brand-taupe hover:text-brand-espresso'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && (
                                            <motion.div layoutId="nav-indicator" className="absolute -top-1 w-1.5 h-1.5 bg-brand-champagne rounded-full" />
                                        )}
                                        <div className="relative">
                                            <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'fill-current scale-110' : 'scale-100'}`} strokeWidth={isActive ? 2.5 : 2} />
                                            {item.badge > 0 && (
                                                <span className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-brand-espresso font-bold" style={{ width: 14, height: 14, fontSize: 8, background: 'linear-gradient(135deg, #D8C3A5, #B8956A)' }}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`text-[10px] tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>
                                            {item.name}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MobileBottomNav;
