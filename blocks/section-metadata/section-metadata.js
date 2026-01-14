/**
 * @file section-metadata.js
 * @description Section Metadata block - Hidden metadata for page sections
 * @version 1.0.0
 *
 * This block is typically hidden and used to provide metadata like
 * background colors, themes, etc. for its parent section.
 */

export default function decorate(block) {
  const rows = [...block.children];
  const metadata = {};

  // Parse metadata key-value pairs
  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim();
      metadata[key] = value;
    }
  });

  // Apply metadata to parent section
  const section = block.closest('.section');
  if (section) {
    // Add style attribute if background color is specified
    if (metadata.background || metadata['background-color']) {
      section.style.backgroundColor = metadata.background || metadata['background-color'];
    }

    // Add theme class if specified
    if (metadata.theme) {
      section.classList.add(`theme-${metadata.theme}`);
    }

    // Add any custom classes
    if (metadata.class || metadata.classes) {
      const classes = (metadata.class || metadata.classes).split(' ');
      section.classList.add(...classes);
    }
  }

  // Hide the metadata block itself
  block.style.display = 'none';

  block._eds = {
    metadata,
    getMetadata: () => metadata,
  };
}
