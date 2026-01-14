/**
 * @file code.js
 * @description Code block - Syntax highlighted code display
 * @version 1.0.0
 */

export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length > 0) {
      const codeCell = cells[0];
      const pre = document.createElement('pre');
      const code = document.createElement('code');

      // Get language if specified in second cell
      let language = 'plaintext';
      if (cells.length > 1) {
        language = cells[1].textContent.trim().toLowerCase();
      }

      code.className = `language-${language}`;
      code.textContent = codeCell.textContent;
      pre.appendChild(code);

      row.replaceWith(pre);
    }
  });
}
