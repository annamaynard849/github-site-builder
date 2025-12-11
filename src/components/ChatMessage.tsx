import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: string;
  isUser?: boolean;
  className?: string;
}

export const ChatMessage = ({ message, isUser = false, className }: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start",
      className
    )}>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
        isUser 
          ? "bg-primary text-primary-foreground rounded-br-md" 
          : "bg-card text-card-foreground rounded-bl-md border"
      )}>
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
};