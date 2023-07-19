const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {google} = require('googleapis');
const {authenticate} = require('@google-cloud/local-auth');


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');



async function bab(auth) {
  const sheets = google.sheets({ version: 'v4', auth});
  const email = 'dhruvgautam@berkeley.edu'; // Specify the user's email here

  //const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1n5teNWMzyZF8mfHRhg7YR9d00Gswrp_G8AjDALix3-8/edit?usp=sharing';
  //const spreadsheetId = getSpreadsheetId(spreadsheetUrl);
  //const range = 'Sheet1!A1:G'; // Adjust the range to cover all the columns
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '1n5teNWMzyZF8mfHRhg7YR9d00Gswrp_G8AjDALix3-8',      
    range: 'Expenses!A1:K',
  });

  const values = response.data.values;
  if (values.length) {      
    console.log('Data for', email + ':');
      values.forEach((row) => {
        const [timestamp, userEmail, name, id, category, date, amount, userEmail2, description, link, reimbursement] = row;
        if (userEmail === email || userEmail2 === email) {
          console.log('Submitted Timestamp:', timestamp);
          console.log('Email:', userEmail);
          console.log('Name:', name);
          console.log('Id:', id);
          console.log('Account Billed:', category);
          console.log('Date:', date);
          console.log('Amount:', amount);
          console.log('Paypal Email:', userEmail2);
          console.log('Description:', description);
          console.log('Receipt Link:', link);
          console.log('Reimbursement:', reimbursement);
          console.log('------------------');
        }
      });
    } else {
      console.log('No data found.');
    }
} 

//const userEmail = 'dhruvgautam@berkeley.edu'; // Specify the user's email here
authorize().then(bab).catch(console.error);

/*function getSpreadsheetId(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match && match[1] ? match[1] : null;
}*/


/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}