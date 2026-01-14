/**
 * @file embed.js
 * @description Embed block - Embedded content (iframes, etc.)
 * @version 1.0.0
 */

export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length > 0) {
      const url = cells[0].textContent.trim();

      // Create responsive embed wrapper
      const embedWrapper = document.createElement('div');
      embedWrapper.className = 'embed-wrapper';

      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('loading', 'lazy');
      iframe.setAttribute('title', 'Embedded content');

      embedWrapper.appendChild(iframe);
      row.replaceWith(embedWrapper);
    }
  });
}
