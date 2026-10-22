import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Frontend Dynamic Promo Banner Verification Suite', async (t) => {
    const editorContent = fs.readFileSync(path.join(__dirname, '../src/modules/admin/components/editors/BannerSectionEditor.jsx'), 'utf8');
    const bannerContent = fs.readFileSync(path.join(__dirname, '../src/modules/user/components/DynamicPromoBanner.jsx'), 'utf8');

    await t.test('1. Admin Editor enforces required Desktop and Mobile images for Dynamic Promo Banner', () => {
        // Must check desktop image
        assert.match(editorContent, /const missingDesktop = items\.find\(\(item\) => !item\.image\?\.trim\(\)\);/);
        assert.match(editorContent, /toast\.error\('Desktop image is required for each banner\.'\);/);

        // Must check mobile image
        assert.match(editorContent, /const missingMobile = items\.find\(\(item\) => !item\.mobileImage\?\.trim\(\)\);/);
        assert.match(editorContent, /toast\.error\('Mobile image is required for each banner\.'\);/);

        // Required Labels with asterisk and guidance
        assert.match(editorContent, /Desktop Image <span className="text-red-500 font-bold">\*<\/span>/);
        assert.match(editorContent, /Mobile Image <span className="text-red-500 font-bold">\*<\/span>/);
        assert.match(editorContent, /✨ Recommended ratio: 2:1 \(e\.g\. 1000x500 px\)\./);
    });

    await t.test('2. Admin Editor clearly marks optional fields for Dynamic Promo Banner', () => {
        assert.match(editorContent, /isDynamicPromoBanner \? "Eyebrow Label \(Optional\)" : "Eyebrow Label"/);
        assert.match(editorContent, /isDynamicPromoBanner \? "Tag \(Optional\)" : "Tag"/);
        assert.match(editorContent, /isDynamicPromoBanner \? "Banner Title \(Optional\)" : "Banner Title"/);
        assert.match(editorContent, /isDynamicPromoBanner \? "Banner Subtitle \(Optional\)" : "Banner Subtitle"/);
        assert.match(editorContent, /isDynamicPromoBanner \? "CTA Label \(Optional\)" : "CTA Label"/);
        assert.match(editorContent, /CTA Link \/ Action \(Optional\)/);
    });

    await t.test('3. DynamicPromoBanner does not inject hardcoded default titles or tags when omitted', () => {
        assert.doesNotMatch(bannerContent, /title:\s*item\.label\s*\|\|\s*['"]Timeless Indian Elegance['"]/);
        assert.doesNotMatch(bannerContent, /tag:\s*item\.tag\s*\|\|\s*['"]Atelier Collection['"]/);
        assert.doesNotMatch(bannerContent, /ctaLabel:\s*item\.ctaLabel\s*\|\|\s*['"]Explore Atelier['"]/);
    });

    await t.test('4. DynamicPromoBanner uses desktop image on desktop and mobile image on mobile', () => {
        // Desktop image in md: viewports
        assert.match(bannerContent, /src=\{banner\.image\}/);
        // Mobile image in < md viewports
        assert.match(bannerContent, /src=\{banner\.mobileImage\}/);
        // No fallback to desktop in mobile view
        assert.doesNotMatch(bannerContent, /src=\{banner\.mobileImage\s*\|\|\s*banner\.image\}/);
    });

    await t.test('5. DynamicPromoBanner conditionally hides empty text, subtitle, and CTA buttons without reserving space', () => {
        // Content flags exist
        assert.match(bannerContent, /const hasTitle = Boolean\(banner\.title\);/);
        assert.match(bannerContent, /const hasSubtitle = Boolean\(banner\.subtitle\);/);
        assert.match(bannerContent, /const hasEyebrow = Boolean\(banner\.name\);/);
        assert.match(bannerContent, /const hasTag = Boolean\(banner\.tag\);/);
        assert.match(bannerContent, /const hasMeta = hasEyebrow \|\| hasTag;/);
        assert.match(bannerContent, /const hasCta = Boolean\(banner\.ctaLabel\);/);

        // Case 1: Image only banner when !hasAnyContent
        assert.match(bannerContent, /!hasAnyContent \? \([\s\S]*?aspect-\[4\/1\][\s\S]*?\)/);
        assert.match(bannerContent, /!hasAnyContent \? \([\s\S]*?aspect-\[2\/1\][\s\S]*?\)/);

        // Content box below mobile image only rendered if hasTitle, hasSubtitle, or hasCta
        assert.match(bannerContent, /\(hasTitle \|\| hasSubtitle \|\| hasCta\) && \(/);

        // Specific element conditionals
        assert.match(bannerContent, /\{hasTitle && \(/);
        assert.match(bannerContent, /\{hasSubtitle && \(/);
        assert.match(bannerContent, /\{hasCta && \(/);
    });

    await t.test('6. Incomplete image records are not rendered or cross-fallbacked', () => {
        assert.match(bannerContent, /Boolean\(String\(item\?\.image \|\| ''\)\.trim\(\)\) && Boolean\(String\(item\?\.mobileImage \|\| ''\)\.trim\(\)\)/);
        assert.doesNotMatch(bannerContent, /mobileImage:[^\n]*resolveLegacyCmsAsset\(item\.image/);
    });

    await t.test('7. Eyebrow and tag render independently when provided', () => {
        assert.match(bannerContent, /\{hasEyebrow && <span>\{banner\.name\}<\/span>\}/);
        assert.match(bannerContent, /\{hasTag && <span>\{banner\.tag\}<\/span>\}/);
    });
});
