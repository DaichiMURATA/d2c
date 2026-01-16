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
 * Story: Default (3 slides)
 */
export const Default = {
  render: () => {
    const slides = [
      sampleImages.slide1,
      sampleImages.slide2,
      sampleImages.slide3,
    ];
    return createCarouselBlock(slides);
  },
};

/**
 * Story: Single Slide
 */
export const SingleSlide = {
  render: () => {
    const slides = [sampleImages.slide1];
    return createCarouselBlock(slides);
  },
};

/**
 * Story: Two Slides
 */
export const TwoSlides = {
  render: () => {
    const slides = [
      sampleImages.slide1,
      sampleImages.slide2,
    ];
    return createCarouselBlock(slides);
  },
};

/**
 * Story: With Image Links
 */
export const WithImageLinks = {
  render: () => {
    const slides = [
      {
        ...sampleImages.slide1,
        link: 'https://example.com/slide1',
        linkTitle: 'Learn more about Slide 1',
      },
      {
        ...sampleImages.slide2,
        link: 'https://example.com/slide2',
        linkTitle: 'Learn more about Slide 2',
      },
      {
        ...sampleImages.slide3,
        link: 'https://example.com/slide3',
        linkTitle: 'Learn more about Slide 3',
      },
    ];
    return createCarouselBlock(slides);
  },
};

/**
 * Story: Many Slides (5)
 */
export const ManySlides = {
  render: () => {
    const slides = [
      sampleImages.slide1,
      sampleImages.slide2,
      sampleImages.slide3,
      {
        pcImage: 'https://via.placeholder.com/1200x400/f8f8f8/505050?text=Slide+4+PC',
        spImage: 'https://via.placeholder.com/600x400/f8f8f8/505050?text=Slide+4+SP',
        alt: 'Slide 4',
      },
      {
        pcImage: 'https://via.placeholder.com/1200x400/ff6b6b/ffffff?text=Slide+5+PC',
        spImage: 'https://via.placeholder.com/600x400/ff6b6b/ffffff?text=Slide+5+SP',
        alt: 'Slide 5',
      },
    ];
    return createCarouselBlock(slides);
  },
};
