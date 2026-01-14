/**
 * @file breadcrumb.stories.js
 * @description Storybook stories for the Breadcrumb block
 */

import '../../styles/styles.css';
import './breadcrumb.css';
import decorate from './breadcrumb.js';

export default {
  title: 'Blocks/Breadcrumb',
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
  block.className = 'breadcrumb';

  const breadcrumbData = [
    { text: 'Home', href: '/' },
    { text: 'Products', href: '/products' },
    { text: 'Category', href: '/products/category' },
    { text: 'Current Page', href: null },
  ];

  breadcrumbData.forEach((item) => {
    const row = document.createElement('div');
    const cell = document.createElement('div');

    if (item.href) {
      const link = document.createElement('a');
      link.href = item.href;
      link.textContent = item.text;
      cell.appendChild(link);
    } else {
      cell.textContent = item.text;
    }

    row.appendChild(cell);
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
