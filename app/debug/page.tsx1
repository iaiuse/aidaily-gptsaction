"use client";

import React, { useState } from 'react';
import axios from 'axios';

interface Article {
  title: string;
  description: string;
  url: string;
}

const Debug: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [news, setNews] = useState<Article[]>([]);
  const [markdown, setMarkdown] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  const searchNews = async () => {
    try {
      const response = await axios.get(`/api/news?query=${query}`);
      setNews(response.data.articles);
    } catch (error) {
      console.error('Error fetching news', error);
    }
  };

  const generateImage = async () => {
    try {
      const response = await axios.post('/api/generate-image', { markdown });
      setImageUrl(response.data.imageUrl);
    } catch (error) {
      console.error('Error generating image', error);
    }
  };
  
  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-5">Debug Page</h1>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold mb-3">Search AI News</h2>
          <div className="flex space-x-3 mb-3">
            <input
              type="text"
              placeholder="Enter search term"
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              className="flex-grow px-3 py-2 border rounded"
            />
            <button onClick={searchNews} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Search
            </button>
          </div>
          <div className="space-y-3">
            {news.map((article, index) => (
              <div key={index} className="border rounded p-3">
                <h3 className="font-bold">{article.title}</h3>
                <p className="mt-1">{article.description}</p>
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block mt-2 text-blue-500 hover:underline"
                >
                  Read more
                </a>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-3">Generate Image from Markdown</h2>
          <textarea
            placeholder="Enter your markdown here"
            value={markdown}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMarkdown(e.target.value)}
            className="w-full h-32 p-2 border rounded mb-3"
          />
          <button 
            onClick={generateImage} 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Generate Image
          </button>
          {imageUrl && (
            <div className="mt-3">
              <img src={imageUrl} alt="Generated from markdown" className="max-w-full h-auto" />
            </div>
          )}
        </div>
      </div> 
    </div>
  );
};

export default Debug;