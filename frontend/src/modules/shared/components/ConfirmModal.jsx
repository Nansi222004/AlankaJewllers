import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Please confirm',
    description = 'Are you sure you want to continue?',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    tone = 'danger'
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !isSubmitting) onClose?.();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isSubmitting, onClose]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            const result = await onConfirm?.();
            if (result !== false) onClose?.();
        } finally {
            setIsSubmitting(false);
        }
    };

    const isDanger = tone === 'danger';

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
            <button
                type="button"
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => !isSubmitting && onClose?.()}
                aria-label="Close confirmation"
            />
            <div className="relative z-10 w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl md:p-8">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="absolute right-5 top-5 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                    aria-label="Close"
                >
                    <X className="h-4 w-4" />
                </button>
                <div className="flex flex-col items-center text-center">
                    <div className={`mb-6 rounded-full p-4 ${isDanger ? 'bg-red-50' : 'bg-amber-50'}`}>
                        <AlertTriangle className={`h-10 w-10 ${isDanger ? 'text-red-500' : 'text-amber-500'}`} />
                    </div>
                    <h3 id="confirm-modal-title" className="mb-3 font-serif text-xl font-bold text-gray-950 md:text-2xl">{title}</h3>
                    <p className="mb-8 text-sm leading-relaxed text-gray-500">{description}</p>
                    <div className="flex w-full flex-col gap-3 sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                            className={`flex-1 rounded-xl px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 ${isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-[#3E2723] hover:bg-[#2D1B18]'}`}
                        >
                            {isSubmitting ? 'Please wait...' : confirmLabel}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl bg-gray-100 px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-gray-600 transition-all hover:bg-gray-200 disabled:opacity-50"
                        >
                            {cancelLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
