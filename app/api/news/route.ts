// app/api/news/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// 从环境变量中获取配置

const DEFAULT_QUERY = process.env.DEFAULT_NEWS_QUERY || '';
const DEFAULT_SOURCES = process.env.DEFAULT_NEWS_SOURCES || '';
const DEFAULT_DAYS_AGO = parseInt(process.env.DEFAULT_DAYS_AGO || '1', 10);
const DEFAULT_PAGE_SIZE = parseInt(process.env.DEFAULT_PAGE_SIZE || '20', 10);
const DEFAULT_SORT_BY = process.env.DEFAULT_SORT_BY || 'publishedAt';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queryParam = searchParams.get('query');
  const query = queryParam ? queryParam.split('|').join(' OR ') : DEFAULT_QUERY;
  const sources = searchParams.get('sources') || DEFAULT_SOURCES;
  const daysAgo = parseInt(searchParams.get('daysAgo') || DEFAULT_DAYS_AGO.toString(), 10);
  const pageSize = parseInt(searchParams.get('pageSize') || DEFAULT_PAGE_SIZE.toString(), 10);
  const sortBy = searchParams.get('sortBy') || DEFAULT_SORT_BY;
  const API_KEY = process.env.NEWS_API_KEY || "";

  console.log("query:", query);

  if (!query) {
    return NextResponse.json({ message: 'Query parameter is required' }, { status: 400 });
  }

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - daysAgo);
  const fromDateString = fromDate.toISOString().split('T')[0];

  try {
    const url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.append('q', query);
    url.searchParams.append('apiKey', API_KEY);
    url.searchParams.append('from', fromDateString);
    url.searchParams.append('sortBy', sortBy);
    url.searchParams.append('pageSize', pageSize.toString());
    url.searchParams.append('page', '1');
    
    if (sources) {
      url.searchParams.append('sources', sources);
    }

    console.log("url:", url.toString());

    const response = await axios.get(url.toString());
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ message: 'Error fetching news' }, { status: 500 });
  }
}