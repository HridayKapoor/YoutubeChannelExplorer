import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SearchInput({ 
  placeholder, 
  value, 
  onChange, 
  className = "" 
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);
  
  // Update the internal value when the external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);
  
  // Debounce the onChange event
  useEffect(() => {
    const timer = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [internalValue, onChange, value]);
  
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-9 w-full"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
      />
    </div>
  );
}
