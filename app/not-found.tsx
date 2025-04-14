import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-xl text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Link 
        href="/"
        className="underline text-primary hover:text-primary/80 transition"
      >
        Return Home
      </Link>
    </div>
  );
} 