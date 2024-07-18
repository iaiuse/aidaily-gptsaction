// pages/api/news.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { query } = req.query;
  const apiKey = process.env.NEWS_API_KEY; // 在Vercel环境变量中设置你的NewsAPI密钥

  try {
    const url = `https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}`;
    console.log("url:", url);
    const response = await axios.get(url);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news' });
  }
};

export default handler; 
