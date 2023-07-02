import { consola } from 'consola';
import { AuthZeroBody } from '../../routes/auth0.schema.js';
import { Page } from 'puppeteer';

const authZeroPage = {
  logo: 'img#prompt-logo-center',
  inputs: {
    username: 'input#username',
    password: 'input#password'
  },
  submit: 'button[type="submit"]'
};

const resultPage = {
  success: 'h1.green-text',
  token: 'div[title="Access token"]'
};

export const getAuthZeroAccessToken = async (page: Page, options: AuthZeroBody) => {
  consola.start(`opening ui for ${options.url} and ${options.username}`);
  try {
    await page.goto(options.url);
    await page.waitForSelector(authZeroPage.logo, { visible: true });
    await page.type(authZeroPage.inputs.username, options.username);
    await page.type(authZeroPage.inputs.password, options.password);
    await (await page.$$(authZeroPage.submit)).at(1)?.click();
    await page.waitForSelector(resultPage.success, { visible: true });
    await page.waitForSelector(resultPage.token);
    const accessToken = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      return element?.textContent;
    }, resultPage.token);

    return {
      token: accessToken?.trim()
    };
  } catch (e) {
    return e;
  }
};
