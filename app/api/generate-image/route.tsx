import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from '@vercel/og';
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

function parseMarkdown(markdown: string) {
  const lines = markdown.split('\n');
  const elements = [];
  let currentSection = null;

  for (const line of lines) {
    if (line.startsWith('# ')) {
      if (currentSection) {
        elements.push(currentSection);
      }
      currentSection = { title: line.slice(2), items: [] };
    } else if (line.startsWith('## ')) {
      if (currentSection) {
        currentSection.items.push({ type: 'subtitle', content: line.slice(3) });
      }
    } else if (line.startsWith('- ')) {
      if (currentSection) {
        currentSection.items.push({ type: 'listItem', content: line.slice(2) });
      }
    } else if (line.trim() !== '') {
      if (currentSection) {
        currentSection.items.push({ type: 'text', content: line });
      }
    }
  }

  if (currentSection) {
    elements.push(currentSection);
  }

  return elements;
}

export async function POST(req: NextRequest) {
  const overallStartTime = Date.now();
  try {
    console.log('Start processing POST request');
    const { markdown, title, date } = await req.json();

    console.log('Start parsing Markdown');
    const startMarkdownParsing = Date.now();
    const parsedContent = parseMarkdown(markdown);
    console.log(`Markdown parsed in ${Date.now() - startMarkdownParsing}ms`);

    console.log('Start generating image');
    const startImageGeneration = Date.now();

    const image = new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'flex-start',
            width: '100%',
            height: '100%',
            backgroundColor: '#f7fafc',
            padding: '40px',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1a202c', marginBottom: '10px' }}>{title}</h1>
            <p style={{ fontSize: '18px', color: '#718096', marginBottom: '20px' }}>{date}</p>
            {parsedContent.map((section, sectionIndex) => (
              <div key={sectionIndex} style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748', marginBottom: '15px' }}>{section.title}</h2>
                {section.items.map((item, itemIndex) => {
                  if (item.type === 'subtitle') {
                    return <h3 key={itemIndex} style={{ fontSize: '20px', fontWeight: 'bold', color: '#4a5568', marginBottom: '10px' }}>{item.content}</h3>;
                  } else if (item.type === 'listItem') {
                    return <p key={itemIndex} style={{ fontSize: '16px', color: '#4a5568', marginBottom: '5px', paddingLeft: '20px' }}>• {item.content}</p>;
                  } else {
                    return <p key={itemIndex} style={{ fontSize: '16px', color: '#4a5568', marginBottom: '10px' }}>{item.content}</p>;
                  }
                })}
              </div>
            ))}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 1600, // 增加高度以容纳更多内容
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