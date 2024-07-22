import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from '@vercel/og';
import { marked } from 'marked';
import axios from 'axios';
import FormData from 'form-data';

const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '';

async function uploadToImgBB(imageBuffer: Buffer): Promise<{ url: string; deleteUrl: string }> {
  console.log('Start uploading to ImgBB');
  const startTime = Date.now();
  
  const formData = new FormData();
  formData.append('image', imageBuffer.toString('base64'));

  const response = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, formData, {
    headers: formData.getHeaders(),
  });

  if (response.status !== 200) {
    throw new Error(`ImgBB API responded with status code ${response.status}`);
  }

  const data = response.data;

  if (data.success && data.data?.url) {
    console.log(`Image uploaded to ImgBB in ${Date.now() - startTime}ms`);
    return {
      url: data.data.url,
      deleteUrl: data.data.delete_url,
    };
  } else {
    throw new Error('Unexpected ImgBB response format');
  }
}

export async function POST(req: NextRequest) {
  const overallStartTime = Date.now();
  try {
    console.log('Start processing POST request');
    const { markdown } = await req.json();

    console.log('Start converting Markdown to HTML');
    const startMarkdownConversion = Date.now();
    const htmlContent = marked(markdown);
    console.log(`Markdown converted to HTML in ${Date.now() - startMarkdownConversion}ms`);

    console.log('Start generating image');
    const startImageGeneration = Date.now();
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
          {htmlContent.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
    console.log(`Image generated in ${Date.now() - startImageGeneration}ms`);

    console.log('Start converting image to Buffer');
    const startBufferConversion = Date.now();
    const imageBuffer = Buffer.from(await image.arrayBuffer());
    console.log(`Image converted to Buffer in ${Date.now() - startBufferConversion}ms`);

    const { url, deleteUrl } = await uploadToImgBB(imageBuffer);

    console.log(`Total processing time: ${Date.now() - overallStartTime}ms`);
    return NextResponse.json({ url, deleteUrl });
  } catch (error) {
    console.error('Error generating and uploading image:', error);
    console.log(`Total processing time (with error): ${Date.now() - overallStartTime}ms`);
    return NextResponse.json(
      { message: 'Error generating and uploading image', error: (error as Error).message },
      { status: 500 }
    );
  }
}