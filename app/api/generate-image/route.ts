import { NextRequest } from 'next/server';
import { ImageResponse } from '@vercel/og';
import { marked } from 'marked';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { markdown } = await req.json();

    // 将 Markdown 转换为 HTML
    const htmlContent = marked(markdown);

    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 40,
            color: 'black',
            background: 'white',
            width: '100%',
            height: '100%',
            padding: '50px 200px',
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating image:', error);
    return new Response(
      JSON.stringify({ message: 'Error generating image', error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}