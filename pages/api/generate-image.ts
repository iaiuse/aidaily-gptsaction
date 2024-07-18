import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import { marked } from 'marked';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { markdown } = req.body;

  try {
    const htmlContent = marked(markdown);
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const screenshot = await page.screenshot({ encoding: 'base64' });
    await browser.close();

    res.status(200).json({ imageUrl: `data:image/png;base64,${screenshot}` });
  } catch (error) {
    res.status(500).json({ message: 'Error generating image' });
  }
};

export default handler; 
