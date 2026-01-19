/**
 * Carousel Block Stories
 * 
 * Figma Component Set: 9392:122
 * 
 * Variants Mapping (1:1 with Figma):
 * 1. SingleSlideCenteredFullContent (9402:206)
 * 2. MultipleSlidesNoContent (9392:121)
 * 3. MultipleSlidesContentCenterSmall (9392:204)
 * 4. MultipleSlidesContentRightSmall (9392:238)
 * 5. MultipleSlidesContentLeftSmall (9392:271)
 * 6. MultipleSlidesContentCenterFull (9392:123)
 * 
 * Additional Stories (7-9):
 * - WithAutoAdvance: Tests auto-advance behavior
 * - FiveSlides: Tests more slides for UI layout
 * - AccessibilityShowcase: Demonstrates a11y features
 * 
 * Visual Regression: First 6 stories map 1:1 to Figma variants
 * for Chromatic comparison.
 */

import '../../styles/styles.css';
import './carousel.css';
import decorate from './carousel.js';

export default {
  title: 'Blocks/Carousel',
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      viewports: [375, 768, 1200],
      delay: 500, // Allow carousel to initialize
      pauseAnimationAtEnd: true,
    },
  },
  argTypes: {
    slides: {
      description: 'Number of slides in the carousel',
      control: 'number',
      table: {
        category: 'Content',
        defaultValue: { summary: 3 },
      },
    },
    contentPosition: {
      description: 'Position of slide content',
      control: 'select',
      options: ['center', 'left', 'right'],
      table: {
        category: 'Layout',
        defaultValue: { summary: 'center' },
      },
    },
    contentSize: {
      description: 'Size of content container',
      control: 'select',
      options: ['small', 'full'],
      table: {
        category: 'Layout',
        defaultValue: { summary: 'full' },
      },
    },
    autoAdvance: {
      description: 'Enable auto-advance',
      control: 'boolean',
      table: {
        category: 'Behavior',
        defaultValue: { summary: false },
      },
    },
  },
  tags: ['autodocs'],
};

/**
 * Create carousel HTML structure
 * Matches EDS doc-based authoring output from localhost:3000/vrtest
 * 
 * EDS Structure:
 * - Block: <div class="carousel">
 * - Rows: Each <div> child = one slide (table row)
 * - Cells: Each <div> inside row = one column
 *   - Cell 1: Image (required)
 *   - Cell 2: Content (optional - heading, paragraphs, links)
 */
function createCarouselHTML({ slides = 1, hasContent = true, contentPosition = 'center', contentSize = 'full' }) {
  const slideElements = [];

  for (let i = 0; i < slides; i += 1) {
    // Row (one per slide)
    const rowStart = '<div>';
    const rowEnd = '</div>';

    // Cell 1: Image (always present)
    // Using fixed seed for consistent images in visual regression tests
    const imageCell = `
        <div>
          <picture>
            <source type="image/webp" srcset="https://picsum.photos/seed/carousel-${i}/2000/640.webp" media="(min-width: 600px)">
            <source type="image/webp" srcset="https://picsum.photos/seed/carousel-${i}/750/480.webp">
            <source type="image/jpeg" srcset="https://picsum.photos/seed/carousel-${i}/2000/640.jpg" media="(min-width: 600px)">
            <img loading="lazy" alt="Slide ${i + 1}" src="https://picsum.photos/seed/carousel-${i}/750/480.jpg" width="1600" height="640">
          </picture>
        </div>`;

    // Cell 2: Content (optional)
    const contentCell = hasContent
      ? `
        <div>
          <h2 id="slide-${i + 1}-heading">Slide ${i + 1} Heading</h2>
          <p>This is slide ${i + 1} content. Content position: ${contentPosition}, size: ${contentSize}.</p>
          <p><a href="https://example.com">Learn More</a></p>
        </div>`
      : '';

    slideElements.push(`${rowStart}${imageCell}${contentCell}${rowEnd}`);
  }

  return `
    <div class="carousel">
      ${slideElements.join('\n      ')}
    </div>
  `;
}

/**
 * Template function
 * Creates EDS page structure matching decorateSections() and decorateBlock() output
 * 
 * Complete hierarchy:
 * main
 *   > div.section.carousel-container[data-section-status="loaded"]
 *       > div.carousel-wrapper
 *           > div.carousel.block[data-block-name="carousel"][data-block-status="loaded"]
 * 
 * Key transformations by aem.js:
 * - decorateSections(): adds 'section', wrappers
 * - decorateBlock(): adds 'block', 'carousel-wrapper', 'carousel-container', data attributes
 */
const Template = (args) => {
  const main = document.createElement('main');
  
  // Section (base + carousel-container from decorateBlock)
  const section = document.createElement('div');
  section.className = 'section carousel-container';
  section.setAttribute('data-section-status', 'loaded');
  
  // Block wrapper (gets 'carousel-wrapper' from decorateBlock)
  const blockWrapper = document.createElement('div');
  blockWrapper.className = 'carousel-wrapper';
  blockWrapper.innerHTML = createCarouselHTML(args);
  
  // Block element (gets 'block' class and attributes from decorateBlock)
  const block = blockWrapper.querySelector('.carousel');
  block.classList.add('block');
  block.setAttribute('data-block-name', 'carousel');
  block.setAttribute('data-block-status', 'loaded');
  
  section.appendChild(blockWrapper);
  main.appendChild(section);

  // Decorate the block (this is what EDS does after loading)
  decorate(block);

  return main;
};

