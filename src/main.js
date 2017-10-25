import Debug from 'debug';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import schedule from 'node-schedule';
import config from 'config';

import * as Timo from 'scrappers/timo-scrapper';
import * as MoneyLover from 'scrappers/moneylover-scrapper';

const __ = new Debug('app:main');
const DATA_PATH = path.resolve(__dirname, '../datasets');
const headless = typeof process.env.HEADLESS === 'undefined' ? true : process.env.HEADLESS === 'true';

__('App started');

/* Verify datasets folder exists */
if (!fs.existsSync(DATA_PATH)) {
  __('Create datasets dir %s', DATA_PATH);
  fs.mkdirSync(DATA_PATH);
}

/* Timo app */
const TimoApp = async () => { // eslint-disable-line no-unused-vars
  const browser = await puppeteer.launch({ headless });
  const page = await browser.newPage();

  await Timo.login(page);
  let transactions = await Timo.getTransactions(page);
  // console.log(transactions.length);
  // transactions = transactions.splice(0, config.maxTransactions * 1);

  fs.writeFileSync(`${DATA_PATH}/transactions.json`, JSON.stringify(transactions));
  __('Saved %d transactions to %s', transactions.length, `${DATA_PATH}/transactions.json`);

  await browser.close();
}

/* MoneyLover App */
const MoneyLoverApp = async () => { // eslint-disable-line no-unused-vars
  let addedTransactions = [], transactions = [];
  try {
    addedTransactions = fs.readFileSync(`${DATA_PATH}/added_transactions.txt`)
      .toString().trim().split(',');
  } catch (err) {
    console.log(err);
  }
  try {
    transactions = JSON.parse(fs.readFileSync(`${DATA_PATH}/transactions.json`));
  } catch (err) {
    console.log(err);
  }

  const addedTransactionsSet = new Set(addedTransactions);

  transactions = transactions.filter(transaction => !addedTransactionsSet.has(transaction.id))

  if (!transactions.length) {
    __('All transactions are synced');
    return;
  }

  const browser = await puppeteer.launch({ headless });
  const page = await browser.newPage();

  await MoneyLover.login(page);

  __('Adding %d transactions', transactions.length);

  for (let idx in transactions) {
    const transaction = transactions[idx];
    const addedTransactionId = await MoneyLover.addTransaction(page, transaction);

    addedTransactions.push(addedTransactionId);
    fs.writeFileSync(`${DATA_PATH}/added_transactions.txt`, addedTransactions.join());
  }

  await browser.close();
};

const job = async () => {
  await TimoApp();
  await MoneyLoverApp();
};

if (process.env.NO_JOB) job();
else schedule.scheduleJob(config.cronJob, job);
