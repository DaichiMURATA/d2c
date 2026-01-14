/**
 * @file cards.stories.js
 * @description Storybook stories for the Cards block
 */

import '../../styles/styles.css';
import './cards.css';
import decorate from './cards.js';
import cardImageUrl from './card-image.png';

export default {
  title: 'Blocks/Cards',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Cards Block

Grid of card items, each with image, title, description, and optional CTA.

**Features:**
- ✅ Responsive grid layout
- ✅ Hover effects
- ✅ Auto-fill grid columns
- ✅ Mobile-first design
        `,
      },
    },
    layout: 'fullscreen',
    chromatic: {
      viewports: [375, 1200],
    },
  },
};

const createCardsBlock = ({
  cardCount = 3, hasImage = true, hasLink = false, isHover = false,
}) => {
  const block = document.createElement('div');
  block.className = 'cards';
  if (isHover) block.classList.add('hover-state');

  for (let i = 0; i < cardCount; i++) {
    const card = document.createElement('div');

    // Image (conditional)
    if (hasImage) {
      const picture = document.createElement('picture');
      const img = document.createElement('img');
      img.src = cardImageUrl;
      img.alt = `Card ${i + 1}`;
      img.loading = 'eager';
      picture.appendChild(img);
      const imgWrapper = document.createElement('div');
      imgWrapper.appendChild(picture);
      card.appendChild(imgWrapper);
    }

    const title = document.createElement('h3');
    title.textContent = `Card Title ${i + 1}`;
    card.appendChild(title);

    const body = document.createElement('p');
    body.textContent = 'This is a description of the card content. It provides context and information.';
    card.appendChild(body);

    // CTA Link (conditional)
    if (hasLink) {
      const ctaPara = document.createElement('p');
      const cta = document.createElement('a');
      cta.href = '#';
      cta.textContent = 'Learn More';
      if (isHover) cta.classList.add('hover');
      ctaPara.appendChild(cta);
      card.appendChild(ctaPara);
    }

    block.appendChild(card);
  }

  return block;
};

const Template = (args) => {
  const main = document.createElement('main');
  const section = document.createElement('div');
  section.className = 'section';

  const wrapper = document.createElement('div');
  const block = createCardsBlock(args);
  wrapper.appendChild(block);
  section.appendChild(wrapper);
  main.appendChild(section);

  decorate(block);

  return main;
};

// Figma Variant 1: isImage=true, isLink=false, hover=false
export const WithImageNoLink = {
  render: () => Template({
    cardCount: 3, hasImage: true, hasLink: false, isHover: false,
  }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

// Figma Variant 2: isImage=true, isLink=true, hover=true
export const WithImageAndLinkHover = {
  render: () => Template({
    cardCount: 3, hasImage: true, hasLink: true, isHover: true,
  }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

// Figma Variant 3: isImage=false, isLink=false, hover=false
export const NoImageNoLink = {
  render: () => Template({
    cardCount: 3, hasImage: false, hasLink: false, isHover: false,
  }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

// Figma Variant 4: isImage=true, isLink=true, hover=false
export const WithImageAndLink = {
  render: () => Template({
    cardCount: 3, hasImage: true, hasLink: true, isHover: false,
  }),
  parameters: {
    chromatic: { delay: 300 },
  },
};
