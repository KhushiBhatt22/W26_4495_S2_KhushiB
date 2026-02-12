import { Lightbulb, BookOpen, Download, Library, Heart, Users } from "lucide-react";

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
    title: "Build Your Fanbase", // New Social Feature
    description: "Gain followers, manage your author profile, and grow your influence in the creative world.",
    icon: Users,
    gradient: "from-secondary to-primary",
  },
   {
    title: "Go Viral with Stories", // Your new feature polished
    description: "Generate creative stories and AI images that stop the scroll. Share your vision and get the engagement you deserve.",
    icon: Heart, // 'Heart' or 'SquarePlay' both work great here
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