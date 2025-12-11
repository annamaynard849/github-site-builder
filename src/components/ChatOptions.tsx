import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatOptionsProps {
  options: string[];
  onSelect: (option: string) => void;
  selectedOption?: string;
  className?: string;
}

export const ChatOptions = ({ options, onSelect, selectedOption, className }: ChatOptionsProps) => {
  return (
    <div className={cn("flex flex-wrap gap-2 mb-6", className)}>
      {options.map((option, index) => (
        <Button
          key={index}
          variant={selectedOption === option ? "default" : "outline"}
          onClick={() => onSelect(option)}
          className="rounded-full text-sm"
          size="sm"
        >
          {option}
        </Button>
      ))}
    </div>
  );
};