export const SCORING_CRITERIA = {
  workExperience: {
    weight: 25,
    calculate: (value: any) => {
      if (value === "Yes" || value === "Yego") return 25;
      if (value === "No" || value === "Oya") return 5;
      return 0;
    }
  },
  yearsExperience: {
    weight: 20,
    calculate: (value: string) => {
      const scores: Record<string, number> = {
        "Less than 1 year": 5,
        "1-2 years": 10,
        "3-5 years": 15,
        "More than 5 years": 20,
        "Munsi y'umwaka 1": 5,
        "Imyaka 1-2": 10,
        "Imyaka 3-5": 15,
        "Hejuru y'imyaka 5": 20
      };
      return scores[value] || 0;
    }
  },
  education: {
    weight: 15,
    calculate: (value: string) => {
      const scores: Record<string, number> = {
        "Primary": 5,
        "Secondary": 10,
        "University": 15,
        "Amashuri abanza": 5,
        "Amashuri yisumbuye": 10,
        "Kaminuza": 15
      };
      return scores[value] || 0;
    }
  },
  digitalLiteracy: {
    weight: 15,
    calculate: (value: string) => {
      const scores: Record<string, number> = {
        "Basic": 5,
        "Intermediate": 10,
        "Advanced": 15,
        "Ibanze": 5,
        "Hagati": 10,
        "Hejuru": 15
      };
      return scores[value] || 0;
    }
  },
  availability: {
    weight: 15,
    calculate: (value: string) => {
      const scores: Record<string, number> = {
        "Full-time": 15,
        "Part-time": 10,
        "Weekends only": 5,
        "Igihe cyose": 15,
        "Igice cy'igihe": 10,
        "Impera z'icyumweru": 5
      };
      return scores[value] || 0;
    }
  },
  motivation: {
    weight: 10,
    calculate: (text: string) => {
      if (!text) return 0;
      const words = text.split(/\s+/).length;
      return Math.min(Math.floor(words / 20) * 2, 10);
    }
  }
}; 