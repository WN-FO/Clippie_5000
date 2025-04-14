import { ErrorDisplay } from '@/components/ui/error-display';

export default function NotFound() {
  return (
    <ErrorDisplay
      title="404 - Page Not Found"
      message="The page you are looking for doesn't exist or has been moved."
      homeLink={true}
    />
  );
} 