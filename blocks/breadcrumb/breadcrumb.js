/**
 * @file breadcrumb.js
 * @description Breadcrumb block - Navigation breadcrumb trail
 * @version 1.0.0
 */

export default function decorate(block) {
  const rows = [...block.children];

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');

  const ol = document.createElement('ol');
  ol.className = 'breadcrumb-list';

  rows.forEach((row, index) => {
    const cells = [...row.children];
    if (cells.length > 0) {
      const li = document.createElement('li');
      li.className = 'breadcrumb-item';

      const content = cells[0];
      const link = content.querySelector('a');

      if (link) {
        li.innerHTML = content.innerHTML;
        if (index === rows.length - 1) {
          link.setAttribute('aria-current', 'page');
          li.classList.add('active');
        }
      } else {
        const span = document.createElement('span');
        span.textContent = content.textContent;
        li.appendChild(span);
        li.classList.add('active');
      }

      ol.appendChild(li);
    }
  });

  nav.appendChild(ol);
  block.innerHTML = '';
  block.appendChild(nav);
}
