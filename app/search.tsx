// pages/search.tsx
import { useState } from 'react';
import axios from 'axios';

interface Article {
  title: string;
  description: string;
  url: string;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [news, setNews] = useState<Article[]>([]);
  const [selectedNews, setSelectedNews] = useState<Article[]>([]);

  const searchNews = async () => {
    try {
      const response = await axios.get(`/api/news?query=${query}`);
      setNews(response.data.articles);
    } catch (error) {
      console.error('Error fetching news', error);
    }
  };

  const handleSelect = (article: Article) => {
    setSelectedNews((prevSelected) => {
      if (prevSelected.includes(article)) {
        return prevSelected.filter((item) => item !== article);
      } else {
        return [...prevSelected, article];
      }
    });
  };

  const handleSubmit = () => {
    console.log('Selected news:', selectedNews);
    // 在此处处理提交选中的新闻，例如进行进一步分类或生成图片
  };

  return (
    <div>
      <h1>Search AI News</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter search term"
      />
      <button onClick={searchNews}>Search</button>
      <div>
        {news.map((article, index) => (
          <div key={index}>
            <h2>{article.title}</h2>
            <p>{article.description}</p>
            <a href={article.url} target="_blank" rel="noopener noreferrer">Read more</a>
            <input
              type="checkbox"
              checked={selectedNews.includes(article)}
              onChange={() => handleSelect(article)}
            />
          </div>
        ))}
      </div>
      <button onClick={handleSubmit}>Submit Selected News</button>
    </div>
  );
}
