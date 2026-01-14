/**
 * @file carousel.stories.js
 * @description Storybook stories for the Carousel block
 * Minimal variant based on Figma structure
 */

import '../../styles/styles.css';
import './carousel.css';
import decorate from './carousel.js';
import carouselImageUrl from './carousel-image.png';

export default {
  title: 'Blocks/Carousel',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Carousel Block

Slideshow component for cycling through content items.

**Features:**
- ✅ Previous/Next navigation buttons
- ✅ Indicator dots for direct navigation
- ✅ Keyboard navigation (Arrow keys)
- ✅ WCAG AA accessibility
- ✅ Touch/swipe support (future enhancement)
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
 * Creates EDS-style carousel block DOM structure
 */
const createCarouselBlock = ({
  slideCount = 3, hasContent = true, contentPosition = 'center', contentSize = 'full',
}) => {
  const block = document.createElement('div');
  block.className = 'carousel';
  if (contentPosition !== 'center') block.setAttribute('data-content-position', contentPosition);
  if (contentSize !== 'full') block.setAttribute('data-content-size', contentSize);

  for (let i = 0; i < slideCount; i++) {
    const slide = document.createElement('div');

    const img = document.createElement('img');
    img.src = carouselImageUrl;
    img.alt = `Slide ${i + 1}`;
    img.loading = 'eager';
    slide.appendChild(img);

    if (hasContent) {
      const heading = document.createElement('h3');
      heading.textContent = `Slide ${i + 1} Title`;
      slide.appendChild(heading);

      const para = document.createElement('p');
      para.textContent = 'This is a description of the slide content.';
      slide.appendChild(para);
    }

    block.appendChild(slide);
  }

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
  const block = createCarouselBlock(args);
  wrapper.appendChild(block);
  section.appendChild(wrapper);
  main.appendChild(section);

  decorate(block);

  return main;
};

// Figma Variant 1: Single slide, full content, center
export const SingleSlideFullContent = {
  render: () => Template({
    slideCount: 1, hasContent: true, contentPosition: 'center', contentSize: 'full',
  }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

// Figma Variant 2: Multiple slides, no content
export const MultipleSlides = {
  render: () => Template({
    slideCount: 3, hasContent: false, contentPosition: 'none', contentSize: 'none',
  }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

// Figma Variant 3: Multiple slides, small content, center
export const MultipleSlidesSmallCenter = {
  render: () => Template({
    slideCount: 3, hasContent: true, contentPosition: 'center', contentSize: 'small',
  }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

// Figma Variant 4: Multiple slides, small content, right
export const MultipleSlidesSmallRight = {
  render: () => Template({
    slideCount: 3, hasContent: true, contentPosition: 'right', contentSize: 'small',
  }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

// Figma Variant 5: Multiple slides, small content, left
export const MultipleSlidesSmallLeft = {
  render: () => Template({
    slideCount: 3, hasContent: true, contentPosition: 'left', contentSize: 'small',
  }),
  parameters: {
    chromatic: { delay: 300 },
  },
};

// Figma Variant 6: Multiple slides, full content, center
export const MultipleSlidesFullCenter = {
  render: () => Template({
    slideCount: 3, hasContent: true, contentPosition: 'center', contentSize: 'full',
  }),
  parameters: {
    chromatic: { delay: 300 },
  },
};
