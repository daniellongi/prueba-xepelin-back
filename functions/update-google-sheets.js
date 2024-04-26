import { google } from 'googleapis';
import emptyGoogleSheet from './emptyGoogleSheet.js';

const writeContentInGoogleSheets = async (values, spreadSheetId) => {
  try {
    const client = new google.auth.JWT(
      process.env.CLIENT_EMAIL,
      null,
      process.env.PRIVATE_KEY_ID,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    const googleSheetIsEmpty = await emptyGoogleSheet(client, spreadSheetId);
    if (googleSheetIsEmpty) {
      const googleSheetIsUpdatedWithNewValues = client.authorize(async function (error, tokens) {
        if (error) {
          return false;
        }  
        const googleSheetApi = google.sheets({ version: "v4", auth: client });
        const range = `Hoja 1!A1:${String.fromCharCode(64 + values[0].length)}${values.length}`;
        const response = await googleSheetApi.spreadsheets.values.update({
          spreadsheetId: spreadSheetId,
          range: range,
          valueInputOption: 'RAW',
          resource: {
            values: values,
          },
        });

        if (response.status === 200) {
          return true;
        }
        return false;
      });
      if (googleSheetIsUpdatedWithNewValues) {
        return true;
      }
      return false;
    }
  } catch (error) {
    return false;
  }
};

export default writeContentInGoogleSheets;
