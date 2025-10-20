const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ''

export const HERO_IMAGES = {
  // Main landing page hero images
  landing: [
    {
      id: 'dcc-training',
      path: `https://www.Gemurai.rw/storage/sliddesphotos/9BpqGGazg0Jfz5VK4RtQqvpQiUIYtUgfL9BWiTaO.jpg`,
      alt: 'Digital Community Champions in training session',
      overlayColor: 'from-primary/90',
    },
    {
      id: 'health-outreach',
      path: `${BASE_URL}/images/hero/health-outreach.jpg`,
      alt: 'Community health workers conducting outreach',
      overlayColor: 'from-blue-900/90',
    },
    {
      id: 'tech-education',
      path: `${BASE_URL}/images/hero/tech-education.jpg`,
      alt: 'Technology education in rural community',
      overlayColor: 'from-green-900/90',
    },
    {
      id: 'community-innovation',
      path: `${BASE_URL}/images/hero/community-innovation.jpg`,
      alt: 'Community members collaborating on digital solutions',
      overlayColor: 'from-purple-900/90',
    }
  ],

  // Section-specific hero images
  sections: {
    about: {
      path: `${BASE_URL}/images/hero/about-hero.jpg`,
      alt: 'Gemurai team members working with community',
      overlayColor: 'from-blue-900/90',
    },
    learning: {
      path: `${BASE_URL}/images/hero/learning-hero.jpg`,
      alt: 'Digital skills training session',
      overlayColor: 'from-purple-900/90',
    },
    jobs: {
      path: `${BASE_URL}/images/hero/jobs-hero.jpg`,
      alt: 'Digital Community Champions at work',
      overlayColor: 'from-green-900/90',
    }
  }
}