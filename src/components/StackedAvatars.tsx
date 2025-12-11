import { UserAvatar } from './UserAvatar';
import { Users } from 'lucide-react';

interface StackedAvatarsProps {
  users: Array<{
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url?: string | null;
  }>;
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const StackedAvatars = ({ 
  users, 
  maxVisible = 4, 
  size = 'md' 
}: StackedAvatarsProps) => {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const borderSizes = {
    sm: 'border-2',
    md: 'border-2',
    lg: 'border-3'
  };

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visibleUsers.map((user, index) => (
          <div
            key={user.id}
            className={`relative ${borderSizes[size]} border-background rounded-full transition-transform hover:scale-110 hover:z-10`}
            style={{ zIndex: visibleUsers.length - index }}
          >
            <UserAvatar
              avatarUrl={user.avatar_url}
              firstName={user.first_name}
              lastName={user.last_name}
              size={size}
              className="transition-all duration-200"
            />
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div
            className={`${sizeClasses[size]} ${borderSizes[size]} border-background bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-medium transition-transform hover:scale-110 hover:z-10`}
            style={{ zIndex: 0 }}
          >
            +{remainingCount}
          </div>
        )}
      </div>
      
      {users.length === 0 && (
        <div className={`${sizeClasses[size]} bg-muted text-muted-foreground rounded-full flex items-center justify-center`}>
          <Users className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};