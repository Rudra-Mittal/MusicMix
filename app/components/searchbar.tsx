'use client'

import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import {socket} from "../socket"
interface SearchResult {
  title: string;
  url: string;
  videoId: string;
}

export default function SearchBar({username}: {username: string}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const currentRequest = useRef<AbortController | null>(null);

  const handleSearch = async (query: string) => {
    if (currentRequest.current) {
      currentRequest.current.abort();
    }
    const controller = new AbortController();
    currentRequest.current = controller;

    try {
      const response = await fetch(`/api/search?q=${query}`, { signal: controller.signal });
      const data = await response.json();
      const res = data.items.slice(0, 10).map((item: any) => ({
        title: item.title,
        url: item.thumbnail.thumbnails[0].url.startsWith('//') ? `https:${item.thumbnail.thumbnails[0].url}` : item.thumbnail.thumbnails[0].url,
        videoId: item.id,
      }));
      setResults(res);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Search error:', error);
      }
    }
  };

  useEffect(() => {
    if (query.length > 0) {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        handleSearch(query);
        setIsOpen(true);
        setIsExpanded(true);
      }, 400);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleCollapse();
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCollapse();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey as any);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey as any);
    };
  }, []);

  const handleCollapse = () => {
    setIsOpen(false);
    setIsExpanded(false);
    setSelectedIndex(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < results.length) {
      setQuery(results[selectedIndex].title);
      handleCollapse();
    } else {
      handleSearch(query);
    }
  };

  const handleSearchIconClick = () => {
    setIsExpanded(true);
    inputRef.current?.focus();
  };
  const handleCreateStream = (videoId: string) => {
    socket.emit("createStream",{videoId,userName:username});
  }
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleCollapse();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleCreateStream(results[selectedIndex].videoId);
      handleCollapse();
    } else if (e.key==='Enter'){
      e.preventDefault();
      handleSearch(query);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex justify-center items-center w-full"
    >
      <div className={`relative transition-all duration-300 ease-in-out ${isExpanded ? 'w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl' : 'w-auto'}`}>
        <form onSubmit={handleSubmit} className="flex items-center">
          <div className="relative w-full">
            <Search 
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}
            />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              onKeyDown={handleKeyDown}
              className={`pl-10 pr-4 py-2 w-full rounded-2xl focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 p-0'}`}
            />
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            className={`rounded-full transition-all duration-300 ease-in-out flex items-center ${isExpanded ? 'w-0 p-0 overflow-hidden' : 'w-auto px-3'}`}
            onClick={handleSearchIconClick}
          >
            <Search className="h-4 w-4 mr-2" />
            <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-0' : 'opacity-100'}`}>
              Search
            </span>
          </Button>
        </form>
        {isOpen && results.length > 0 && (
          <div ref={dropdownRef} className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${index === selectedIndex ? 'bg-gray-100' : ''}`}
                onClick={() => {
                  handleCreateStream(result.videoId);
                  handleCollapse();
                }}
              >
                <Image
                  src={result.url}
                  alt={result.title}
                  width={40}
                  height={30}
                  className="mr-2 rounded"
                />
                <span>{result.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

