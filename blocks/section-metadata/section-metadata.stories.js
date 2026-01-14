/**
 * @file section-metadata.stories.js
 * @description Storybook stories for the Section Metadata block
 */

import '../../styles/styles.css';
import './section-metadata.css';
import decorate from './section-metadata.js';

export default {
  title: 'Blocks/Section Metadata',
  parameters: {
    layout: 'fullscreen',
    chromatic: { viewports: [375, 1200] },
  },
};

const Template = () => {
  const main = document.createElement('main');
  const section = document.createElement('div');
  section.className = 'section';

  // Add some visible content
  const content = document.createElement('div');
  content.innerHTML = '<h2>Section with Metadata</h2><p>The background color is applied via Section Metadata block.</p>';
  section.appendChild(content);

  // Add metadata block
  const wrapper = document.createElement('div');
  const block = document.createElement('div');
  block.className = 'section-metadata';

  // Metadata rows
  const bgRow = document.createElement('div');
  const bgKey = document.createElement('div');
  bgKey.textContent = 'background';
  const bgValue = document.createElement('div');
  bgValue.textContent = '#f0f8ff';
  bgRow.appendChild(bgKey);
  bgRow.appendChild(bgValue);
  block.appendChild(bgRow);

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
