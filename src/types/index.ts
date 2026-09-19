export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
  isPrivate?: boolean;
  /** Draw a diagram instead of a screenshot (private projects). */
  diagram?: 'crag';
  /** Short facts shown as chips on featured cards. */
  highlights?: string[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string[];
}

export interface Skill {
  name: string;
  level: number;
  category: 'programming' | 'ai' | 'data' | 'iot';
}