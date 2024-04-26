import axios from "axios";

const sendGoogleSheetToWebHook = async (webHookUrl, data) => {
  try {
    const response = await axios.post(webHookUrl, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.data.status === "success") {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export default sendGoogleSheetToWebHook;
