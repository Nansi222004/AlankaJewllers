const normalized = (value) => String(value || '').trim().toLowerCase();

const excludedMaterial = (value) => /(plated|alloy|imitation|antique|fashion)/i.test(value);

export const getVerifiedReferenceRate = (product, rates) => {
    if (!product || !rates?.success) return null;
    const material = normalized(product.material || product.metal);
    const settingMetal = normalized(product.settingMetal);
    if (excludedMaterial(material) || excludedMaterial(settingMetal)) return null;

    const goldPurity = String(product.goldCategory || '').trim();
    const settingPurity = String(product.settingPurity || '').trim().toUpperCase().replace('K', '');
    const genuineGold = ['gold', 'solid gold', 'yellow gold', 'white gold', 'rose gold'].includes(material);
    const genuineGoldSetting = ['gold', 'white gold', 'rose gold'].includes(settingMetal);
    const purity = genuineGold ? goldPurity : (genuineGoldSetting ? settingPurity : '');
    if (['18', '22', '24'].includes(purity) && rates.gold?.[`${purity}K`]) {
        return {
            metal: 'gold',
            label: `${purity}K Gold`,
            ...rates.gold[`${purity}K`],
        };
    }

    const silverPurity = normalized(product.silverCategory || (settingMetal === 'silver' ? product.settingPurity : ''));
    const genuineSilver = ['silver', 'fine silver'].includes(material) || settingMetal === 'silver';
    if (genuineSilver && ['999', 'fine', 'fine silver'].includes(silverPurity) && rates.silver) {
        return { metal: 'silver', label: '999 Silver', ...rates.silver };
    }
    return null;
};

export const formatRateUnit = (unit) => {
    if (unit === 'per_gram' || unit === 'per_gram_24k') return '/ gram';
    if (unit === 'per_10g') return '/ 10g';
    return unit ? `/ ${String(unit).replace(/^per_/, '').replaceAll('_', ' ')}` : '';
};

export const calculateReferenceMetalValue = ({ rate, rateUnit, verifiedNetMetalWeight, weightUnit }) => {
    const numericRate = Number(rate);
    const numericWeight = Number(verifiedNetMetalWeight);
    if (!(numericRate > 0) || !(numericWeight > 0)) return null;
    const unit = normalized(weightUnit);
    if (['per_gram', 'per_gram_24k'].includes(rateUnit) && ['g', 'gram', 'grams'].includes(unit)) {
        return numericRate * numericWeight;
    }
    if (rateUnit === 'per_10g' && ['10g', '10 grams'].includes(unit)) {
        return numericRate * numericWeight;
    }
    return null;
};
