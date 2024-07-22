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
  let currentParagraph = '';

  for (const line of lines) {
    if (line.startsWith('# ')) {
      if (currentParagraph) {
        elements.push(<p key={elements.length}>{parseInline(currentParagraph)}</p>);
        currentParagraph = '';
      }
      elements.push(<h1 key={elements.length}>{parseInline(line.slice(2))}</h1>);
    } else if (line.startsWith('## ')) {
      if (currentParagraph) {
        elements.push(<p key={elements.length}>{parseInline(currentParagraph)}</p>);
        currentParagraph = '';
      }
      elements.push(<h2 key={elements.length}>{parseInline(line.slice(3))}</h2>);
    } else if (line.trim() === '') {
      if (currentParagraph) {
        elements.push(<p key={elements.length}>{parseInline(currentParagraph)}</p>);
        currentParagraph = '';
      }
    } else {
      currentParagraph += (currentParagraph ? ' ' : '') + line;
    }
  }

  if (currentParagraph) {
    elements.push(<p key={elements.length}>{parseInline(currentParagraph)}</p>);
  }

  return elements;
}

function parseInline(text: string) {
  const parts = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <span key={parts.length} style={{ color: '#3182ce' }}>
        {match[1]}
      </span>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export async function POST(req: NextRequest) {
  const overallStartTime = Date.now();
  try {
    console.log('Start processing POST request');
    const { markdown } = await req.json();

    console.log('Start parsing Markdown');
    const startMarkdownParsing = Date.now();
    const parsedContent = parseMarkdown(markdown);
    console.log(`Markdown parsed in ${Date.now() - startMarkdownParsing}ms`);

    console.log('Start generating image');
    const startImageGeneration = Date.now();

    const estimatedHeight = Math.max(630, 200 + parsedContent.length * 40);

    const image = new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            padding: '40px',
          }}
        >
          {parsedContent.map((element, index) => {
            if (element.type === 'h1') {
              return (
                <h1
                  key={index}
                  style={{
                    fontSize: '40px',
                    fontWeight: 'bold',
                    color: '#1a202c',
                    marginBottom: '16px',
                    width: '100%',
                  }}
                >
                  {element.props.children}
                </h1>
              );
            } else if (element.type === 'h2') {
              return (
                <h2
                  key={index}
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#2d3748',
                    marginBottom: '12px',
                    marginTop: '20px',
                    width: '100%',
                  }}
                >
                  {element.props.children}
                </h2>
              );
            } else {
              return (
                <p
                  key={index}
                  style={{
                    fontSize: '20px',
                    color: '#4a5568',
                    lineHeight: '1.4',
                    marginBottom: '12px',
                    width: '100%',
                  }}
                >
                  {element.props.children}
                </p>
              );
            }
          })}
        </div>
      ),
      {
        width: 1200,
        height: estimatedHeight,
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