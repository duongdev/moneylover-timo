# VPBank Timo transactions updater for MoneyLover
Auto update Timo budget to Money Lover 

## Getting started

### Prerequisites
- Node: Install version 8.4 or greater
- Yarn: [See installation instruction here](https://yarnpkg.com/lang/en/docs/install/)
- Meets [puppeteer](https://github.com/GoogleChrome/puppeteer/)'s prerequisites

### Installation
- Clone or fork this repository
- Rename `src/config/config-example.json` to `src/config/config.json`
- Fill in your Timo and MoneyLover login information
- Run `yarn install` to install npm dependencies

### Running locally
Run `yarn start` to run app as cron job configured in `config.json`. You can add one or some environment variables below to let the app runs as how you want

#### Environment variables
- `DEBUG=app:*`: Turn on debug mode, this will print app messages to stdout.
- `HEADLESS`: Boolean (`true`/`false`) - Show/hide chrome browser window.
- `NO_JOB=true`: Run app one time immediately (not wait for cron job).

## FAQ

### Q: How does it work?
This tool uses [puppeteer](https://github.com/GoogleChrome/puppeteer/), _a Node library which provides a high-level API to control headless Chrome over the DevTools Protocol_ to surf into Timo's website and collect your transaction data, check with local datasets and submit them to MoneyLover via their website.

### Q: How about sensitive data?
Your data is yours. We save the config and data in your computer (`datasets` folder). Now your data security is your responsibility. We do recommend you to keep it safe.

If you have any idea to secure transactions and account data, please don't hesitate to let us know.

## Contributing
PRs are welcome :)
