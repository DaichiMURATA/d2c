/**
 * @file carousel.js
 * @description Carousel block - Slideshow of content items
 * @version 1.0.0
 *
 * Based on Adobe EDS Block Collection Carousel pattern
 * @see https://github.com/adobe/aem-block-collection/tree/main/blocks/carousel
 */

let carouselId = 0;

function updateButtonStates(carousel) {
  const slides = carousel.querySelectorAll('.carousel-slide');
  const prevButton = carousel.querySelector('.carousel-button-prev');
  const nextButton = carousel.querySelector('.carousel-button-next');
  const indicators = carousel.querySelectorAll('.carousel-indicator');

  let currentIndex = 0;
  slides.forEach((slide, index) => {
    if (slide.classList.contains('active')) {
      currentIndex = index;
    }
  });

  // Update button states
  prevButton.disabled = currentIndex === 0;
  nextButton.disabled = currentIndex === slides.length - 1;

  // Update indicators
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle('active', index === currentIndex);
  });
}

function showSlide(carousel, index) {
  const slides = carousel.querySelectorAll('.carousel-slide');
  const track = carousel.querySelector('.carousel-track');

  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });

  // Slide animation
  track.style.transform = `translateX(-${index * 100}%)`;

  updateButtonStates(carousel);
}

function nextSlide(carousel) {
  const slides = carousel.querySelectorAll('.carousel-slide');
  const currentIndex = [...slides].findIndex((slide) => slide.classList.contains('active'));

  if (currentIndex < slides.length - 1) {
    showSlide(carousel, currentIndex + 1);
  }
}

function prevSlide(carousel) {
  const slides = carousel.querySelectorAll('.carousel-slide');
  const currentIndex = [...slides].findIndex((slide) => slide.classList.contains('active'));

  if (currentIndex > 0) {
    showSlide(carousel, currentIndex - 1);
  }
}

/**
 * Decorates the carousel block
 * @param {Element} block The carousel block element
 */
export default function decorate(block) {
  carouselId += 1;

  const rows = [...block.children];

  // Create carousel structure
  const carouselContainer = document.createElement('div');
  carouselContainer.className = 'carousel-container';

  const track = document.createElement('div');
  track.className = 'carousel-track';

  // Convert rows to slides
  rows.forEach((row, index) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `Slide ${index + 1}`);

    if (index === 0) slide.classList.add('active');

    // Move row content to slide
    slide.innerHTML = row.innerHTML;
    track.appendChild(slide);
  });

  // Clear block and add track
  block.innerHTML = '';
  carouselContainer.appendChild(track);
  block.appendChild(carouselContainer);

  // Navigation buttons
  const prevButton = document.createElement('button');
  prevButton.className = 'carousel-button carousel-button-prev';
  prevButton.setAttribute('aria-label', 'Previous slide');
  prevButton.innerHTML = '‹';
  prevButton.addEventListener('click', () => prevSlide(block));

  const nextButton = document.createElement('button');
  nextButton.className = 'carousel-button carousel-button-next';
  nextButton.setAttribute('aria-label', 'Next slide');
  nextButton.innerHTML = '›';
  nextButton.addEventListener('click', () => nextSlide(block));

  carouselContainer.appendChild(prevButton);
  carouselContainer.appendChild(nextButton);

  // Indicators
  const indicators = document.createElement('div');
  indicators.className = 'carousel-indicators';

  rows.forEach((_, index) => {
    const indicator = document.createElement('button');
    indicator.className = 'carousel-indicator';
    indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
    if (index === 0) indicator.classList.add('active');

    indicator.addEventListener('click', () => showSlide(block, index));
    indicators.appendChild(indicator);
  });

  block.appendChild(indicators);

  // Keyboard navigation
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide(block);
    } else if (e.key === 'ArrowRight') {
      nextSlide(block);
    }
  });

  // Update button states
  updateButtonStates(block);

  // Public API
  block._eds = {
    showSlide: (index) => showSlide(block, index),
    next: () => nextSlide(block),
    prev: () => prevSlide(block),
    getCurrentIndex: () => {
      const slides = block.querySelectorAll('.carousel-slide');
      return [...slides].findIndex((slide) => slide.classList.contains('active'));
    },
  };
}
