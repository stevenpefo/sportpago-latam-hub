import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CategoryInputProps {
  value: string;
  onChange: (value: string) => void;
  savedCategories: string[];
  placeholder?: string;
  className?: string;
}

export function CategoryInput({
  value,
  onChange,
  savedCategories,
  placeholder = "Escribe una categoría...",
  className,
}: CategoryInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length > 0) {
      const filtered = savedCategories.filter(cat =>
        cat.toLowerCase().includes(value.toLowerCase()) && 
        cat.toLowerCase() !== value.toLowerCase()
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      // Show all categories when input is empty and focused
      setFilteredSuggestions(savedCategories);
    }
  }, [value, savedCategories]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    if (savedCategories.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSelect = (category: string) => {
    onChange(category);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={cn("min-h-[44px]", className)}
        autoComplete="off"
      />
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.map((category, index) => (
            <button
              key={index}
              type="button"
              className="w-full px-3 py-3 text-left text-sm hover:bg-accent transition-colors min-h-[44px] flex items-center"
              onClick={() => handleSelect(category)}
            >
              {category}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