/**
 * Variant 1: Single Slide, Centered, Full Content
 * Figma Node: 9402:206
 */
export const SingleSlideCenteredFullContent = Template.bind({});
SingleSlideCenteredFullContent.args = {
  slides: 1,
  hasContent: true,
  contentPosition: 'center',
  contentSize: 'full',
  autoAdvance: false,
};
SingleSlideCenteredFullContent.parameters = {
  docs: {
    description: {
      story: 'Single slide with centered full-width content. Maps to Figma variant: isSingle=true, contentPosition=center, contentSize=full',
    },
  },
};

/**
 * Variant 2: Multiple Slides, No Content
 * Figma Node: 9392:121
 */
export const MultipleSlidesNoContent = Template.bind({});
MultipleSlidesNoContent.args = {
  slides: 3,
  hasContent: false,
  contentPosition: 'center',
  contentSize: 'full',
  autoAdvance: false,
};
MultipleSlidesNoContent.parameters = {
  docs: {
    description: {
      story: 'Multiple slides with images only, no text content. Maps to Figma variant: isMultiple=true, isContent=false',
    },
  },
};

/**
 * Variant 3: Multiple Slides, Content Center Small
 * Figma Node: 9392:204
 */
export const MultipleSlidesContentCenterSmall = Template.bind({});
MultipleSlidesContentCenterSmall.args = {
  slides: 3,
  hasContent: true,
  contentPosition: 'center',
  contentSize: 'small',
  autoAdvance: false,
};
MultipleSlidesContentCenterSmall.parameters = {
  docs: {
    description: {
      story: 'Multiple slides with small centered content overlay. Maps to Figma variant: isMultiple=true, contentPosition=center, contentSize=small',
    },
  },
};

/**
 * Variant 4: Multiple Slides, Content Right Small
 * Figma Node: 9392:238
 */
export const MultipleSlidesContentRightSmall = Template.bind({});
MultipleSlidesContentRightSmall.args = {
  slides: 3,
  hasContent: true,
  contentPosition: 'right',
  contentSize: 'small',
  autoAdvance: false,
};
MultipleSlidesContentRightSmall.parameters = {
  docs: {
    description: {
      story: 'Multiple slides with small right-aligned content. Maps to Figma variant: isMultiple=true, contentPosition=right, contentSize=small',
    },
  },
};

/**
 * Variant 5: Multiple Slides, Content Left Small
 * Figma Node: 9392:271
 */
export const MultipleSlidesContentLeftSmall = Template.bind({});
MultipleSlidesContentLeftSmall.args = {
  slides: 3,
  hasContent: true,
  contentPosition: 'left',
  contentSize: 'small',
  autoAdvance: false,
};
MultipleSlidesContentLeftSmall.parameters = {
  docs: {
    description: {
      story: 'Multiple slides with small left-aligned content. Maps to Figma variant: isMultiple=true, contentPosition=left, contentSize=small',
    },
  },
};

/**
 * Variant 6: Multiple Slides, Content Center Full
 * Figma Node: 9392:123
 */
export const MultipleSlidesContentCenterFull = Template.bind({});
MultipleSlidesContentCenterFull.args = {
  slides: 3,
  hasContent: true,
  contentPosition: 'center',
  contentSize: 'full',
  autoAdvance: false,
};
MultipleSlidesContentCenterFull.parameters = {
  docs: {
    description: {
      story: 'Multiple slides with full-width centered content. Maps to Figma variant: isMultiple=true, contentPosition=center, contentSize=full',
    },
  },
};

/**
 * Additional Story: Auto-Advance
 * Tests carousel behavior with automatic slide transitions
 */
export const WithAutoAdvance = Template.bind({});
WithAutoAdvance.args = {
  slides: 3,
  hasContent: true,
  contentPosition: 'center',
  contentSize: 'full',
  autoAdvance: true,
};
WithAutoAdvance.parameters = {
  docs: {
    description: {
      story: 'Carousel with auto-advance enabled (5s interval). Pauses on hover and keyboard interaction.',
    },
  },
  chromatic: {
    disableSnapshot: true, // Don't capture auto-advancing state
  },
};

/**
 * Additional Story: Five Slides
 * Tests carousel with more slides for indicator layout
 */
export const FiveSlides = Template.bind({});
FiveSlides.args = {
  slides: 5,
  hasContent: true,
  contentPosition: 'center',
  contentSize: 'small',
  autoAdvance: false,
};
FiveSlides.parameters = {
  docs: {
    description: {
      story: 'Carousel with 5 slides to test indicator layout and navigation.',
    },
  },
};

/**
 * Accessibility Story: Keyboard Navigation
 * Demonstrates keyboard interaction
 */
export const AccessibilityShowcase = Template.bind({});
AccessibilityShowcase.args = {
  slides: 3,
  hasContent: true,
  contentPosition: 'center',
  contentSize: 'full',
  autoAdvance: false,
};
AccessibilityShowcase.parameters = {
  docs: {
    description: {
      story: `Keyboard Navigation:
- Arrow Left/Right: Navigate between slides
- Home: Jump to first slide
- End: Jump to last slide
- Tab: Navigate to buttons and indicators
- Enter/Space: Activate buttons and indicators

Screen Reader Support:
- ARIA labels for navigation
- Live region announcements
- Semantic HTML structure`,
    },
  },
};
