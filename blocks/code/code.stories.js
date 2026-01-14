/**
 * @file code.stories.js
 * @description Storybook stories for the Code block
 */

import '../../styles/styles.css';
import './code.css';
import decorate from './code.js';

export default {
  title: 'Blocks/Code',
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
  block.className = 'code';

  const row = document.createElement('div');
  const cell = document.createElement('div');
  cell.textContent = 'function hello() {\n  console.log("Hello, World!");\n}';
  row.appendChild(cell);
  block.appendChild(row);

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
