import { HeroImage } from '../types/hero';

const PLACEHOLDER_DIMENSIONS = {
  width: 1920,
  height: 1080,
};

export const generatePlaceholderImages = (): HeroImage[] => {
  // Using Lorem Picsum for placeholder images with specific seeds for consistency
  const placeholders: HeroImage[] = [
    {
      url: `https://picsum.photos/seed/rwandan-community-1/${PLACEHOLDER_DIMENSIONS.width}/${PLACEHOLDER_DIMENSIONS.height}`,
      alt: 'Placeholder for Rwandan community gathering',
      caption: 'Community gathering in Rwanda',
    },
    {
      url: `https://picsum.photos/seed/rwandan-education-2/${PLACEHOLDER_DIMENSIONS.width}/${PLACEHOLDER_DIMENSIONS.height}`,
      alt: 'Placeholder for education initiatives',
      caption: 'Education and learning initiatives',
    },
    {
      url: `https://picsum.photos/seed/rwandan-culture-3/${PLACEHOLDER_DIMENSIONS.width}/${PLACEHOLDER_DIMENSIONS.height}`,
      alt: 'Placeholder for cultural activities',
      caption: 'Celebrating Rwandan culture',
    },
    {
      url: `https://picsum.photos/seed/rwandan-tech-4/${PLACEHOLDER_DIMENSIONS.width}/${PLACEHOLDER_DIMENSIONS.height}`,
      alt: 'Placeholder for technology adoption',
      caption: 'Technology and innovation in Rwanda',
    },
  ];

  return placeholders;
};

export const generateSectionHeroImage = (section: string): HeroImage => {
  return {
    url: `https://picsum.photos/seed/rwandan-${section}/${PLACEHOLDER_DIMENSIONS.width}/${PLACEHOLDER_DIMENSIONS.height}`,
    alt: `Placeholder for ${section} section`,
    caption: `${section.charAt(0).toUpperCase() + section.slice(1)} in Rwanda`,
  };
}; 