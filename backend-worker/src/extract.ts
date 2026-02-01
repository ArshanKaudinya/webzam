import puppeteer from '@cloudflare/puppeteer';
import { Env, RawExtractionData, CTACandidate, TypographySample, BackgroundSample, LogoCandidate, VibeSlice } from './types';

const VIEWPORT = { width: 1440, height: 900 };
const TIMEOUT = 30000;

export async function extractFromUrl(url: string, env: Env): Promise<RawExtractionData> {
  if (!env.BROWSER) {
    throw new Error('Browser Rendering not available. Run with: wrangler dev --remote');
  }

  const browser = await puppeteer.launch(env.BROWSER);

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    // Navigate with timeout
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: TIMEOUT
    });

    // Small buffer for dynamic content
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extract all data in one evaluate call
    const data = await page.evaluate((viewportHeight: number) => {
      const result: RawExtractionData = {
        ctaCandidates: [],
        headingSamples: [],
        bodySamples: [],
        backgroundSamples: [],
        logoCandidates: [],
        vibeSlice: {
          heroH1: null,
          heroSubheading: null,
          primaryCTA: null,
          navLabels: []
        }
      };

      // Helper to check visibility
      function isVisible(el: Element): boolean {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          return false;
        }
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }

      // Helper to get rect
      function getRect(el: Element) {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      }

      // Extract CTA candidates
      const ctaSelectors = 'button, a, [role="button"]';
      document.querySelectorAll(ctaSelectors).forEach(el => {
        if (!isVisible(el)) return;

        const rect = el.getBoundingClientRect();
        const isAboveFold = rect.top < viewportHeight;
        const style = window.getComputedStyle(el);
        const tag = el.tagName.toLowerCase();

        // Must be clickable
        const isClickable = tag === 'button' || (el as HTMLAnchorElement).href;
        if (!isClickable) return;

        const bgColor = style.backgroundColor;
        const borderColor = style.borderColor;

        // Skip if completely transparent
        if (bgColor === 'rgba(0, 0, 0, 0)' && borderColor === 'rgba(0, 0, 0, 0)') {
          return;
        }

        result.ctaCandidates.push({
          tag,
          text: (el.textContent || '').trim().slice(0, 100),
          backgroundColor: bgColor,
          color: style.color,
          borderColor: borderColor,
          borderRadius: style.borderRadius,
          padding: style.padding,
          rect: getRect(el),
          area: rect.width * rect.height,
          isAboveFold
        });
      });

      // Extract heading samples (H1, H2, H3)
      document.querySelectorAll('h1, h2, h3').forEach(el => {
        if (!isVisible(el)) return;
        const rect = el.getBoundingClientRect();
        if (rect.top > viewportHeight * 2) return; // Skip very far down

        const style = window.getComputedStyle(el);
        result.headingSamples.push({
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || '').trim().slice(0, 100),
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          rect: getRect(el)
        });
      });

      // Extract body samples
      document.querySelectorAll('p, li').forEach(el => {
        if (!isVisible(el)) return;
        const rect = el.getBoundingClientRect();
        if (rect.top > viewportHeight * 2) return;

        const style = window.getComputedStyle(el);
        const text = (el.textContent || '').trim();
        if (text.length < 20) return; // Skip very short text

        result.bodySamples.push({
          tag: el.tagName.toLowerCase(),
          text: text.slice(0, 100),
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          rect: getRect(el)
        });
      });

      // Extract background samples
      const bgElements = ['body', 'main', 'header', 'section', '[class*="hero"]', '[class*="banner"]'];
      bgElements.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          if (!isVisible(el)) return;
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          const bgColor = style.backgroundColor;

          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
            result.backgroundSamples.push({
              tag: el.tagName.toLowerCase(),
              backgroundColor: bgColor,
              rect: getRect(el),
              area: rect.width * rect.height
            });
          }
        });
      });

      // Extract logo candidates
      const headerNav = document.querySelector('header, nav, [role="banner"]');

      // SVG logos
      document.querySelectorAll('svg').forEach(el => {
        if (!isVisible(el)) return;
        const rect = el.getBoundingClientRect();
        if (rect.top > 200) return; // Only near top

        const inHeader = headerNav?.contains(el) || rect.top < 100;
        const svgContent = el.outerHTML;

        // Skip very large SVGs (likely not logos)
        if (svgContent.length > 50000) return;

        result.logoCandidates.push({
          type: 'svg',
          svgContent: svgContent,
          rect: getRect(el),
          inHeader
        });
      });

      // Image logos
      document.querySelectorAll('img').forEach(el => {
        if (!isVisible(el)) return;
        const rect = el.getBoundingClientRect();
        if (rect.top > 200) return;

        const img = el as HTMLImageElement;
        const inHeader = headerNav?.contains(el) || rect.top < 100;

        result.logoCandidates.push({
          type: 'img',
          src: img.src,
          srcset: img.srcset || undefined,
          alt: img.alt || undefined,
          rect: getRect(el),
          inHeader
        });
      });

      // Extract vibe slice
      const h1 = document.querySelector('h1');
      if (h1) {
        result.vibeSlice.heroH1 = (h1.textContent || '').trim().slice(0, 200);

        // Try to find subheading near H1
        const nextP = h1.nextElementSibling;
        if (nextP && (nextP.tagName === 'P' || nextP.tagName === 'H2')) {
          result.vibeSlice.heroSubheading = (nextP.textContent || '').trim().slice(0, 300);
        }
      }

      // Primary CTA - first prominent button above fold
      const primaryCta = result.ctaCandidates
        .filter(c => c.isAboveFold && c.tag === 'button' || (c.tag === 'a' && c.backgroundColor !== 'rgba(0, 0, 0, 0)'))
        .sort((a, b) => b.area - a.area)[0];
      if (primaryCta) {
        result.vibeSlice.primaryCTA = primaryCta.text;
      }

      // Nav labels
      const navLinks = document.querySelectorAll('nav a, header a');
      const navLabels: string[] = [];
      navLinks.forEach(el => {
        const text = (el.textContent || '').trim();
        if (text && text.length < 30 && navLabels.length < 8) {
          navLabels.push(text);
        }
      });
      result.vibeSlice.navLabels = navLabels;

      return result;
    }, VIEWPORT.height);

    return data;
  } finally {
    await browser.close();
  }
}
