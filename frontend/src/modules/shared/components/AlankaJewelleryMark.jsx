import React from 'react';

/**
 * AlankarJewelleryMark
 *
 * Dedicated, bespoke jewellery atelier decorative glyph for Alankarr Jewellers.
 * Features an elegant, four-faceted step-cut gemstone mark with a refined
 * central table facet and corner convergence lines.
 *
 * Authentic luxury jewellery hallmark that scales cleanly down to 12-14px.
 */
export const AlankarJewelleryMark = ({
    className = 'w-3.5 h-3.5 text-brand-champagne',
    size,
    strokeWidth = 1.5,
    ...props
}) => {
    const styleProps = size ? { width: size, height: size } : {};

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`inline-block shrink-0 ${className}`}
            style={styleProps}
            aria-hidden="true"
            {...props}
        >
            {/* Outer faceted gemstone contour */}
            <path d="M12 2.5 L20.5 12 L12 21.5 L3.5 12 Z" />
            {/* Inner brilliant table facet */}
            <path d="M12 7 L16.5 12 L12 17 L7.5 12 Z" />
            {/* Facet convergence ribs */}
            <line x1="12" y1="2.5" x2="12" y2="7" />
            <line x1="20.5" y1="12" x2="16.5" y2="12" />
            <line x1="12" y1="21.5" x2="12" y2="17" />
            <line x1="3.5" y1="12" x2="7.5" y2="12" />
        </svg>
    );
};

export const AlankarJewelleryMark = AlankarJewelleryMark;
export const AlankaJewelleryMark = AlankarJewelleryMark;

export default AlankarJewelleryMark;
