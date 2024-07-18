import { useState } from 'react';
import { Box, Button, Input, Textarea, VStack, HStack, Heading, Text, Image } from '@chakra-ui/react';
import axios from 'axios';

interface Article {
  title: string;
  description: string;
  url: string;
}

export default function Debug() {
  const [query, setQuery] = useState('');
  const [news, setNews] = useState<Article[]>([]);
  const [markdown, setMarkdown] = useState('');
  const [imageUrl, setImageUrl] = useState('');

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
    <Box p={5}>
      <Heading mb={5}>Debug Page</Heading>
      <VStack spacing={5}>
        <Box w="100%">
          <Heading size="md">Search AI News</Heading>
          <HStack spacing={3} mt={3}>
            <Input
              placeholder="Enter search term"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button onClick={searchNews}>Search</Button>
          </HStack>
          <VStack spacing={3} mt={3}>
            {news.map((article, index) => (
              <Box key={index} borderWidth="1px" borderRadius="lg" p={3} w="100%">
                <Text fontWeight="bold">{article.title}</Text>
                <Text>{article.description}</Text>
                <Button as="a" href={article.url} target="_blank" mt={2} colorScheme="teal">
                  Read more
                </Button>
              </Box>
            ))}
          </VStack>
        </Box>

        <Box w="100%">
          <Heading size="md">Generate Image from Markdown</Heading>
          <Textarea
            placeholder="Enter your markdown here"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            mt={3}
          />
          <Button onClick={generateImage} mt={3}>Generate Image</Button>
          {imageUrl && (
            <Box mt={3}>
              <Image src={imageUrl} alt="Generated from markdown" />
            </Box>
          )}
        </Box>
      </VStack>
    </Box>
  );
}
