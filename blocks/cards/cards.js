/**
 * @file cards.js
 * @description Cards block - Grid of card items
 * @version 2.0.0
 *
 * Combines Boilerplate functionality with Figma design system
 * Based on Adobe EDS Block Collection Cards pattern
 * @see https://github.com/adobe/aem-block-collection/tree/main/blocks/cards
 */

import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Decorates the cards block
 * @param {Element} block The cards block element
 */
export default function decorate(block) {
  // Convert to ul/li structure (Boilerplate pattern)
  const ul = document.createElement('ul');
  const rows = [...block.children];

  rows.forEach((row) => {
    const li = document.createElement('li');
    li.className = 'card';

    // Move all cells from row to li
    while (row.firstElementChild) {
      li.append(row.firstElementChild);
    }

    // Process each cell
    [...li.children].forEach((div) => {
      // Image cell detection (Boilerplate logic)
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';

        // Apply semantic classes to content
        const heading = div.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading) {
          heading.classList.add('cards-card-title');
        }

        const paragraphs = div.querySelectorAll('p');
        paragraphs.forEach((p) => {
          if (p.querySelector('a')) {
            p.classList.add('cards-card-cta');
          }
        });
      }
    });

    ul.append(li);
  });

  // Optimize images (Boilerplate feature)
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    );
  });

  block.replaceChildren(ul);

  // Public API
  block._eds = {
    getCards: () => block.querySelectorAll('.card'),
  };
}
