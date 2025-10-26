module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[tj]sx?$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(axios)/)"  
  ],
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
};
