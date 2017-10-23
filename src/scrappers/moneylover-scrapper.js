import numeral from 'numeral';
import config from 'config';
import selectors from 'constants/moneylover-selectors';
import Debug from 'debug';

export const login = async (page) => {
  const __ = new Debug('app:scrappers:moneylover:login');
  const MONEY_LOVER_APP = 'https://web.moneylover.me';

  __('Navigate to %s', MONEY_LOVER_APP);
  await page.goto(MONEY_LOVER_APP, { waitUntil: 'networkidle' });
  await page.waitFor(selectors.INPUT_LOGIN_EMAIL);

  __('Type email %s', config.moneyLover.email)
  await page.type(selectors.INPUT_LOGIN_EMAIL, config.moneyLover.email);

  __('Type password %s', '•'.repeat(config.moneyLover.password.length));
  await page.type(selectors.INPUT_LOGIN_PASSWORD, config.moneyLover.password);

  __('Click "Login" button');
  await (await page.$$('button'))[2].click();

  await page.waitFor(selectors.TXT_ACCOUNT_INFO);
  __('Login successfully %s', await page.evaluate(() => document.querySelector('.account-info').innerText.trim()));
};

export const addTransaction = async (page, transaction) => {
  const __ = new Debug('app:scrappers:moneylover:addTransaction');
  const WALLET_URL = `https://web.moneylover.me/wallet/${config.moneyLover.walletId}`;
  const note = `[${transaction.type}] ${transaction.description} ${transaction.id}`;

  __('Navigate to %s', WALLET_URL);
  await page.goto(WALLET_URL, { waitUntil: 'networkidle' });
  await page.waitFor(selectors.TXT_WALLET_NAME);

  const wallet = await page.evaluate(() => ({
    name: document.querySelector('.wallet-name').innerText,
    amount: document.querySelector('.amount').innerText.replace(/\D/g, '') * 1
  }));

  const friendlyAmount = numeral(wallet.amount).format('0,0');

  __('Wallet loaded: [%s] %s', wallet.name, friendlyAmount);

  await page.click(selectors.BUTTON_ADD_TRAN);
  await page.waitFor(selectors.DIALOG_ADD_TRAN);

  __('Select category');
  await page.click(selectors.INPUT_TRAN_CAT);
  await page.waitFor(selectors.BUTTON_ADD_TRAN_CAT_TABS);

  const tabs = await page.$$(selectors.BUTTON_ADD_TRAN_CAT_TABS);
  let tabIdx = 2, catIdx = 1;

  if (transaction.amount < 0) {
    tabIdx = 1;
    catIdx = 9;
  }

  await tabs[tabIdx].click();
  await page.waitFor(selectors.BUTTON_ADD_TRAN_CAT_ITEMS);

  await (await page.$$(selectors.BUTTON_ADD_TRAN_CAT_ITEMS))[catIdx].click();

  __('Type amount %s', friendlyAmount);
  await page.type(selectors.INPUT_ADD_TRAN_AMOUNT, Math.abs(transaction.amount).toString());

  __('Type note %s', note);
  await page.type(selectors.INPUT_ADD_TRAN_NOTE, note);

  await (await page.$$('.dialog-transaction button[type=button]:nth-child(1)'))[1].click();
  __('Add transaction successfully');

  return transaction.id;
};
