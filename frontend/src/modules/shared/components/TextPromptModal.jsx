import React, { useEffect, useState } from 'react';
import { Link2, X } from 'lucide-react';

const TextPromptModal = ({
    isOpen,
    onClose,
    onSubmit,
    title = 'Enter value',
    label = 'Value',
    initialValue = '',
    placeholder = '',
    submitLabel = 'Save',
    inputType = 'text'
}) => {
    const [value, setValue] = useState(initialValue);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) setValue(initialValue || '');
    }, [initialValue, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (event) => {
        event.preventDefault();
        const nextValue = value.trim();
        if (!nextValue) return;
        setIsSubmitting(true);
        try {
            const result = await onSubmit?.(nextValue);
            if (result !== false) onClose?.();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="prompt-modal-title">
            <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-label="Close prompt" />
            <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl md:p-8">
                <button type="button" onClick={onClose} className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close">
                    <X className="h-4 w-4" />
                </button>
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-amber-50 p-3 text-amber-700"><Link2 className="h-5 w-5" /></div>
                    <h3 id="prompt-modal-title" className="font-serif text-xl font-bold text-gray-950">{title}</h3>
                </div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-600" htmlFor="prompt-modal-input">{label}</label>
                <input
                    id="prompt-modal-input"
                    type={inputType}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder={placeholder}
                    autoFocus
                    required
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-[#3E2723]"
                />
                <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
                    <button type="submit" disabled={isSubmitting || !value.trim()} className="flex-1 rounded-xl bg-[#3E2723] px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#2D1B18] disabled:opacity-50">
                        {isSubmitting ? 'Saving...' : submitLabel}
                    </button>
                    <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 rounded-xl bg-gray-100 px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default TextPromptModal;
