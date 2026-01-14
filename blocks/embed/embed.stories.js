/**
 * @file embed.stories.js
 * @description Storybook stories for the Embed block
 */

import '../../styles/styles.css';
import './embed.css';
import decorate from './embed.js';

export default {
  title: 'Blocks/Embed',
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
  block.className = 'embed';

  const row = document.createElement('div');
  const cell = document.createElement('div');
  cell.textContent = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
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
