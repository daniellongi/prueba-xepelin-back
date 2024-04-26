import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import axios from 'axios';
import writeContentInGoogleSheets from './functions/updateGoogleSheets.js';
import scrapReadTime from './functions/scrapReadTime.js';
import formatDateToDDMMYYYY from './functions/formatTime.js';
import getTotalBlogsInCategory from './functions/getTotalBlogsInCategory.js';
import sendGoogleSheetToWebHook from './functions/webhookPost.js';

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/p2-prueba-xepelin', async (req, res) => {
  try {
    const email = "danielvildosolan@gmail.com";
    const spreadSheetId = "1f-aB4Km6jWVqZVqYwYLtfZk2RyGqVEUPXHvxLtGaZGg";
    const googleSheetHeaders = ["Titular", "Categoria", "Autor", "Tiempo de lectura", "Fecha de publicacion"];
    const validCategories = ["pymes", "corporativos", "empresarios-exitosos", "educacion-financiera", "noticias"];
    const { category, webhookUrl } = req.body;
    if (!validCategories.includes(category)) return res.status(400).send("La categoria ingresada no existe");
    const totalBlogsInCategory =  await getTotalBlogsInCategory(category);
    const urlToScrap = `https://4n68r2aa.apicdn.sanity.io/v2023-08-21/data/query/production?query=*%0A%09++%09%5B%0A%09%09%09%09%28_type+%3D%3D+%22blogArticle%22%29%0A++++++++%0A++++++++%26%26+%28%0A%09%09%09%09%09blogCategory-%3Eslug.current+%3D%3D+%22${category}%22%0A%09%09%09%09%29%0A%09%09++%5D+%0A%09%09%09%7C+order%28date+desc%2C+_createdAt+desc%29%0A%09%09%09%7B%0A++++++_type%2C%0A++++++_id%2C%0A++++++slug%2C%0A++++++title%2C%0A%09%09%09excerpt%2C%0A++++++featuredImage%2C%0A++++++_createdAt%2C%0A++++++_updatedAt%2C%0A++++++date%2C%0A++++++author-%3E%2C%0A++++++blogCategory-%3E%2C%0A++++++blogSubCategory-%3E%2C%0A++++++resourceCategory-%3E%2C%0A++++%7D%5B0...${totalBlogsInCategory}%5D&returnQuery=false&perspective=published`;
    const scrappingResults = await axios.get(urlToScrap);
    const googleSheetValuesPromises = scrappingResults.data.result.map( async (blog)=>{
      const title = blog.slug.current;
      const author = blog.author.name;
      const blogCategory = blog.blogCategory.frontendId;
      const blogCreatedDate = formatDateToDDMMYYYY(blog._createdAt);
      const blogReadTime = await scrapReadTime(category, title);
      return [title, blogCategory, author, blogReadTime, blogCreatedDate];
    });
    const googleSheetValues = await Promise.all(googleSheetValuesPromises);
    googleSheetValues.unshift(googleSheetHeaders);
    const updateGoogleSheetStatus = writeContentInGoogleSheets(googleSheetValues, spreadSheetId);
    if(updateGoogleSheetStatus){
      const dataToSendWebHook = {
        email,
        link: `https://docs.google.com/spreadsheets/d/${spreadSheetId}`
      };
      const webhookDataSended = sendGoogleSheetToWebHook(webhookUrl, dataToSendWebHook);
      if(webhookDataSended) return res.status(200).send(`Se ha enviado a ${email} el google sheet con los resultados del scrapping`);
      return res.status(400).send("Hubo un error al enviar el google spreadsheet al mail");
    }
    return res.status(400).send("Hubo un error al agregar el contenido al google sheet");
  }
  catch(error){
    return res.status(400).send("Hubo un error al realizar el scrapping");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
