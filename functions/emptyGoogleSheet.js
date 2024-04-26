import { google } from 'googleapis';

const emptyGoogleSheet = async (client, googleSheetId) => {

  const { data: { sheets } } = await google.sheets({ version: "v4", auth: client }).spreadsheets.get({
    spreadsheetId: googleSheetId,
  });
  
  const sheetId = sheets[0].properties.sheetId;
  
  const response = await google.sheets({ version: "v4", auth: client }).spreadsheets.batchUpdate({
    spreadsheetId: googleSheetId,
    resource: {
      requests: [{
        updateCells: {
          range: {
            sheetId: sheetId,
          },
          fields: '*',
        },
      }],
    },
  });
  if(response.status === 200){
    return true;
  }
  return false;
};

export default emptyGoogleSheet;
