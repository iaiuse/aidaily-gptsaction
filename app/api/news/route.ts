// app/api/news/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = process.env.NEWS_API_KEY || "";
const DEFAULT_QUERY = (process.env.DEFAULT_NEWS_QUERY || '').split('|').filter(q => q.trim() !== '');
const DEFAULT_SOURCES = process.env.DEFAULT_NEWS_SOURCES || '';
const DEFAULT_DAYS_AGO = parseInt(process.env.DEFAULT_DAYS_AGO || '1', 10);
const DEFAULT_PAGE_SIZE = parseInt(process.env.DEFAULT_PAGE_SIZE || '20', 10);
const DEFAULT_SORT_BY = process.env.DEFAULT_SORT_BY || 'publishedAt';

interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

function isArticleRemoved(article: NewsArticle): boolean {
  return article.title === '[Removed]' && article.description === '[Removed]' && article.content === '[Removed]';
}

async function fetchNewsForQuery(query: string, fromDate: string, sources: string, pageSize: number, sortBy: string): Promise<NewsArticle[]> {
  const url = new URL('https://newsapi.org/v2/everything');
  url.searchParams.append('q', query);
  url.searchParams.append('apiKey', API_KEY);
  url.searchParams.append('from', fromDate);
  url.searchParams.append('sortBy', sortBy);
  url.searchParams.append('pageSize', pageSize.toString());
  url.searchParams.append('page', '1');
  
  if (sources) {
    url.searchParams.append('sources', sources);
  }

  console.log("url:", url.toString());

  const response = await axios.get(url.toString());
  return response.data.articles.filter((article: NewsArticle) => !isArticleRemoved(article));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queryParam = searchParams.get('query');
  const queries = queryParam ? queryParam.split('|').filter(q => q.trim() !== '') : DEFAULT_QUERY;
  const sources = searchParams.get('sources') || DEFAULT_SOURCES;
  const daysAgo = parseInt(searchParams.get('daysAgo') || DEFAULT_DAYS_AGO.toString(), 10);
  const pageSize = parseInt(searchParams.get('pageSize') || DEFAULT_PAGE_SIZE.toString(), 10);
  const sortBy = searchParams.get('sortBy') || DEFAULT_SORT_BY;

  console.log("queries:", queries);
  console.log("DEFAULT_QUERY:", DEFAULT_QUERY);
  console.log("process.env.DEFAULT_NEWS_QUERY:", process.env.DEFAULT_NEWS_QUERY);


  if (queries.length === 0 || (queries.length === 1 && queries[0] === '')) {
    return NextResponse.json({ message: 'Query parameter is required' }, { status: 400 });
  }

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - daysAgo);
  const fromDateString = fromDate.toISOString().split('T')[0];

  try {
    const allArticles: NewsArticle[] = [];
    const querySizePerKeyword = Math.floor(pageSize / queries.length);

    for (const query of queries) {
      const articles = await fetchNewsForQuery(query, fromDateString, sources, querySizePerKeyword, sortBy);
      allArticles.push(...articles);
    }

    // 去重
    const uniqueArticles = Array.from(new Set(allArticles.map(a => a.url)))
      .map(url => allArticles.find(a => a.url === url));

    // 按发布日期排序
    uniqueArticles.sort((a, b) => new Date(b!.publishedAt).getTime() - new Date(a!.publishedAt).getTime());

    // 限制返回数量
    // const limitedArticles = uniqueArticles.slice(0, pageSize);

    return NextResponse.json({ 
      status: "ok",
      totalResults: uniqueArticles.length,
      articles: uniqueArticles
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ message: 'Error fetching news' }, { status: 500 });
  }
}
