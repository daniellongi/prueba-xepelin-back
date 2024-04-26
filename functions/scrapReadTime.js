import axios from 'axios';
import * as cheerio from 'cheerio';

const scrapReadTime = async (blogCategory, blogName) => {

  try {
    const url = `https://xepelin.com/blog/${blogCategory}/${blogName}`;  
    const readTime = await axios.get(url).then(response => {
      const $ = cheerio.load(response.data);
      const element = $('.Text_body__snVk8.text-base.dark\\:text-text-disabled.dark\\:\\[\\&_a\\]\\:text-tertiary-main.text-grey-600');
      const blogLectureTime = element.text().trim();
      const splitText = blogLectureTime.split(/\s+/);
      return splitText[0] + splitText[1];
    });
    return readTime;
  } catch (error) {
    return "Error scraping the time";
  }

};

export default scrapReadTime;
