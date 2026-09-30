import React from 'react';
import CollectionCategoryGrid from './CollectionCategoryGrid';
import { homeCategoryGridDefaults } from '../utils/homeCategoryGridDefaults';
import {
    goldCollectionGridDefaults,
    silverCollectionGridDefaults,
    diamondCollectionGridDefaults,
    gemsCollectionGridDefaults
} from '../utils/collectionGridDefaults';

export const CategoryGrid = () => {
    return (
        <CollectionCategoryGrid
            sectionKey="category-grid"
            defaultTitle="Shop by Category"
            defaultEyebrow="Curated Dimensions"
            defaultSubtitle="Handcrafted Categories"
            defaultItems={homeCategoryGridDefaults}
            bgClass="bg-brand-pearl"
        />
    );
};

export const GoldCollectionGrid = (props) => {
    return (
        <CollectionCategoryGrid
            sectionKey="gold-collection-grid"
            defaultTitle="Gold Collection"
            defaultEyebrow="Pure Radiance"
            defaultSubtitle="Timeless gold jewellery crafted with exceptional artistry"
            defaultItems={goldCollectionGridDefaults}
            bgClass="bg-brand-pearl"
            {...props}
        />
    );
};

export const SilverCollectionGrid = () => {
    return (
        <CollectionCategoryGrid
            sectionKey="silver-collection-grid"
            defaultTitle="Silver Collection"
            defaultEyebrow="Sterling Elegance"
            defaultSubtitle="Handcrafted 925 sterling silver essentials for everyday elegance"
            defaultItems={silverCollectionGridDefaults}
            bgClass="bg-brand-pearl"
        />
    );
};

export const DiamondCollectionGrid = () => {
    return (
        <CollectionCategoryGrid
            sectionKey="diamond-collection-grid"
            defaultTitle="Diamond Collection"
            defaultEyebrow="Timeless Sparkle"
            defaultSubtitle="Dazzling certified diamond jewellery designed to capture light"
            defaultItems={diamondCollectionGridDefaults}
            bgClass="bg-white"
        />
    );
};

export const GemsCollectionGrid = (props) => {
    return (
        <CollectionCategoryGrid
            sectionKey="gems-collection-grid"
            defaultTitle="Gems Collection"
            defaultEyebrow="The Art of Colour"
            defaultSubtitle="Explore gemstone jewellery by style and setting"
            defaultItems={gemsCollectionGridDefaults}
            bgClass="bg-brand-pearl"
            {...props}
        />
    );
};

export default CategoryGrid;
