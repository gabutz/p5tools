const puppeteer = require('puppeteer');
const yargs = require('yargs');
const logger = require('./logger');

const USERNAME = process.env.P5_USERNAME;
const PASSWORD = process.env.P5_PASSWORD
const USERNAME_SELECTOR = '#loginForm\\:username';
const PASSWORD_SELECTOR = '#loginForm\\:password';
const LOGIN_CTA_SELECTOR = '#loginForm\\:submit';
const URL = "https://gab.pentalog.fr/pages/login.jsf";

const argv = yargs
  .command('info', 'Get info about active requests', {})
  .command('approve', 'Approve requests', {})
  .option('type', {
    alias: 't',
    description: 'The type of request',
    choices: ['all', 'wfh', 'paid'],
  })
  .option('verbose', {
    alias: 'v',
    description: 'Display more information',
    type: 'boolean',
  })
  .option('limit', {
    alias: 'l',
    description: 'Limit the requeste to approve',
    type: 'number',
  })
  .help()
  .alias('help', 'h')
  .argv;

function dispatch(argv) {
  if (argv._.length == 0) {
    throw new Error('You must enter an action');
  }

  if (argv._.length > 1) {
    throw new Error('You must enter a single action');
  }

  var typeFilter = "0";
  switch(argv.type) {
    case 'wfh':
      typeFilter = "77";
      break;
    case 'paid':
      typeFilter = "1";
      break;
    default:
      break;
  }

  return {action: argv._[0], type: typeFilter, limit: argv.limit || 0};
}

async function startBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.CHROME_BIN || null,
    args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  page.setViewport({width: 1366, height: 768});
  return {browser, page};
}

async function closeBrowser(browser) {
  return browser.close();
}

async function login(page) {
  // Load login page
  await page.goto(URL);

  // Input username and password
  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(USERNAME);
  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(PASSWORD);

  // Attempt login and wait for page load
  await Promise.all([
    page.click(LOGIN_CTA_SELECTOR),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);

  let currentPage = await page.url();
  if (currentPage.search('login') > -1) {
    return false;
  }

  return true;
}

async function getInfo(page, type) {
  if (type != "0") {
    await Promise.all([
      page.select('select[id$="type_absence"]', type),
      page.waitForResponse('https://gab.pentalog.fr/pages/listRequestsToApprove.jsf'),
    ]);
  }

  return await page.evaluate( () => {
    return Array.from(document.querySelectorAll('table[id$=list] > tbody > tr'))
      .map(row => {
        let name = row.querySelector('td[id$="190"]').textContent + " " + row.querySelector('td[id$="186"]').textContent,
          start = row.querySelector('td[id$="197"]').textContent,
          end = row.querySelector('td[id$="202"]').textContent,
          days = row.querySelector('td[id$="207"]').textContent,
          type = row.querySelector('td[id$="193"]').textContent;
        return {name, start, end, days, type};
      });
  });
}

async function approve(page, type, limit, approved) {
  if (type != "0") {
    await Promise.all([
      page.select('select[id$="type_absence"]', type),
      page.waitForResponse('https://gab.pentalog.fr/pages/listRequestsToApprove.jsf'),
    ]);
  }

  let requests = await page.evaluate( () => {
    return document.querySelectorAll('table[id$=list] > tbody > tr').length;
  });
  
  if (requests == 0 || approved >= limit && limit > 0) {
    return approved;
  }

  await Promise.all([
    page.click('a[id="j_id174\\:list\\:0\\:j_id226"]'),
    page.waitForResponse('https://gab.pentalog.fr/pages/listRequestsToApprove.jsf'),
    page.waitFor(1000),
  ]);

  await Promise.all([
    page.select('select[name$="j_id186"]', "6"),
    page.click('input[name$="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);

  return await approve(page, type, limit, ++approved);
}

async function run() {
  logger.verbose = argv.verbose || false;
  
  try {
    var {action, type, limit} = dispatch(argv);
  } catch (error) {
    logger.log(error.message);
    process.exit(1);
  }
  
  const {browser, page} = await startBrowser();

  let loginCheck = await login(page);
  if (! loginCheck) {
    logger.log('Login failed!');
    process.exit(1);
  }

  const requestsListCTA = await page.$('[name="j_id203:j_id204"]');

  // Navigate to the requests list
  await Promise.all([
    requestsListCTA.click(),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);

  switch(action) {
    case "approve":
      let requests = await approve(page, type, limit, 0);
      logger.log(`Approved ${requests} requests!`);

      break;
    case "info":
    default:
      let info = await getInfo(page, type);
      logger.log(`There are ${info.length} pending requests!\n`);

      if (logger.verbose) {
        info.forEach(request => {
          let message = request.name.padEnd(30) +
            ' | From: ' + request.start + 
            ' | To: ' + request.end +
            ' | Days: ' + request.days.padEnd(5);
          if (type == "0") {
            message += ' | Type: ' + request.type;
          }

          logger.log(message);
        });
      }

      break;
  }

  browser.close();
}

run();