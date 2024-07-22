import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from '@vercel/og';
import { marked } from 'marked';
import FormData from 'form-data';

export const runtime = 'edge';

const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '';

async function uploadToImgBB(imageBuffer: ArrayBuffer): Promise<{ url: string, deleteUrl: string }> {
  const formData = new FormData();
  formData.append('image', Buffer.from(imageBuffer).toString('base64'));

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`ImgBB API responded with status code ${response.status}`);
  }

  const data = await response.json();

  if (data.success && data.data?.url) {
    return {
      url: data.data.url,
      deleteUrl: data.data.delete_url
    };
  } else {
    throw new Error('Unexpected ImgBB response format');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { markdown } = await req.json();

    // 将 Markdown 转换为 HTML
    const htmlContent = marked(markdown);

    // 生成图像
    const image = new ImageResponse(
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

    // 获取图像的 ArrayBuffer
    const imageBuffer = await image.arrayBuffer();

    // 上传到 ImgBB
    const { url, deleteUrl } = await uploadToImgBB(imageBuffer);

    return NextResponse.json({ url, deleteUrl });
  } catch (error) {
    console.error('Error generating and uploading image:', error);
    return NextResponse.json(
      { message: 'Error generating and uploading image', error: (error as Error).message },
      { status: 500 }
    );
  }
}