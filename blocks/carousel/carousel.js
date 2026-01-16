/**
 * Carousel Block
 * 
 * 画像スライダーを実装。自動再生、ナビゲーションボタン、スライドインジケーター付き。
 * 
 * Content Model:
 * - 各行がスライド
 * - 各スライドには2列（PCとSP画像）
 * - 画像の下にリンクがある場合、画像全体にリンクを適用
 */

let carouselId = 0;

/**
 * スライド要素を作成
 */
function createSlide(row, slideIndex, carouselIdNum) {
  const slide = document.createElement('li');
  slide.classList.add('carousel-slide');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselIdNum}-slide-${slideIndex}`);
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-label', `${slideIndex + 1}`);

  const columns = row.querySelectorAll(':scope > div');
  
  // PC画像とSP画像を処理
  const slideImage = document.createElement('div');
  slideImage.classList.add('carousel-slide-image');

  columns.forEach((column, colIndex) => {
    const picture = column.querySelector('picture');
    const link = column.querySelector('a');

    if (picture) {
      const img = picture.querySelector('img');
      
      // データ属性設定（PC: desktop, SP: mobile）
      const viewportType = colIndex === 0 ? 'desktop' : 'mobile';
      picture.setAttribute('data-viewport', viewportType);
      
      if (img) {
        img.setAttribute('loading', slideIndex === 0 ? 'eager' : 'lazy');
      }

      // リンクがある場合は画像全体をリンクでラップ
      if (link && !link.closest('picture')) {
        const imageLink = document.createElement('a');
        imageLink.href = link.href;
        imageLink.title = link.title || '';
        imageLink.setAttribute('aria-label', `Slide ${slideIndex + 1} link`);
        imageLink.append(picture);
        slideImage.append(imageLink);
        link.remove(); // 元のリンクを削除
      } else {
        slideImage.append(picture);
      }
    }
  });

  slide.append(slideImage);
  return slide;
}

/**
 * スライドインジケーター更新
 */
function updateActiveSlide(activeSlide, block) {
  const slides = block.querySelectorAll('.carousel-slide');
  const indicators = block.querySelectorAll('.carousel-slide-indicator');

  slides.forEach((slide, index) => {
    if (slide === activeSlide) {
      slide.classList.add('active');
      slide.setAttribute('aria-hidden', 'false');
      slide.setAttribute('tabindex', '0');
      
      if (indicators[index]) {
        indicators[index].classList.add('active');
        indicators[index].querySelector('button').setAttribute('aria-current', 'true');
      }
    } else {
      slide.classList.remove('active');
      slide.setAttribute('aria-hidden', 'true');
      slide.setAttribute('tabindex', '-1');
      
      if (indicators[index]) {
        indicators[index].classList.remove('active');
        indicators[index].querySelector('button').removeAttribute('aria-current');
      }
    }
  });
}

/**
 * 次のスライドへ移動
 */
function scrollToSlide(block, slideIndex) {
  const slides = block.querySelectorAll('.carousel-slide');
  const targetSlide = slides[slideIndex];
  
  if (targetSlide) {
    const slidesWrapper = block.querySelector('.carousel-slides');
    slidesWrapper.scrollTo({
      left: targetSlide.offsetLeft,
      behavior: 'smooth',
    });
    updateActiveSlide(targetSlide, block);
  }
}

/**
 * 自動スライド機能
 */
function startAutoSlide(block, interval = 5000) {
  let autoSlideTimer;

  const nextSlide = () => {
    const slides = block.querySelectorAll('.carousel-slide');
    const currentSlide = block.querySelector('.carousel-slide.active');
    const currentIndex = Array.from(slides).indexOf(currentSlide);
    const nextIndex = (currentIndex + 1) % slides.length;
    scrollToSlide(block, nextIndex);
  };

  const start = () => {
    stop();
    autoSlideTimer = setInterval(nextSlide, interval);
    block.dataset.autoSlide = 'playing';
    updatePlayPauseButton(block, 'playing');
  };

  const stop = () => {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
      autoSlideTimer = null;
    }
    block.dataset.autoSlide = 'paused';
    updatePlayPauseButton(block, 'paused');
  };

  // マウスホバー時は一時停止
  block.addEventListener('mouseenter', stop);
  block.addEventListener('mouseleave', start);

  // Play/Pauseボタン
  const playPauseButton = block.querySelector('.carousel-play-pause');
  if (playPauseButton) {
    playPauseButton.addEventListener('click', () => {
      if (block.dataset.autoSlide === 'playing') {
        stop();
      } else {
        start();
      }
    });
  }

  // 初期状態で開始
  start();

  return { start, stop };
}

/**
 * Play/Pauseボタンの表示更新
 */
function updatePlayPauseButton(block, state) {
  const button = block.querySelector('.carousel-play-pause');
  if (!button) return;

  if (state === 'playing') {
    button.classList.remove('paused');
    button.classList.add('playing');
    button.setAttribute('aria-label', 'Pause auto-slide');
    button.textContent = '⏸';
  } else {
    button.classList.remove('playing');
    button.classList.add('paused');
    button.setAttribute('aria-label', 'Play auto-slide');
    button.textContent = '▶';
  }
}

/**
 * イベントバインディング
 */
function bindEvents(block) {
  const slidesWrapper = block.querySelector('.carousel-slides');
  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  const prevButton = block.querySelector('.slide-prev');
  const nextButton = block.querySelector('.slide-next');

  // インジケータークリック
  indicators.forEach((indicator) => {
    const button = indicator.querySelector('button');
    button.addEventListener('click', () => {
      const targetIndex = parseInt(indicator.dataset.targetSlide, 10);
      scrollToSlide(block, targetIndex);
    });
  });

  // ナビゲーションボタン
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      const slides = block.querySelectorAll('.carousel-slide');
      const currentSlide = block.querySelector('.carousel-slide.active');
      const currentIndex = Array.from(slides).indexOf(currentSlide);
      const prevIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
      scrollToSlide(block, prevIndex);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      const slides = block.querySelectorAll('.carousel-slide');
      const currentSlide = block.querySelector('.carousel-slide.active');
      const currentIndex = Array.from(slides).indexOf(currentSlide);
      const nextIndex = (currentIndex + 1) % slides.length;
      scrollToSlide(block, nextIndex);
    });
  }

  // キーボードナビゲーション
  block.addEventListener('keydown', (e) => {
    const slides = block.querySelectorAll('.carousel-slide');
    const currentSlide = block.querySelector('.carousel-slide.active');
    const currentIndex = Array.from(slides).indexOf(currentSlide);

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
      scrollToSlide(block, prevIndex);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % slides.length;
      scrollToSlide(block, nextIndex);
    }
  });

  // スクロールイベントでアクティブスライド更新
  let scrollTimeout;
  slidesWrapper.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollLeft = slidesWrapper.scrollLeft;
      const slideWidth = slidesWrapper.offsetWidth;
      const activeIndex = Math.round(scrollLeft / slideWidth);
      const slides = block.querySelectorAll('.carousel-slide');
      if (slides[activeIndex]) {
        updateActiveSlide(slides[activeIndex], block);
      }
    }, 100);
  });
}

/**
 * メインのdecorate関数
 */
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');
  block.setAttribute('aria-label', `Carousel ${carouselId}`);

  const rows = Array.from(block.children);
  const isSingleSlide = rows.length < 2;

  // 複数スライドの場合のみキーボードフォーカス可能
  if (!isSingleSlide) {
    block.setAttribute('tabindex', '0');
  }

  // スライドコンテナ作成
  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  slidesWrapper.setAttribute('role', 'list');

  // スライド作成
  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  // 複数スライドの場合、ナビゲーションUIを追加
  if (!isSingleSlide) {
    // スライドインジケーター
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.classList.add('carousel-indicators-nav');
    slideIndicatorsNav.setAttribute('aria-label', 'Carousel Slide Controls');

    const slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');

    rows.forEach((row, idx) => {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="Show Slide ${idx + 1} of ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    });

    slideIndicatorsNav.append(slideIndicators);

    // Play/Pauseボタン
    const playPauseButton = document.createElement('button');
    playPauseButton.type = 'button';
    playPauseButton.classList.add('carousel-play-pause');
    playPauseButton.setAttribute('aria-label', 'Pause auto-slide');
    slideIndicatorsNav.append(playPauseButton);

    block.append(slideIndicatorsNav);

    // ナビゲーションボタン
    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="Previous Slide">‹</button>
      <button type="button" class="slide-next" aria-label="Next Slide">›</button>
    `;
    container.append(slideNavButtons);

    // イベントバインディング
    bindEvents(block);

    // 最初のスライドをアクティブに
    const firstSlide = block.querySelector('.carousel-slide');
    if (firstSlide) {
      updateActiveSlide(firstSlide, block);
    }

    // 自動スライド開始
    startAutoSlide(block);
  } else {
    // シングルスライドの場合は最初のスライドをアクティブに
    const firstSlide = block.querySelector('.carousel-slide');
    if (firstSlide) {
      firstSlide.classList.add('active');
    }
  }
}
