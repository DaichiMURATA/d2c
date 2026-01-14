/**
 * @file hero.js
 * @description Hero block - Large featured content section
 * @version 1.0.0
 *
 * Based on Adobe EDS Block Collection Hero pattern
 * @see https://github.com/adobe/aem-block-collection/tree/main/blocks/hero
 */

/**
 * Decorates the hero block
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  // Get all rows (typically 1 row with content)
  const rows = [...block.children];

  rows.forEach((row) => {
    const cells = [...row.children];

    // Typically Hero has 1-2 cells:
    // Cell 1: Text content (heading, text, CTA)
    // Cell 2 (optional): Image

    if (cells.length >= 1) {
      const textCell = cells[0];
      textCell.classList.add('hero-text');

      // Find heading
      const heading = textCell.querySelector('h1, h2, h3');
      if (heading) {
        heading.classList.add('hero-heading');
      }

      // Find paragraphs
      const paragraphs = textCell.querySelectorAll('p');
      paragraphs.forEach((p) => {
        // Check if paragraph contains a link styled as button
        const link = p.querySelector('a');
        if (link) {
          const up = link.parentElement;
          const twoup = link.parentElement.parentElement;

          // Promote link to button wrapper level
          if (up.childNodes.length === 1 && (up.tagName === 'P' || up.tagName === 'DIV')) {
            link.classList.add('button', 'primary');
            up.classList.add('hero-cta');
          } else if (twoup.childNodes.length === 1 && (twoup.tagName === 'P' || twoup.tagName === 'DIV')) {
            link.classList.add('button', 'primary');
            twoup.classList.add('hero-cta');
          } else {
            p.classList.add('hero-body');
          }
        } else {
          p.classList.add('hero-body');
        }
      });
    }

    if (cells.length >= 2) {
      const imageCell = cells[1];
      imageCell.classList.add('hero-image');

      // Find picture/img element
      const picture = imageCell.querySelector('picture');
      if (picture) {
        picture.classList.add('hero-picture');
      }
    }
  });

  // Public API for programmatic control
  block._eds = {
    /**
     * Get hero content
     * @returns {Object} Hero content elements
     */
    getContent: () => ({
      heading: block.querySelector('.hero-heading'),
      body: block.querySelector('.hero-body'),
      cta: block.querySelector('.hero-cta a'),
      image: block.querySelector('.hero-image picture'),
    }),
  };
}
