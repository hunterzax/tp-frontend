// jest.config.js
module.exports = {
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1", // Mapping for absolute imports
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
