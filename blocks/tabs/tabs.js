/**
 * @file tabs.js
 * @description Tabs block - Tabbed content interface
 * @version 1.0.0
 *
 * Based on Adobe EDS Block Collection Tabs pattern
 * @see https://github.com/adobe/aem-block-collection/tree/main/blocks/tabs
 */

let tabsId = 0;

function showTab(tabsBlock, index) {
  const tabButtons = tabsBlock.querySelectorAll('.tabs-tab');
  const tabPanels = tabsBlock.querySelectorAll('.tabs-panel');

  // Update buttons
  tabButtons.forEach((button, i) => {
    button.setAttribute('aria-selected', i === index ? 'true' : 'false');
    button.classList.toggle('active', i === index);
  });

  // Update panels
  tabPanels.forEach((panel, i) => {
    panel.hidden = i !== index;
    panel.classList.toggle('active', i === index);
  });
}

/**
 * Decorates the tabs block
 * @param {Element} block The tabs block element
 */
export default function decorate(block) {
  tabsId += 1;
  const id = `tabs-${tabsId}`;

  const rows = [...block.children];

  // Create tabs structure
  const tabList = document.createElement('div');
  tabList.className = 'tabs-list';
  tabList.setAttribute('role', 'tablist');

  const tabPanelsContainer = document.createElement('div');
  tabPanelsContainer.className = 'tabs-panels';

  // Convert rows to tabs and panels
  rows.forEach((row, index) => {
    const cells = [...row.children];

    if (cells.length >= 2) {
      // Tab button (from first cell)
      const tabButton = document.createElement('button');
      tabButton.className = 'tabs-tab';
      tabButton.setAttribute('role', 'tab');
      tabButton.setAttribute('id', `${id}-tab-${index}`);
      tabButton.setAttribute('aria-controls', `${id}-panel-${index}`);
      tabButton.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      tabButton.textContent = cells[0].textContent.trim();

      if (index === 0) tabButton.classList.add('active');

      tabButton.addEventListener('click', () => showTab(block, index));
      tabList.appendChild(tabButton);

      // Tab panel (from second cell)
      const tabPanel = document.createElement('div');
      tabPanel.className = 'tabs-panel';
      tabPanel.setAttribute('role', 'tabpanel');
      tabPanel.setAttribute('id', `${id}-panel-${index}`);
      tabPanel.setAttribute('aria-labelledby', `${id}-tab-${index}`);
      tabPanel.innerHTML = cells[1].innerHTML;
      tabPanel.hidden = index !== 0;

      if (index === 0) tabPanel.classList.add('active');

      tabPanelsContainer.appendChild(tabPanel);
    }
  });

  // Clear block and add new structure
  block.innerHTML = '';
  block.appendChild(tabList);
  block.appendChild(tabPanelsContainer);

  // Keyboard navigation
  const tabButtons = tabList.querySelectorAll('.tabs-tab');
  tabButtons.forEach((button, index) => {
    button.addEventListener('keydown', (e) => {
      let newIndex = index;

      if (e.key === 'ArrowRight') {
        newIndex = index + 1 < tabButtons.length ? index + 1 : 0;
      } else if (e.key === 'ArrowLeft') {
        newIndex = index - 1 >= 0 ? index - 1 : tabButtons.length - 1;
      } else if (e.key === 'Home') {
        newIndex = 0;
      } else if (e.key === 'End') {
        newIndex = tabButtons.length - 1;
      } else {
        return; // Exit if not a navigation key
      }

      e.preventDefault();
      showTab(block, newIndex);
      tabButtons[newIndex].focus();
    });
  });

  // Public API
  block._eds = {
    showTab: (index) => showTab(block, index),
    getCurrentIndex: () => {
      const activeButton = block.querySelector('.tabs-tab.active');
      return [...tabButtons].indexOf(activeButton);
    },
  };
}
