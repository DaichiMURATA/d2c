/**
 * @file search.js
 * @description Search block - Search input with results
 * @version 1.0.0
 */

export default function decorate(block) {
  const searchContainer = document.createElement('div');
  searchContainer.className = 'search-container';

  const searchForm = document.createElement('form');
  searchForm.className = 'search-form';
  searchForm.setAttribute('role', 'search');

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'search-input';
  searchInput.placeholder = 'Search...';
  searchInput.setAttribute('aria-label', 'Search');

  const searchButton = document.createElement('button');
  searchButton.type = 'submit';
  searchButton.className = 'search-button';
  searchButton.textContent = 'Search';
  searchButton.setAttribute('aria-label', 'Submit search');

  searchForm.appendChild(searchInput);
  searchForm.appendChild(searchButton);
  searchContainer.appendChild(searchForm);

  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'search-results';
  resultsContainer.setAttribute('aria-live', 'polite');
  searchContainer.appendChild(resultsContainer);

  block.innerHTML = '';
  block.appendChild(searchContainer);

  // Basic search handler
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      resultsContainer.textContent = `Searching for: "${query}"...`;
      // Implement actual search logic here
    }
  });

  block._eds = {
    search: (query) => {
      searchInput.value = query;
      searchForm.dispatchEvent(new Event('submit'));
    },
  };
}
