/**
 * @file accordion.stories.js
 * @description Storybook stories for the Accordion block
 * Based on Figma Variants - 3 Stories matching 3 Figma Variants
 * Version 2.0.0 - Figma-aligned
 */

import '../../styles/styles.css';
import './accordion.css';
import decorate from './accordion.js';

export default {
  title: 'Blocks/Accordion',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Accordion Block

An interactive accordion component matching Figma design specifications.

**Figma Variants (3):**
1. default, isOpen=false - All items closed, white background
2. hover, isOpen=false - Hover state on closed item, gray background
3. hover, isOpen=true - Hover state on open item, gray background

**Features:**
- ✅ Click to expand/collapse
- ✅ Keyboard navigation
- ✅ WCAG AA accessibility
- ✅ Smooth animations
- ✅ Responsive design
        `,
      },
    },
    layout: 'fullscreen',
    chromatic: {
      // Capture multiple viewport sizes for responsive design
      viewports: [375, 1200],
    },
  },
};

/**
 * Creates EDS-style accordion block DOM structure
 */
const createAccordionBlock = () => {
  const block = document.createElement('div');
  block.className = 'accordion';

  // Figma sample content (from screenshot)
  const items = [
    {
      title: 'Urna duis convallis convallis tellus id interdum. Faucibus ornare suspendisse sed nisi lacus.',
      content: 'Urna duis convallis convallis tellus id interdum. Faucibus ornare suspendisse sed nisi lacus. Urna duis convallis convallis tellus id interdum. Faucibus ornare suspendisse sed nisi lacus.',
    },
    {
      title: 'Urna duis convallis convallis tellus id interdum. Faucibus ornare suspendisse sed nisi lacus.',
      content: 'Urna duis convallis convallis tellus id interdum. Faucibus ornare suspendisse sed nisi lacus. Urna duis convallis convallis tellus id interdum. Faucibus ornare suspendisse sed nisi lacus.',
    },
    {
      title: 'Urna duis convallis convallis tellus id interdum. Faucibus ornare suspendisse sed nisi lacus.',
      content: 'Urna duis convallis convallis tellus id interdum. Faucibus ornare suspendisse sed nisi lacus. Urna duis convallis convallis tellus id interdum. Faucibus ornare suspendisse sed nisi lacus.',
    },
  ];

  items.forEach((item) => {
    // Create row (EDS structure)
    const row = document.createElement('div');

    // First cell: Heading
    const headingCell = document.createElement('div');
    const heading = document.createElement('h3');
    heading.textContent = item.title;
    headingCell.appendChild(heading);
    row.appendChild(headingCell);

    // Second cell: Content
    const contentCell = document.createElement('div');
    const p = document.createElement('p');
    p.textContent = item.content;
    contentCell.appendChild(p);
    row.appendChild(contentCell);

    block.appendChild(row);
  });

  return block;
};

/**
 * Template function - mirrors actual page structure
 */
const Template = (storyConfig = {}) => {
  const main = document.createElement('main');
  const section = document.createElement('div');
  section.className = 'section';

  const wrapper = document.createElement('div');
  const block = createAccordionBlock();
  wrapper.appendChild(block);
  section.appendChild(wrapper);
  main.appendChild(section);

  // Apply block decoration
  decorate(block);

  // Apply story-specific interactions
  if (storyConfig.afterDecorate) {
    setTimeout(() => {
      storyConfig.afterDecorate(block);
    }, 100);
  }

  return main;
};

// ============================================
// STORY 1: Figma Variant "default, isOpen=false"
// ============================================
/**
 * All accordion items closed - default white background
 * Matches Figma: default, isOpen=false
 */
export const Default = {
  render: () => Template(),
  parameters: {
    docs: {
      story: {
        description: 'Default state - all items closed with white background. Matches Figma variant: default, isOpen=false',
      },
    },
    chromatic: {
      delay: 300, // Allow styles to settle
    },
  },
};

// ============================================
// STORY 2: Figma Variant "hover, isOpen=false"
// ============================================
/**
 * Hover state on middle accordion item (closed)
 * Matches Figma: hover, isOpen=false
 */
export const HoverClosed = {
  render: () => Template({
    afterDecorate: (block) => {
      // Apply hover state to middle item
      const buttons = block.querySelectorAll('.accordion-button');
      if (buttons[1]) {
        buttons[1].classList.add('hover-simulation');
        buttons[1].style.backgroundColor = 'var(--color-neutral-50, #f5f5f5)';
      }
    },
  }),
  parameters: {
    docs: {
      story: {
        description: 'Hover state on closed item - gray background. Matches Figma variant: hover, isOpen=false',
      },
    },
    chromatic: {
      delay: 300,
    },
  },
};

// ============================================
// STORY 3: Figma Variant "hover, isOpen=true"
// ============================================
/**
 * Last accordion item opened with hover state
 * Matches Figma: hover, isOpen=true
 */
export const HoverExpanded = {
  render: () => Template({
    afterDecorate: (block) => {
      // Open the last item
      const buttons = block.querySelectorAll('.accordion-button');
      if (buttons[2]) {
        buttons[2].click(); // Open the item

        // Apply hover state after opening
        setTimeout(() => {
          buttons[2].classList.add('hover-simulation');
          buttons[2].style.backgroundColor = 'var(--color-neutral-50, #f5f5f5)';
        }, 100);
      }
    },
  }),
  parameters: {
    docs: {
      story: {
        description: 'Hover state on expanded item - gray background with content visible. Matches Figma variant: hover, isOpen=true',
      },
    },
    chromatic: {
      delay: 500, // Extra delay for animation to complete
    },
  },
};
