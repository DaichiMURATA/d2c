/**
 * @file hero.stories.js
 * @description Storybook stories for the Hero block
 * Based on Figma Variants (1 variant detected)
 */

import '../../styles/styles.css';
import './hero.css';
import decorate from './hero.js';

export default {
  title: 'Blocks/Hero',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Hero Block

Large featured content section, typically used at the top of pages.

**Features:**
- ✅ Heading text (editable)
- ✅ Background image (DNA螺旋)
- ✅ White text on dark background
- ✅ Responsive layout
- ✅ WCAG AA accessibility
        `,
      },
    },
    layout: 'fullscreen',
    chromatic: {
      viewports: [375, 1200],
    },
  },
};

/**
 * Creates EDS-style hero block DOM structure
 */
const createHeroBlock = ({ heading = 'Heading in Block' }) => {
  const block = document.createElement('div');
  block.className = 'hero';

  const row = document.createElement('div');

  // Text cell (only heading, matching Figma)
  const textCell = document.createElement('div');

  const h1 = document.createElement('h1');
  h1.textContent = heading;
  textCell.appendChild(h1);

  row.appendChild(textCell);
  block.appendChild(row);
  return block;
};

/**
 * Template function
 */
const Template = (args) => {
  const main = document.createElement('main');
  const section = document.createElement('div');
  section.className = 'section';

  const wrapper = document.createElement('div');
  const block = createHeroBlock(args);
  wrapper.appendChild(block);
  section.appendChild(wrapper);
  main.appendChild(section);

  decorate(block);

  return main;
};

// Figma Variant: Default Hero (type=default)
export const Default = {
  render: () => Template({ heading: 'Heading in Block' }),
  parameters: {
    docs: {
      story: {
        description: 'Default hero with heading text on DNA螺旋 background (matches Figma)',
      },
    },
    chromatic: { delay: 300 },
  },
};
