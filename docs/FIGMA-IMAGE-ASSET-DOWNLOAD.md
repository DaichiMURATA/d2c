# Figma Image Asset Download Guide

## Overview

This guide explains how to correctly download image assets from Figma, specifically focusing on **IMAGE fills** used for background images and avoiding text/overlay contamination.

## The Problem

When a Figma component has a background image with text overlays:
- ❌ **Wrong**: Exporting the entire node → Downloads rendered output WITH text
- ✅ **Correct**: Downloading the IMAGE fill directly → Downloads pure image WITHOUT text

## How It Works

### Figma Structure Example (Hero Block)

```
Hero Component (COMPONENT)
├── fills: [{ type: "IMAGE", imageRef: "e4916fb..." }]  ← Background image
└── children:
    └── Headings (TEXT)  ← Text overlay
```

### Download Methods Comparison

| Method | What You Get | Use Case |
|--------|-------------|----------|
| **Node Export** (`/images?ids=nodeId`) | Rendered output (image + text) | ❌ Background images |
| **ImageRef Download** (`/images` + imageRef) | Pure image asset | ✅ Background images |

## Usage

### Command

```bash
# Download assets from a specific Figma variant
npm run download-assets -- --node-id=8668:498 --block=hero
```

### What Happens

1. **Script detects IMAGE fills** in node.fills or node.background:
   ```javascript
   fills: [
     {
       type: "IMAGE",
       imageRef: "e4916fb75b776c5c4b6dea0d80c3ae416f9cefee"
     }
   ]
   ```

2. **Fetches file's image manifest**:
   ```
   GET /v1/files/{fileId}/images
   
   Response:
   {
     "meta": {
       "images": {
         "e4916fb75b776c5c4b6dea0d80c3ae416f9cefee": "https://s3-alpha-sig.figma.com/img/..."
       }
     }
   }
   ```

3. **Downloads pure image asset**:
   - No text overlays
   - No child elements
   - Just the background image fill

4. **Saves to**:
   ```
   blocks/hero/hero-background.png  ← Pure image (no text)
   blocks/hero/assets/metadata.json ← Asset metadata
   ```

## Implementation Details

### Script: `scripts/download-figma-assets.js`

#### Key Function: `findImageNodes()`

Detects IMAGE fills in any node type (COMPONENT, FRAME, RECTANGLE, etc.):

```javascript
function findImageNodes(node, images = [], parentName = '') {
  // Check both 'fills' and 'background' properties
  const fillsToCheck = [
    ...(node.fills || []),
    ...(node.background || [])
  ];
  
  const hasImageFill = fillsToCheck.some(fill => fill && fill.type === 'IMAGE');
  
  if (hasImageFill) {
    const imageFill = fillsToCheck.find(fill => fill && fill.type === 'IMAGE');
    
    images.push({
      nodeId: node.id,
      nodeName: node.name,
      type: `${node.type}_WITH_IMAGE`,
      imageRef: imageFill.imageRef,  // ← Key: Extract imageRef
    });
  }
  
  // Recursively search children
  if (node.children) {
    node.children.forEach(child => findImageNodes(child, images, nodePath));
  }
  
  return images;
}
```

#### Key Function: `downloadImageByRef()`

Downloads image using imageRef (not node export):

```javascript
async function downloadImageByRef(imageRef, outputPath) {
  // Step 1: Get file's image manifest
  const manifestUrl = `${FIGMA_API_BASE}/files/${FIGMA_FILE_ID}/images`;
  const manifestResponse = await fetch(manifestUrl, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN }
  });
  const manifestData = await manifestResponse.json();
  
  // Step 2: Find URL for this imageRef
  const imageUrl = manifestData.meta?.images?.[imageRef];
  
  // Step 3: Download the image
  const imageResponse = await fetch(imageUrl);
  const buffer = Buffer.from(await imageResponse.arrayBuffer());
  
  // Step 4: Save to file
  writeFileSync(outputPath, buffer);
}
```

## CSS Integration

Once downloaded, reference the image in CSS:

```css
/* blocks/hero/hero.css */
.hero {
  background-image: url('./hero-background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
```

## Workflow Integration

### Block Generation Workflow

```
1. Inspect Figma → Get Variant Node IDs
2. Extract Styles → Get design tokens
3. ✅ Download Assets ← MUST happen BEFORE CSS generation
4. Generate CSS → Use correct image paths
5. Generate JS/Stories
6. Validate Loop
```

**Why Step 3 must happen before Step 4**:
- ✅ CSS references correct file names (`./hero-background.png`)
- ❌ If skipped: CSS might reference placeholders or wrong paths

## Troubleshooting

### Problem: Downloaded image contains text

**Cause**: Using node export instead of imageRef download

**Solution**: Ensure script uses `downloadImageByRef()` when imageRef is present

**Check**:
```bash
# Look for this in console output:
🎯 Using imageRef to download image fill only  ✅ Correct
🎯 Using node export (may include text/overlays)  ❌ Wrong for backgrounds
```

### Problem: No images found

**Cause**: IMAGE fill is nested deeper in component structure

**Solution**: Script recursively searches all children. Verify fill is actually type "IMAGE":

```javascript
// Check in Figma API response
fills: [
  { type: "IMAGE", imageRef: "..." }  ✅ Will be found
  { type: "SOLID", color: {...} }     ❌ Not an image
]
```

## Best Practices

1. **Always download assets BEFORE CSS generation**
   - Ensures correct file paths in CSS
   - Avoids placeholder image references

2. **Use imageRef for background images**
   - Gets pure image without overlays
   - Matches Figma design intent

3. **Verify downloaded images**
   - Open image file to confirm no text contamination
   - Compare with Figma design

4. **Clean up old/wrong images**
   - Delete images downloaded via node export
   - Keep only imageRef-downloaded images

## Related Commands

```bash
# Download from specific variant
npm run download-assets -- --node-id=<node-id> --block=<block-name>

# Download from all variants (if configured)
npm run download-all-variants -- --block=<block-name>

# Inspect Figma node structure
npm run inspect-figma -- --node-id=<node-id>
```

## Summary

✅ **DO**: Use imageRef to download IMAGE fills  
❌ **DON'T**: Use node export for background images  

The script automatically chooses the correct method based on whether imageRef is present.
