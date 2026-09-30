import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Headphones, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupport } from "../../../context/SupportContext";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import SupportChatPanel from "./SupportChatPanel";

const SupportChatWidget = ({ inline = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isCustomer = user?.role === "user";
  const {
    tickets,
    isOpen,
    setIsOpen,
  } = useSupport();

  const handleToggleOpen = () => {
    if (!isOpen) {
      if (!isCustomer) {
        toast("Please log in to open a support ticket.", { icon: "🔐" });
        navigate("/login", { state: { from: "/help-center" } });
        return;
      }
      setIsOpen(true);
      return;
    }
    setIsOpen(false);
  };

  const buttonPositionClass = inline
    ? "support-floating relative"
    : "support-floating fixed bottom-[calc(5rem+3.5rem+0.75rem)] md:bottom-[calc(2rem+4rem+0.75rem)] right-6 z-[10000]";

  return (
    <div className="support-chat-widget-container">
      {/* Floating Button — visible for all visitors */}
      <motion.button
        onClick={handleToggleOpen}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Contact support"
        className={`${buttonPositionClass} group flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-brand-champagne/40 bg-brand-plum text-brand-champagne-light shadow-[0_10px_25px_rgba(51,40,39,0.4)] transition-all hover:border-brand-champagne hover:bg-brand-plum hover:text-brand-pearl md:h-14 md:w-14`}>
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-5 w-5 md:h-6 md:w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="relative">
              <Headphones className="h-5 w-5 md:h-6 md:w-6" />
              {/* Unread dot indicator */}
              {isCustomer &&
                tickets.some((t) => t.status === "In Progress") && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Separate Chat Panel Component */}
      <SupportChatPanel />
    </div>
  );
};

export default SupportChatWidget;
