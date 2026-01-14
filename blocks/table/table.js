/**
 * @file table.js
 * @description Table block - Styled data table
 * @version 1.0.0
 */

export default function decorate(block) {
  const rows = [...block.children];
  const table = document.createElement('table');

  // First row as header
  if (rows.length > 0) {
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const firstRow = rows[0];
    const headerCells = [...firstRow.children];

    headerCells.forEach((cell) => {
      const th = document.createElement('th');
      th.innerHTML = cell.innerHTML;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);
  }

  // Rest as body
  if (rows.length > 1) {
    const tbody = document.createElement('tbody');

    for (let i = 1; i < rows.length; i++) {
      const tr = document.createElement('tr');
      const cells = [...rows[i].children];

      cells.forEach((cell) => {
        const td = document.createElement('td');
        td.innerHTML = cell.innerHTML;
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
  }

  block.innerHTML = '';
  block.appendChild(table);
}
