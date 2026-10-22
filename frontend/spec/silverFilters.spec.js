import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('AllJewelleryMegaMenu contains exactly 925 SILVER, SILVER, and SILVER ARTICLES', () => {
    const menuContent = fs.readFileSync(path.join(__dirname, '../src/modules/user/components/AllJewelleryMegaMenu.jsx'), 'utf8');

    // 1. Must contain the 3 exact options in silverPurities
    assert.match(menuContent, /name:\s*['"]925 SILVER['"]/);
    assert.match(menuContent, /name:\s*['"]SILVER['"]/);
    assert.match(menuContent, /name:\s*['"]SILVER ARTICLES['"]/);

    // 2. Must NOT contain Fine Silver anywhere in silverPurities or menu
    assert.doesNotMatch(menuContent, /name:\s*['"]FINE SILVER['"]/i);
    assert.doesNotMatch(menuContent, /silver_type=fine/i);

    // 3. Grid layout must accommodate 3 columns
    assert.match(menuContent, /grid-cols-1\s+sm:grid-cols-3/);
});

test('jewelleryFiltersConfig has 925, articles, all and NO Fine Silver', () => {
    const configContent = fs.readFileSync(path.join(__dirname, '../src/config/jewelleryFiltersConfig.js'), 'utf8');

    assert.match(configContent, /value:\s*['"]925['"]/);
    assert.match(configContent, /value:\s*['"]articles['"]/);
    assert.match(configContent, /label:\s*['"]Silver Articles['"]/);

    // Must not have Fine Silver
    assert.doesNotMatch(configContent, /Fine Silver/i);
    assert.doesNotMatch(configContent, /value:\s*['"]fine['"]/i);
});

test('HorizontalFilters and Shop do not offer Fine Silver in purity filters', () => {
    const shopContent = fs.readFileSync(path.join(__dirname, '../src/modules/user/pages/Shop.jsx'), 'utf8');
    const filterContent = fs.readFileSync(path.join(__dirname, '../src/modules/user/components/HorizontalFilters.jsx'), 'utf8');

    // Neither should have 'Fine Silver'
    assert.doesNotMatch(shopContent, /label:\s*['"]Fine Silver['"]/i);
    assert.doesNotMatch(filterContent, /label:\s*['"]Fine Silver['"]/i);
});
