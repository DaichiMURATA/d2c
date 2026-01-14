/**
 * @file quote.js
 * @description Quote block - Blockquote with optional attribution
 * @version 1.0.0
 */

export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    const cells = [...row.children];

    const blockquote = document.createElement('blockquote');
    blockquote.className = 'quote-text';

    if (cells.length > 0) {
      const quoteText = document.createElement('p');
      quoteText.innerHTML = cells[0].innerHTML;
      blockquote.appendChild(quoteText);
    }

    if (cells.length > 1) {
      const attribution = document.createElement('cite');
      attribution.className = 'quote-attribution';
      attribution.textContent = cells[1].textContent;
      blockquote.appendChild(attribution);
    }

    row.replaceWith(blockquote);
  });
}
