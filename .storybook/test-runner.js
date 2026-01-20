import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

/**
 * Storybook Test Runner configuration with a11y checks
 * 
 * This runs accessibility tests using axe-core for every story
 * and exports results in JSON format for CI/CD integration
 */

const a11yViolations = [];

module.exports = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page, context) {
    // Run accessibility checks
    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });

    // Collect violations for reporting
    const violations = await getViolations(page, '#storybook-root');
    
    if (violations.length > 0) {
      violations.forEach((violation) => {
        a11yViolations.push({
          story: context.title,
          rule: violation.id,
          impact: violation.impact,
          description: violation.description,
          helpUrl: violation.helpUrl,
          nodes: violation.nodes.length,
        });
      });
    }
  },
  
  // Export violations for CI/CD
  async getTestResult() {
    if (typeof process !== 'undefined' && process.env.CI) {
      const fs = await import('fs');
      fs.writeFileSync(
        'test-results/a11y-violations.json',
        JSON.stringify(a11yViolations, null, 2)
      );
    }
    return a11yViolations;
  },
};
