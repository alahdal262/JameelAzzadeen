
export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  views: string;
  date: string;
}

export interface Tweet {
  id: string;
  content: string;
  date: string;
  likes: number;
  retweets: number;
}

export interface Post {
  id: string;
  content: string;
  image?: string;
  date: string;
  platform: 'facebook' | 'twitter' | 'instagram';
}

export interface Testimonial {
  id: string | number;
  author?: string;
  role?: string;
  content?: string; // Text content
  src?: string; // Image URL or Base64
  type: 'image' | 'text' | 'mixed';
}

export interface CareerMoment {
  id: string | number;
  src: string;
  label: string; // Description text
  year: string;  // Category or Year tag
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
  category: string;
}

export interface GalleryImage {
  id: string | number;
  src: string;
  date: string;
}

export type AppView = 'home' | 'articles' | 'login' | 'dashboard' | 'notfound';

export enum Section {
  HOME = 'home',
  ABOUT = 'about',
  VIDEOS = 'videos',
  GALLERY = 'gallery',
  TWITTER = 'twitter',
  FACEBOOK = 'facebook',
  TESTIMONIALS = 'testimonials',
  CONTACT = 'contact'
}
