import { Lightbulb, BookOpen, Download, Library, SquarePlay } from "lucide-react";

export const FEATURES = [
  {
    title: "AI-Powered Writing",
    description:
      "Overcome writer's block with our smart assistant that helps you generate ideas, outlines, and content.",
    icon: Lightbulb,
    // Using Fuchsia to Orange (The classic Insta vibe)
    gradient: "from-primary to-secondary",
  },
  {
    title: "Immersive Reader",
    description:
      "Preview your ebook in a clean, read-only format. Adjust font sizes for a comfortable reading experience before you export.",
    icon: BookOpen,
    // Using Orange to Indigo (Sunsets)
    gradient: "from-secondary to-accent",
  },
  {
    title: "One-Click Export",
    description:
      "Export your ebook to PDF, and DOCX formats instantly, ready for publishing",
    icon: Download,
    // Using Indigo to Fuchsia (Cooler pastels)
    gradient: "from-accent to-primary",
  },
  {
    title: "eBook Management",
    description:
      "Organize all your ebook projects in a personal dashboard. Easily track progress, edit drafts, and manage your library.",
    icon: Library,
    // Triple blend for variety
    gradient: "from-primary via-accent to-secondary",
  },
   {
    title: "Create and share story",
    description:
      "Generate fun and creative story with our powerful AI. At this platform you can share your stories and generate fun images.",
    icon: SquarePlay,
    // Triple blend for variety
    gradient: "from-primary via-accent to-secondary",
  },
];

export const TESTIMONIALS = [
  /* Keep testimonials as they are */
  {
    quote: 'This platform made it so easy to write and publish my first ebook. The AI assistant is a game-changer!',
    author: 'Debie jon',
    title: 'Bestselling Author',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5,
  },
  {
    quote: 'I love the customizable templates in both Ebook and stories creation. I was able to be creative and share my talent in this social platform!',
    author: 'John Smith',
    title: 'Marketing Expert',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    rating: 5,
  },
  {
    quote: 'The one-click export feature saved me so much time. I was able to publish my ebook on multiple platforms in minutes.',
    author: 'Peter Jones',
    title: 'Indie Publisher',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    rating: 5,
  },
];