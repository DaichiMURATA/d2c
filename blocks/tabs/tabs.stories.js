/**
 * @file tabs.stories.js
 * @description Storybook stories for the Tabs block
 */

import '../../styles/styles.css';
import './tabs.css';
import decorate from './tabs.js';

export default {
  title: 'Blocks/Tabs',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      viewports: [375, 1200],
    },
  },
};

const createTabsBlock = ({ activeTab = 0 }) => {
  const block = document.createElement('div');
  block.className = 'tabs';
  block.setAttribute('data-active-tab', activeTab);

  // Tab list
  const tabList = document.createElement('div');
  tabList.setAttribute('role', 'tablist');

  ['Tab 1', 'Tab 2', 'Tab 3'].forEach((title, index) => {
    const tab = document.createElement('button');
    tab.setAttribute('role', 'tab');
    tab.textContent = title;
    if (index === activeTab) {
      tab.setAttribute('aria-selected', 'true');
    }
    tabList.appendChild(tab);
  });
  block.appendChild(tabList);

  // Tab panels
  ['Content 1', 'Content 2', 'Content 3'].forEach((content, index) => {
    const panel = document.createElement('div');
    panel.setAttribute('role', 'tabpanel');
    if (index !== activeTab) {
      panel.setAttribute('hidden', '');
    }
    const p = document.createElement('p');
    p.textContent = content;
    panel.appendChild(p);
    block.appendChild(panel);
  });

  return block;
};

const Template = (args) => {
  const main = document.createElement('main');
  const section = document.createElement('div');
  section.className = 'section';

  const wrapper = document.createElement('div');
  const block = createTabsBlock(args);
  wrapper.appendChild(block);
  section.appendChild(wrapper);
  main.appendChild(section);

  decorate(block);

  return main;
};

// Figma Variant 1: First tab active
export const FirstTabActive = {
  render: () => Template({ activeTab: 0 }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

// Figma Variant 2: Second tab active
export const SecondTabActive = {
  render: () => Template({ activeTab: 1 }),
  parameters: {
    chromatic: { delay: 300 },
  },
};
