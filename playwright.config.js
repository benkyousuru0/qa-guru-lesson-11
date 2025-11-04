/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: "./tests",
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: "https://apichallenges.herokuapp.com",
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000,
    ignoreHTTPSErrors: true,
    video: "off"
  },
};

export default config;
