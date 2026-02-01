import puppeteer from '@cloudflare/puppeteer';
import { Env, RawExtractionData, CTACandidate, TypographySample, BackgroundSample, LogoCandidate, VibeSlice } from './types';

const VIEWPORT = { width: 1440, height: 900 };
const TIMEOUT = 60000;

export async function extractFromUrl(url: string, env: Env): Promise<RawExtractionData> {
  if (!env.BROWSER) {
    throw new Error('Browser Rendering not available. Run with: wrangler dev --remote');
  }

  const browser = await puppeteer.launch(env.BROWSER);

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    // Navigate with networkidle2 (allows 2 ongoing connections - more practical than networkidle0)
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: TIMEOUT
    });

    // Brief pause for any final rendering
    await new Promise(resolve => setTimeout(resolve, 500));

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
          navLabels: [],
          metaDescription: null,
          pageTitle: null,
          allHeadings: [],
          featureDescriptions: [],
          testimonials: [],
          footerLinks: [],
          socialProof: [],
          pricingHints: [],
          ctaTexts: []
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

      // Extract vibe slice - comprehensive content extraction

      // Page title and meta description
      result.vibeSlice.pageTitle = document.title || null;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        result.vibeSlice.metaDescription = metaDesc.getAttribute('content')?.slice(0, 500) || null;
      }

      // Hero content
      const h1 = document.querySelector('h1');
      if (h1) {
        result.vibeSlice.heroH1 = (h1.textContent || '').trim().slice(0, 200);

        // Try to find subheading near H1
        const nextP = h1.nextElementSibling;
        if (nextP && (nextP.tagName === 'P' || nextP.tagName === 'H2')) {
          result.vibeSlice.heroSubheading = (nextP.textContent || '').trim().slice(0, 300);
        }
      }

      // All headings for context
      const allHeadings: string[] = [];
      document.querySelectorAll('h1, h2, h3').forEach(el => {
        const text = (el.textContent || '').trim();
        if (text && text.length > 3 && text.length < 150 && allHeadings.length < 15) {
          allHeadings.push(text);
        }
      });
      result.vibeSlice.allHeadings = allHeadings;

      // Feature descriptions - paragraphs in sections
      const featureDescriptions: string[] = [];
      document.querySelectorAll('section p, [class*="feature"] p, [class*="benefit"] p, main p').forEach(el => {
        const text = (el.textContent || '').trim();
        if (text.length > 40 && text.length < 400 && featureDescriptions.length < 10) {
          featureDescriptions.push(text);
        }
      });
      result.vibeSlice.featureDescriptions = featureDescriptions;

      // Testimonials
      const testimonials: string[] = [];
      document.querySelectorAll('[class*="testimonial"], [class*="review"], [class*="quote"], blockquote').forEach(el => {
        const text = (el.textContent || '').trim();
        if (text.length > 20 && text.length < 500 && testimonials.length < 5) {
          testimonials.push(text);
        }
      });
      result.vibeSlice.testimonials = testimonials;

      // Social proof - customer logos, stats, badges
      const socialProof: string[] = [];
      document.querySelectorAll('[class*="logo"] img, [class*="client"] img, [class*="partner"] img').forEach(el => {
        const alt = (el as HTMLImageElement).alt;
        if (alt && alt.length > 2 && socialProof.length < 10) {
          socialProof.push(alt);
        }
      });
      // Stats and numbers
      document.querySelectorAll('[class*="stat"], [class*="metric"], [class*="number"]').forEach(el => {
        const text = (el.textContent || '').trim();
        if (text.length > 2 && text.length < 100 && socialProof.length < 15) {
          socialProof.push(text);
        }
      });
      result.vibeSlice.socialProof = socialProof;

      // Pricing hints
      const pricingHints: string[] = [];
      document.querySelectorAll('[class*="price"], [class*="plan"], [class*="tier"]').forEach(el => {
        const text = (el.textContent || '').trim();
        if (text.length > 3 && text.length < 200 && pricingHints.length < 8) {
          pricingHints.push(text);
        }
      });
      result.vibeSlice.pricingHints = pricingHints;

      // All CTA texts
      const ctaTexts: string[] = [];
      result.ctaCandidates.forEach(cta => {
        if (cta.text && cta.text.length > 1 && cta.text.length < 50 && ctaTexts.length < 10) {
          if (!ctaTexts.includes(cta.text)) {
            ctaTexts.push(cta.text);
          }
        }
      });
      result.vibeSlice.ctaTexts = ctaTexts;

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

      // Footer links for additional context
      const footerLinks: string[] = [];
      document.querySelectorAll('footer a').forEach(el => {
        const text = (el.textContent || '').trim();
        if (text && text.length > 1 && text.length < 40 && footerLinks.length < 15) {
          footerLinks.push(text);
        }
      });
      result.vibeSlice.footerLinks = footerLinks;

      return result;
    }, VIEWPORT.height);

    return data;
  } finally {
    await browser.close();
  }
}
