// app/api/news/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const apiKey = process.env.NEWS_API_KEY; // 在Vercel环境变量中设置你的NewsAPI密钥

  console.log("query:", query);

  if (!query) {
    return NextResponse.json({ message: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const url = `https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}`;
    console.log("url:", url);
    const response = await axios.get(url);
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching news' }, { status: 500 });
  }
}