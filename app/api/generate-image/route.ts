import { NextRequest, NextResponse } from 'next/server';
import { marked } from 'marked';

export const runtime = 'edge';

let chromium: any = null;

export async function POST(req: NextRequest) {
  try {
    const { markdown } = await req.json();

    // 将 Markdown 转换为 HTML
    const htmlContent = marked(markdown);

    // 动态导入 chrome-aws-lambda
    if (!chromium) {
      chromium = await import('chrome-aws-lambda');
    }

    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const screenshot = await page.screenshot({ encoding: 'base64' });
    await browser.close();

    return NextResponse.json({ 
      imageUrl: `data:image/png;base64,${screenshot}` 
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { message: 'Error generating image', error: (error as Error).message },
      { status: 500 }
    );
  }
}