module.exports = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json", "lcov", "text", "clover"],
  collectCoverageFrom: [
    "controllers/**/*.js", // Include files from the src folder
    "!src/**/*.test.js", // Exclude test files
    "!src/**/index.js", // Exclude index files
  ],
  testEnvironment: "node", // Specify the test environment
};
