import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, Send, ChevronLeft, Plus, Headphones, Inbox, Paperclip, Trash2 } from "lucide-react";
import { useSupport } from "../../../context/SupportContext";
import toast from "react-hot-toast";
import { getLenis } from "../../../lib/lenis";

const SupportChatPanel = () => {
  const {
    tickets,
    activeTicket,
    activeTicketId,
    setActiveTicketId,
    isOpen,
    setIsOpen,
    createNewTicket,
    sendReply,
    isLoading,
  } = useSupport();

  const [view, setView] = useState("list"); // 'list' | 'chat' | 'create'
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const panelRef = useRef(null);
  const [stagedAttachments, setStagedAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Clear staged files on view change
  useEffect(() => {
    setStagedAttachments([]);
  }, [view]);

  // Reset view when widget opens/closes
  useEffect(() => {
    if (isOpen && !activeTicketId) {
      setView("list");
    }
  }, [isOpen, activeTicketId]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error("File size must be under 20MB");
      return;
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      toast.error("Only image and video uploads are supported");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const { uploadToCloudinary } = await import("../../../utils/upload");
      const attachment = await uploadToCloudinary(
        file,
        "user/support/upload-signature",
        (progress) => setUploadProgress(progress)
      );

      setStagedAttachments(prev => [...prev, attachment]);
      toast.success("File uploaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed: " + (err.message || "Unknown error"));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeStagedAttachment = (idx) => {
    setStagedAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const renderAttachments = (attachments) => {
    if (!attachments || attachments.length === 0) return null;
    return (
      <div className="flex flex-col gap-2 mt-2 max-w-full">
        {attachments.map((att, idx) => (
          <div key={idx} className="relative">
            {att.type === 'video' ? (
              <video
                src={att.url}
                controls
                preload="none"
                className="max-h-40 rounded-lg border border-gray-200 bg-brand-plum"
              />
            ) : (
              <img
                src={att.url}
                alt={att.name || "attachment"}
                className="max-h-40 rounded-lg border border-gray-200 cursor-pointer object-contain bg-gray-50"
                onClick={() => window.open(att.url, '_blank')}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTicket?.replies]);

  // Open ticket chat when a notification targets a specific ticket
  useEffect(() => {
    if (activeTicketId && isOpen) {
      setView("chat");
    }
  }, [activeTicketId, isOpen]);

  // Lock body scroll and stop Lenis smooth scroll when chat is open
  useEffect(() => {
    const lenis = getLenis();
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.documentElement.classList.add("lenis-stopped");
      if (lenis) {
        lenis.stop();
      }
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.documentElement.classList.remove("lenis-stopped");
      if (lenis) {
        lenis.start();
      }
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.documentElement.classList.remove("lenis-stopped");
      if (lenis) {
        lenis.start();
      }
    };
  }, [isOpen]);

  const handleCreateTicketSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || (!message.trim() && stagedAttachments.length === 0)) return;
    const ticket = await createNewTicket(subject, category, message, '', stagedAttachments);
    if (ticket) {
      setSubject("");
      setMessage("");
      setStagedAttachments([]);
      setView("chat");
    }
  };

  const handleSendReplySubmit = async (e) => {
    e.preventDefault();
    if ((!replyText.trim() && stagedAttachments.length === 0) || !activeTicketId) return;
    const success = await sendReply(activeTicketId, replyText, stagedAttachments);
    if (success) {
      setReplyText("");
      setStagedAttachments([]);
    }
  };

  const categories = [
    "General Inquiry",
    "Order Tracking",
    "Payment Issue",
    "Return/Refund",
    "Product Feedback",
    "Other",
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Open":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "In Progress":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Resolved":
        return "bg-green-50 text-green-700 border-green-100";
      case "Closed":
        return "bg-gray-50 text-gray-700 border-gray-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          data-lenis-prevent
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 right-0 z-[10000] flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden border border-gray-100 bg-white shadow-2xl md:bottom-[11.5rem] md:right-6 md:h-[550px] md:max-h-[calc(100vh-13.5rem)] md:w-[380px] md:rounded-3xl"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-brand-champagne/20 bg-brand-plum px-4 py-3 text-brand-pearl md:px-6 md:py-4">
            <div className="flex items-center gap-3">
              {view !== "list" && (
                <button
                  type="button"
                  onClick={() => {
                    setView("list");
                    setActiveTicketId(null);
                  }}
                  className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
                  aria-label="Back to support tickets"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-champagne/30 bg-brand-champagne/15 md:h-10 md:w-10">
                <Headphones className="h-4 w-4 text-brand-champagne-light md:h-5 md:w-5" />
              </div>
              <div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wide text-brand-pearl md:text-sm md:normal-case">
                  Alankarr Jewellers Support
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] text-brand-champagne-light font-medium">
                    Support Online
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-grow overflow-hidden flex flex-col bg-gray-50/50">
            <AnimatePresence mode="wait">
              {/* 1. TICKET CHAT VIEW */}
              {view === "chat" && activeTicket && (
                <motion.div
                  key="chat-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-grow flex flex-col overflow-hidden h-full"
                >
                  {/* Active Ticket Details TopBar */}
                  <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setActiveTicketId(null);
                        setView("list");
                      }}
                      className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-brand-espresso transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {activeTicket.subject}
                      </p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                        #{activeTicket.ticketId}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(activeTicket.status)}`}
                    >
                      {activeTicket.status}
                    </span>
                  </div>

                  {/* Messages Scroll Thread */}
                  <div className="flex-grow overflow-y-auto overscroll-contain p-4 space-y-4">
                    {/* Original Initial message */}
                    <div className="flex flex-col items-start max-w-[85%]">
                      <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs font-medium shadow-sm border border-gray-200/50">
                        {activeTicket.message}
                        {renderAttachments(activeTicket.attachments)}
                      </div>
                      <span className="text-[9px] text-gray-400 mt-1 pl-1">
                        {new Date(activeTicket.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Replies */}
                    {activeTicket.replies?.slice(1).map((reply, i) => {
                      const isAdmin = reply.from === "admin";
                      return (
                        <div
                          key={i}
                          className={`flex flex-col max-w-[85%] ${isAdmin ? "items-start" : "items-end ml-auto"}`}
                        >
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-xs font-medium shadow-sm border ${isAdmin
                              ? "bg-white text-gray-800 rounded-tl-none border-gray-200/50"
                              : "bg-brand-plum text-brand-pearl rounded-tr-none border-brand-champagne/30"
                              }`}
                          >
                            {reply.text}
                            {renderAttachments(reply.attachments)}
                          </div>
                          <span className="text-[9px] text-gray-400 mt-1 px-1">
                            {new Date(reply.date || reply.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input form */}
                  {activeTicket.status !== "Closed" && activeTicket.status !== "Resolved" ? (
                    <div className="flex flex-col shrink-0">
                      {stagedAttachments.length > 0 && (
                        <div className="bg-white border-t border-gray-100 px-3 py-2 flex flex-wrap gap-2">
                          {stagedAttachments.map((att, idx) => (
                            <div key={idx} className="relative group w-12 h-12 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                              {att.type === 'video' ? (
                                <video src={att.url} className="w-full h-full object-cover" />
                              ) : (
                                <img src={att.url} className="w-full h-full object-cover" />
                              )}
                              <button
                                type="button"
                                onClick={() => removeStagedAttachment(idx)}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {isUploading && (
                        <div className="bg-white border-t border-gray-100 px-4 py-2 flex items-center gap-3">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Uploading: {uploadProgress}%</span>
                          <div className="flex-grow h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-champagne transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        </div>
                      )}
                      <form
                        onSubmit={handleSendReplySubmit}
                        className="bg-white border-t border-gray-100 p-3 flex gap-2 items-center"
                      >
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <input
                          type="text"
                          placeholder="Type message..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="flex-grow bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-xs text-gray-900 focus:outline-none focus:border-brand-champagne transition-all"
                        />
                        <button
                          type="submit"
                          disabled={!replyText.trim() && stagedAttachments.length === 0}
                          className="w-8 h-8 rounded-full bg-brand-plum text-brand-champagne-light border border-brand-champagne/40 flex items-center justify-center hover:bg-brand-plum hover:border-brand-champagne disabled:opacity-40 transition-all shrink-0 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-white border-t border-gray-100 p-4 text-center text-xs text-gray-400 font-bold shrink-0">
                      This support ticket is resolved/closed.
                    </div>
                  )}
                </motion.div>
              )}

              {/* 2. TICKET LIST VIEW */}
              {view === "list" && (
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex-grow flex flex-col overflow-hidden h-full"
                >
                  {/* Main CTA */}
                  <div className="shrink-0 p-3 md:p-4">
                    <button
                      onClick={() => setView("create")}
                      className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-brand-champagne/40 bg-brand-plum px-4 py-3 text-xs font-bold text-brand-champagne-light shadow-sm transition-all hover:border-brand-champagne hover:bg-brand-plum hover:text-brand-pearl"
                    >
                      <Plus className="w-4 h-4" />
                      Create Support Request
                    </button>
                  </div>

                  <div className="flex-grow space-y-3 overflow-y-auto overscroll-contain px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:px-4 md:pb-4">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 pl-1">
                      Your Support History
                    </div>

                    {isLoading ? (
                      <div className="flex justify-center items-center py-10">
                        <span className="w-6 h-6 border-2 border-gray-200 border-t-brand-champagne rounded-full animate-spin"></span>
                      </div>
                    ) : tickets.length > 0 ? (
                      tickets.map((t) => (
                        <div
                          key={t._id}
                          onClick={() => {
                            setActiveTicketId(t._id);
                            setView("chat");
                          }}
                          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-brand-champagne transition-all cursor-pointer group flex flex-col gap-2"
                        >
                          <div className="flex justify-between items-start">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(t.status)}`}
                            >
                              {t.status}
                            </span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                              #{t.ticketId}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-gray-900 group-hover:text-brand-champagne transition-colors line-clamp-1">
                            {t.subject}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-medium line-clamp-1">
                            {t.replies && t.replies.length > 0
                              ? t.replies[t.replies.length - 1].text
                              : t.message}
                          </p>
                          <div className="text-[9px] text-gray-400/80 font-bold uppercase tracking-widest text-right mt-1">
                            {new Date(t.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-200/80 bg-white p-4 py-6 text-center md:p-6 md:py-12">
                        <Inbox className="mx-auto mb-2 h-7 w-7 text-gray-300 md:mb-3 md:h-8 md:w-8" />
                        <p className="text-xs text-gray-500 font-semibold mb-1">
                          No support tickets found
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Need help with an order or product? Create a support request.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 3. TICKET CREATION VIEW */}
              {view === "create" && (
                <motion.div
                  key="create-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex-grow flex flex-col overflow-hidden h-full"
                >
                  <div className="bg-white border-b border-gray-100 px-4 py-3.5 flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setView("list")}
                      className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-brand-espresso transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h4 className="text-xs font-bold text-gray-900">
                      New Support Request
                    </h4>
                  </div>

                  <form
                    onSubmit={handleCreateTicketSubmit}
                    className="flex flex-grow flex-col space-y-3 overflow-y-auto overscroll-contain p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:p-4 sm:space-y-4"
                  >
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Subject
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="What do you need help with?"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-brand-champagne transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-brand-champagne transition-all"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex min-h-[120px] flex-grow flex-col sm:min-h-[150px]">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Detailed Message
                      </label>
                      <textarea
                        required
                        placeholder="Please describe your query..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        className="w-full flex-grow bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-brand-champagne resize-none transition-all"
                      />
                    </div>

                    {/* Attachments Section */}
                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        Attachments (Optional)
                      </label>

                      {stagedAttachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 py-1">
                          {stagedAttachments.map((att, idx) => (
                            <div key={idx} className="relative group w-12 h-12 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                              {att.type === 'video' ? (
                                <video src={att.url} className="w-full h-full object-cover" />
                              ) : (
                                <img src={att.url} className="w-full h-full object-cover" />
                              )}
                              <button
                                type="button"
                                onClick={() => removeStagedAttachment(idx)}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {isUploading && (
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Uploading: {uploadProgress}%</span>
                          <div className="flex-grow h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-champagne transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 border border-dashed border-gray-300 hover:border-brand-champagne hover:text-brand-champagne rounded-lg text-[10px] font-bold text-gray-500 flex items-center gap-1.5 transition-all cursor-pointer w-max"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        Add Photo/Video
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isUploading}
                      className="w-full bg-brand-plum text-brand-champagne-light border border-brand-champagne/40 hover:bg-brand-plum hover:border-brand-champagne py-3 rounded-xl font-bold transition-all shadow-sm text-xs cursor-pointer mt-auto shrink-0 disabled:opacity-50"
                    >
                      Submit Request
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="hidden"
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SupportChatPanel;
