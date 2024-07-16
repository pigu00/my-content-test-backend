import express from 'express';
import { GoogleAuth } from 'google-auth-library';
import { sheets } from 'googleapis/build/src/apis/sheets/index.js';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

async function getGoogleSheet(sheetId) {
  const auth = new GoogleAuth({
    keyFile: 'pigumycontent-9e471144d5c4.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
  });

  const authClient = await auth.getClient();

  const mySheet = sheets({
    version: 'v4',
    auth: authClient,
  });

  try {
    const response = await mySheet.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Leads',
    });
    return response.data.values;
  } catch (error) {
    console.error('Error fetching data from API: ' + error);
    return [];
  }
}

async function updateGoogleSheet(sheetId, range, values) {
  const auth = new GoogleAuth({
    keyFile: 'pigumycontent-9e471144d5c4.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
  });

  const authClient = await auth.getClient();

  const mySheet = sheets({
    version: 'v4',
    auth: authClient,
  });

  try {
    const response = await mySheet.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: range,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: values,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating API: ' + error);
    throw error;
  }
}

app.get('/api/data', async (req, res) => {
  try {
    const data = await getGoogleSheet('1O8kTre53S-W-gf4fUtSDthCV0xw6yXnSspig1q5YHoQ');
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

app.post('/api/update', async (req, res) => {
  const { range, values } = req.body;
  try {
    const result = await updateGoogleSheet('1O8kTre53S-W-gf4fUtSDthCV0xw6yXnSspig1q5YHoQ', range, values);
    res.json(result);
  } catch (error) {
    res.status(500).send('Error updating sheet');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
//c