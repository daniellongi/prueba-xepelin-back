import axios from 'axios';

const getTotalBlogsInCategory = async (category) => {
  const url = `https://4n68r2aa.apicdn.sanity.io/v2023-08-21/data/query/production?query=count%28*%0A++++++%5B%0A%09%09%09%09%28_type+%3D%3D+%22blogArticle%22%29+%0A++++++++%0A++++++++%26%26+%28blogCategory-%3Eslug.current+%3D%3D+%22${category}%22%29%0A%09%09++%5D+%0A%09%09%09%7C+order%28date+desc%2C+_createdAt+desc%29%0A%09%09%09%7B%0A++++++_type%2C%0A++++++_id%2C%0A++++++slug%2C%0A++++++title%2C%0A%09%09%09excerpt%2C%0A++++++featuredImage%2C%0A++++++_createdAt%2C%0A++++++_updatedAt%2C%0A++++++date%2C%0A++++++author-%3E%2C%0A++++++blogCategory-%3E%2C%0A++++++resourceCategory-%3E%2C%0A++++++%7D%0A++++%29&returnQuery=false&perspective=published`;
  const response = await axios.get(url);
  return response.data.result;
};

export default getTotalBlogsInCategory;
