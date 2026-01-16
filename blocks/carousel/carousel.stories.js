/**
 * @file carousel.stories.js
 * @description Storybook stories for the Carousel block
 * 
 * Figma: https://www.figma.com/design/MJTwyRbE5EVdlci3UIwsut/SandBox-0108-AEM-Figma-Design-Framework?node-id=9392-122
 */

import '../../styles/styles.css';
import './carousel.css';
import decorate from './carousel.js';
import sampleImage from './assets/image.png';

export default {
  title: 'Blocks/Carousel',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Carousel Block

画像スライダーブロック。自動再生、ナビゲーションボタン、スライドインジケーター付き。

**Features:**
- ✅ 自動スライド（5秒間隔）
- ✅ ナビゲーションボタン
- ✅ スライドインジケーター
- ✅ Play/Pauseボタン
- ✅ キーボードナビゲーション
- ✅ PC/SP画像切替
- ✅ 画像リンク対応
        `,
      },
    },
    layout: 'fullscreen',
    chromatic: {
      viewports: [375, 1200],
      delay: 500,
    },
  },
};

// Sample images (using Figma-downloaded assets)
const sampleImages = {
  slide1: {
    pcImage: sampleImage,
    spImage: sampleImage,
    alt: 'Carousel Slide',
  },
  slide2: {
    pcImage: 'https://via.placeholder.com/1200x400/1d3ecf/ffffff?text=Slide+2+PC',
    spImage: 'https://via.placeholder.com/600x400/1d3ecf/ffffff?text=Slide+2+SP',
    alt: 'Slide 2',
  },
  slide3: {
    pcImage: 'https://via.placeholder.com/1200x400/505050/ffffff?text=Slide+3+PC',
    spImage: 'https://via.placeholder.com/600x400/505050/ffffff?text=Slide+3+SP',
    alt: 'Slide 3',
  },
};

/**
 * Helper: Create carousel HTML structure
 */
const createCarouselBlock = (slides) => {
  const block = document.createElement('div');
  block.className = 'carousel block';
  block.setAttribute('data-block-name', 'carousel');
  block.setAttribute('data-block-status', 'initialized');

  slides.forEach(slide => {
    const row = document.createElement('div');
    
    // PC image column
    const pcCol = document.createElement('div');
    const pcPicture = document.createElement('picture');
    pcPicture.setAttribute('data-viewport', 'desktop');
    const pcImg = document.createElement('img');
    pcImg.src = slide.pcImage;
    pcImg.alt = slide.alt || '';
    pcPicture.appendChild(pcImg);
    pcCol.appendChild(pcPicture);
    
    // Add link if provided
    if (slide.link) {
      const link = document.createElement('a');
      link.href = slide.link;
      link.title = slide.linkTitle || '';
      pcCol.appendChild(link);
    }
    
    // SP image column
    const spCol = document.createElement('div');
    const spPicture = document.createElement('picture');
    spPicture.setAttribute('data-viewport', 'mobile');
    const spImg = document.createElement('img');
    spImg.src = slide.spImage;
    spImg.alt = slide.alt || '';
    spPicture.appendChild(spImg);
    spCol.appendChild(spPicture);
    
    // Add link if provided
    if (slide.link) {
      const link = document.createElement('a');
      link.href = slide.link;
      link.title = slide.linkTitle || '';
      spCol.appendChild(link);
    }
    
    row.appendChild(pcCol);
    row.appendChild(spCol);
    block.appendChild(row);
  });

  // Apply decorate function
  decorate(block);
  
  return block;
};

/**
 * Variant 1: Single slide with centered full-size content
 * Figma: isSingle=true, isMultiple=false, isContent=true, contentPosition=center, contentSize=full
 * Node ID: 9402:206
 */
export const SingleSlideCenteredFullContent = {
  render: () => {
    const slides = [sampleImages.slide1];
    return createCarouselBlock(slides);
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/MJTwyRbE5EVdlci3UIwsut?node-id=9402:206',
    },
  },
};

/**
 * Variant 2: Multiple slides without content
 * Figma: isSingle=false, isMultiple=true, isContent=false, contentPosition=none, contentSize=none
 * Node ID: 9392:121
 */
export const MultipleSlidesNoContent = {
  render: () => {
    const slides = [
      sampleImages.slide1,
      sampleImages.slide2,
      sampleImages.slide3,
    ];
    return createCarouselBlock(slides);
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/MJTwyRbE5EVdlci3UIwsut?node-id=9392:121',
    },
  },
};

/**
 * Variant 3: Multiple slides with centered small content
 * Figma: isSingle=false, isMultiple=true, isContent=true, contentPosition=center, contentSize=small
 * Node ID: 9392:204
 */
export const MultipleSlidesContentCenterSmall = {
  render: () => {
    const slides = [
      sampleImages.slide1,
      sampleImages.slide2,
      sampleImages.slide3,
    ];
    return createCarouselBlock(slides);
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/MJTwyRbE5EVdlci3UIwsut?node-id=9392:204',
    },
  },
};

/**
 * Variant 4: Multiple slides with right-aligned small content
 * Figma: isSingle=false, isMultiple=true, isContent=true, contentPosition=right, contentSize=small
 * Node ID: 9392:238
 */
export const MultipleSlidesContentRightSmall = {
  render: () => {
    const slides = [
      sampleImages.slide1,
      sampleImages.slide2,
      sampleImages.slide3,
    ];
    return createCarouselBlock(slides);
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/MJTwyRbE5EVdlci3UIwsut?node-id=9392:238',
    },
  },
};

/**
 * Variant 5: Multiple slides with left-aligned small content
 * Figma: isSingle=false, isMultiple=true, isContent=true, contentPosition=left, contentSize=small
 * Node ID: 9392:271
 */
export const MultipleSlidesContentLeftSmall = {
  render: () => {
    const slides = [
      sampleImages.slide1,
      sampleImages.slide2,
      sampleImages.slide3,
    ];
    return createCarouselBlock(slides);
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/MJTwyRbE5EVdlci3UIwsut?node-id=9392:271',
    },
  },
};

/**
 * Variant 6: Multiple slides with centered full-size content
 * Figma: isSingle=false, isMultiple=true, isContent=true, contentPosition=center, contentSize=full
 * Node ID: 9392:123
 */
export const MultipleSlidesContentCenterFull = {
  render: () => {
    const slides = [
      sampleImages.slide1,
      sampleImages.slide2,
      sampleImages.slide3,
    ];
    return createCarouselBlock(slides);
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/MJTwyRbE5EVdlci3UIwsut?node-id=9392:123',
    },
  },
};
