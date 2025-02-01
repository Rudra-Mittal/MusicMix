'use client'

import React, { useState, useEffect, useRef, KeyboardEvent, MutableRefObject } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
// import {initializeSocket} from "../socket"
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io';

interface SearchResult {
  title: string;
  url: string;
  videoId: string;
}

export default function SearchBar({username,socket}: {username: string,socket:MutableRefObject<Socket<DefaultEventsMap, DefaultEventsMap>>}) {
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
      const data = await response.json()
      // @ts-expect-error grtrhgthge
      const res = data.items.slice(0, 10).map((item) => ({
        title: item.title,
        url: item.thumbnail.thumbnails[0].url.startsWith('//') ? `https:${item.thumbnail.thumbnails[0].url}` : item.thumbnail.thumbnails[0].url,
        videoId: item.id,
      }));
      console.log(res);
      setResults(res);
    } catch (error) { 
      console.log(error);
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
      }, 300);
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
      } else if(event.key === 'Enter'){
        handleSearch(query);
      } else if(event.key === '/'){
        event.preventDefault();
        handleSearchIconClick();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    // @ts-expect-error gwrrwg
    document.addEventListener('keydown', handleEscKey );
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // @ts-expect-error rgfrsgwrs
      document.removeEventListener('keydown', handleEscKey );
    };
  }, [query]);

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
    if(results.length){
      setIsOpen(true);
    }
    inputRef.current?.focus();
  };

  const handleCreateStream = (videoId: string) => {
    socket?.current.emit("createStream", {videoId, userName: username});
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    console.log(e.key);
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
    } else if (e.key === 'Enter'){
      e.preventDefault();
      handleSearch(query);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex justify-center items-center w-full"
    >
      <div className={`z-10 relative transition-all duration-300 ease-in-out ${isExpanded ? 'w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl' : 'w-auto'}`}>
        <form onSubmit={handleSubmit} className="flex items-center">
          <div className="relative w-full">
            <Search 
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-white transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}
            />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              onKeyDown={handleKeyDown}
              className={`pl-10 pr-4 py-2 w-full rounded-2xl focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-900 ease-in-out ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 p-0'} dark:bg-black dark:text-white dark:placeholder-gray-300`}
            />
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            className={`rounded-full transition-all duration-300 ease-in-out flex items-center ${isExpanded ? 'w-0 p-0 overflow-hidden' : 'w-auto px-3'} dark:text-white dark:hover:bg-gray-900`}
            onClick={handleSearchIconClick}
          >
            <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-0' : 'opacity-100'}`}>
              Search
            </span>
            <Search className="h-4 w-4 ml-2" />
          </Button>
        </form>
        {isOpen && results.length > 0 && (
          <div ref={dropdownRef} className="absolute left-0 right-0 mt-1 bg-white dark:bg-black border border-gray-300 dark:border-white rounded-md shadow-lg dark:shadow-white/10 max-h-80 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className={`px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer flex items-center ${index === selectedIndex ? 'bg-gray-100 dark:bg-gray-900' : ''}`}
                onClick={() => {
                  handleCreateStream(result.videoId);
                  handleCollapse();
                }}
              >
                <Image
                  src={result.url || "/placeholder.svg"}
                  alt={result.title}
                  width={40}
                  height={30}
                  className="mr-2 rounded"
                />
                <span className="dark:text-white">{result.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

