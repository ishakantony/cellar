import { useState } from 'react';
import { GitBranch } from 'lucide-react';
import { Button, Divider, cn } from '@cellar/ui';
export interface SocialLoginSectionProps {
  onGitHubClick?: () => Promise<void>;
  className?: string;
}

export function SocialLoginSection({ onGitHubClick, className }: SocialLoginSectionProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubClick = async () => {
    try {
      setIsLoading(true);
      await onGitHubClick?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('my-6 space-y-4', className)}>
      <Divider text="or" />

      <Button
        variant="secondary"
        loading={isLoading}
        onClick={handleGitHubClick}
        className="w-full"
      >
        <GitBranch className="h-4 w-4" />
        Continue with GitHub
      </Button>
    </div>
  );
}
