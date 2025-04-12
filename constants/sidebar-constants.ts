import {
  LayoutDashboard,
  Upload,
  Video,
  Scissors,
  FileText,
  Download,
  Settings,
} from "lucide-react";

export const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Upload",
    icon: Upload,
    href: "/upload",
    color: "text-violet-500",
  },
  {
    label: "My Videos",
    icon: Video,
    color: "text-pink-700",
    href: "/videos",
  },
  {
    label: "Create Clips",
    icon: Scissors,
    color: "text-orange-700",
    href: "/process",
  },
  {
    label: "Transcription",
    icon: FileText,
    color: "text-emerald-500",
    href: "/transcription",
  },
  {
    label: "My Clips",
    icon: Download,
    color: "text-green-600",
    href: "/clips",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];
