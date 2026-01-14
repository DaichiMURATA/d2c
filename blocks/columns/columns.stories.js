/**
 * @file columns.stories.js
 * @description Storybook stories for the Columns block
 */

import '../../styles/styles.css';
import './columns.css';
import decorate from './columns.js';

export default {
  title: 'Blocks/Columns',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Multi-column layout block',
      },
    },
    layout: 'fullscreen',
    chromatic: {
      viewports: [375, 1200],
    },
  },
};

const createColumnsBlock = ({ columnCount = 2 }) => {
  const block = document.createElement('div');
  block.className = 'columns';

  const row = document.createElement('div');

  for (let i = 0; i < columnCount; i++) {
    const cell = document.createElement('div');
    const heading = document.createElement('h3');
    heading.textContent = `Column ${i + 1}`;
    cell.appendChild(heading);

    const para = document.createElement('p');
    para.textContent = 'This is content for this column.';
    cell.appendChild(para);

    row.appendChild(cell);
  }

  block.appendChild(row);
  return block;
};

const Template = (args) => {
  const main = document.createElement('main');
  const section = document.createElement('div');
  section.className = 'section';

  const wrapper = document.createElement('div');
  const block = createColumnsBlock(args);
  wrapper.appendChild(block);
  section.appendChild(wrapper);
  main.appendChild(section);

  decorate(block);

  return main;
};

export const TwoColumns = {
  render: () => Template({ columnCount: 2 }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

export const ThreeColumns = {
  render: () => Template({ columnCount: 3 }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

// Figma Variant 3: One Column
export const OneColumn = {
  render: () => Template({ columnCount: 1 }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

// Figma Variant 4: Four Columns
export const FourColumns = {
  render: () => Template({ columnCount: 4 }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

// Figma Variant 5: Five Columns
export const FiveColumns = {
  render: () => Template({ columnCount: 5 }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

// Figma Variant 6: Six Columns
export const SixColumns = {
  render: () => Template({ columnCount: 6 }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

// Figma Variant 7: Seven Columns
export const SevenColumns = {
  render: () => Template({ columnCount: 7 }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

// Figma Variant 8: Eight Columns
export const EightColumns = {
  render: () => Template({ columnCount: 8 }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

// Figma Variant 9: Nine Columns
export const NineColumns = {
  render: () => Template({ columnCount: 9 }),
  parameters: {
    chromatic: { delay: 300 },
  },
};
