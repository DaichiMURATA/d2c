/**
 * @file search.stories.js
 * @description Storybook stories for the Search block
 */

import '../../styles/styles.css';
import './search.css';
import decorate from './search.js';

export default {
  title: 'Blocks/Search',
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
  block.className = 'search';

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
