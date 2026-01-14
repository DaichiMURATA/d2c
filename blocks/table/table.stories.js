/**
 * @file table.stories.js
 * @description Storybook stories for the Table block
 */

import '../../styles/styles.css';
import './table.css';
import decorate from './table.js';

export default {
  title: 'Blocks/Table',
  parameters: {
    layout: 'fullscreen',
    chromatic: { viewports: [375, 1200] },
  },
};

const Template = () => {
  const main = document.createElement('main');
  const section = document.createElement('div');
  section.className = 'section';

  const wrapper = document.createElement('div');
  const block = document.createElement('div');
  block.className = 'table';

  // Header row
  const headerRow = document.createElement('div');
  ['Name', 'Role', 'Email'].forEach((header) => {
    const cell = document.createElement('div');
    cell.textContent = header;
    headerRow.appendChild(cell);
  });
  block.appendChild(headerRow);

  // Data rows
  const data = [
    ['Alice', 'Developer', 'alice@example.com'],
    ['Bob', 'Designer', 'bob@example.com'],
    ['Charlie', 'Manager', 'charlie@example.com'],
  ];

  data.forEach((rowData) => {
    const row = document.createElement('div');
    rowData.forEach((value) => {
      const cell = document.createElement('div');
      cell.textContent = value;
      row.appendChild(cell);
    });
    block.appendChild(row);
  });

  wrapper.appendChild(block);
  section.appendChild(wrapper);
  main.appendChild(section);

  decorate(block);

  return main;
};

export const Default = {
  render: Template,
  parameters: { chromatic: { delay: 300 } },
};

// Figma Variant 2: Striped
export const Striped = {
  render: () => Template({ variant: 'striped' }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

// Figma Variant 3: Bordered
export const Bordered = {
  render: () => Template({ variant: 'bordered' }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

// Figma Variant 4: Striped and Bordered
export const StripedBordered = {
  render: () => Template({ variant: 'striped-bordered' }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

// Figma Variant 5: No Header
export const NoHeader = {
  render: () => Template({ variant: 'no-header' }),
  parameters: {
    chromatic: { delay: 300 },
  },
};
