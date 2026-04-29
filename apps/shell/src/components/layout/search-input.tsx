import { Search } from 'lucide-react';
import { Input } from '@cellar/ui';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Quick search...',
  className,
  disabled = false,
}: SearchInputProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(value);
  }

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline pointer-events-none z-10" />
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-80 pl-10 ${className}`}
      />
    </form>
  );
}
