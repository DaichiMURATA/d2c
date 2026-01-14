/**
 * @file quote.stories.js
 * @description Storybook stories for the Quote block
 */

import '../../styles/styles.css';
import './quote.css';
import decorate from './quote.js';

export default {
  title: 'Blocks/Quote',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      viewports: [375, 1200],
    },
  },
};

const createQuoteBlock = ({ hasAuthor = false }) => {
  const block = document.createElement('div');
  block.className = 'quote';

  const blockquote = document.createElement('blockquote');
  const quoteText = document.createElement('p');
  quoteText.textContent = 'This is an inspiring quote that conveys important information or wisdom.';
  blockquote.appendChild(quoteText);

  if (hasAuthor) {
    const author = document.createElement('p');
    const cite = document.createElement('cite');
    cite.textContent = '— Author Name';
    author.appendChild(cite);
    blockquote.appendChild(author);
  }

  block.appendChild(blockquote);

  return block;
};

const Template = (args) => {
  const main = document.createElement('main');
  const section = document.createElement('div');
  section.className = 'section';

  const wrapper = document.createElement('div');
  const block = createQuoteBlock(args);
  wrapper.appendChild(block);
  section.appendChild(wrapper);
  main.appendChild(section);

  decorate(block);

  return main;
};

// Figma Variant 1: Quote without author
export const Default = {
  render: () => Template({ hasAuthor: false }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

// Figma Variant 2: Quote with author
export const WithAuthor = {
  render: () => Template({ hasAuthor: true }),
  parameters: {
    chromatic: { delay: 300 },
  },
};
