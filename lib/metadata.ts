import { Metadata } from "next";

export function constructMetadata({
  title = "Clippie 5000 - AI-Powered Video Clip Generator",
  description = "Fullstack Software as a Service AI Platform",

  noIndex = false,
}: {
  title?: string;
  description?: string;

  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    applicationName: "Clippie 5000",
    keywords: [
      "AI",
      "OpenAI",
      "replicate",
      "AI Platform",
      "SaaS Application",
      "JavaScript",
      "Video Clips",
      "Clip Generator"
    ],
    authors: { name: "Duarte Dias", url: "" },
    creator: "Duarte Dias",
    // Explicitly set the title tag for better compatibility
    openGraph: {
      title,
      description,
      type: "website",
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
