import config from 'config';
import Debug from 'debug';

import selectors from 'constants/timo-selectors';

export const login = async (page) => {
  const __ = new Debug('app:scrappers:timo:login');

  await page.goto('https://my.timo.vn', { waitUntil: 'networkidle' });

  await page.waitFor(selectors.FORM_LOGIN);
  await page.waitFor(1000);

  __('Type username %s', config.timo.username);
  await page.type(selectors.INPUT_USERNAME, config.timo.username);

  await page.waitFor(1000);
  __('Type password %s', '•'.repeat(config.timo.password.length));
  await page.type(selectors.INPUT_PASSWORD, config.timo.password);

  __('Hit Login button')
  await page.click(selectors.BUTTON_LOGIN_BTN);
  await page.waitFor(selectors.TXT_ACCOUNT_NUMBER);
  await page.waitFor('.username');

  const account = await page.evaluate(() => {
    return {
      username: document.querySelector('.username').innerText,
      accountNumber: document.querySelector('span[ng-bind=spendAccountNumber]').innerText
    }
  })

  __('Login successfully. [%s] %s', account.accountNumber, account.username);

  return account;
};

export const getTransactions = async (page, account) => {
  const __ = new Debug('app:scrappers:timo:getTransactions');
  const TRANSACTION_PAGE = 'https://my.timo.vn/#/spend/transaction';

  __('Navigate to %s', TRANSACTION_PAGE);

  page.goto(TRANSACTION_PAGE)
  .catch(() => {/* Ignore 30s timeout error */});
  /* page.goto in this case cannot await.
  Because the page uses virtual DOM so it won't reload on navigate.
  The browser will be waiting forever */

  await page.waitFor(selectors.TRANSACTION_LIST);

  __('Transaction list loaded');

  const transactions = await page.evaluate(() => {
    const transactionListEl = document.querySelectorAll('.gs-list.ng-scope');
    const transactions = [];

    transactionListEl.forEach(transactionEl => {
      transactionEl.querySelector('.tbl').click();
      transactions.push({
        id: transactionEl.querySelector('span[ng-bind="item.display.refNo"]').innerText,
        type: transactionEl.querySelector('.name-label').innerText,
        amount: transactionEl.querySelector('span.money-label').innerText.replace(/\./g, '') * 1,
        description: transactionEl.querySelector('span[ng-bind="item.display.txnDesc"]').innerText
      });
    });

    return transactions;
  });

  __('Get transactions done');

  return transactions;
};
