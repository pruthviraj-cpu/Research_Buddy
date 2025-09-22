import { mockPapers, mockStats, mockDomains, mockCategories } from '../data/mockPapers.js';

const STORAGE_KEYS = {
  PAPERS: 'research_papers',
  STATS: 'research_stats'
};

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize localStorage with mock data if not exists
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PAPERS)) {
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(mockPapers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STATS)) {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(mockStats));
  }
};

// Get papers from localStorage
const getPapersFromStorage = () => {
  initializeStorage();
  const papers = localStorage.getItem(STORAGE_KEYS.PAPERS);
  return papers ? JSON.parse(papers) : [];
};

// Save papers to localStorage
const savePapersToStorage = (papers) => {
  localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(papers));
  updateStats();
};

// Update statistics
const updateStats = () => {
  const papers = getPapersFromStorage();
  const stats = {
    totalPapers: papers.length,
    totalViews: papers.reduce((sum, paper) => sum + paper.viewCount, 0),
    totalDomains: mockDomains.length,
    totalCategories: mockCategories.length,
    recentPapers: papers.filter(paper => {
      const paperDate = new Date(paper.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return paperDate > weekAgo;
    }).length,
    monthlyGrowth: Math.floor(Math.random() * 20) + 5 // Simulate growth
  };
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
};

export const paperService = {
  // Get all papers with optional filters
  getAllPapers: async (filters = {}) => {
    await delay();
    let papers = getPapersFromStorage();
    
    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      papers = papers.filter(paper => 
        paper.title.toLowerCase().includes(searchTerm) ||
        paper.authors.some(author => author.toLowerCase().includes(searchTerm)) ||
        paper.abstract.toLowerCase().includes(searchTerm) ||
        paper.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
      );
    }
    
    if (filters.domain && filters.domain !== 'all') {
      papers = papers.filter(paper => paper.domain === filters.domain);
    }
    
    if (filters.category && filters.category !== 'all') {
      papers = papers.filter(paper => paper.category === filters.category);
    }
    
    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      papers: papers.slice(startIndex, endIndex),
      totalCount: papers.length,
      totalPages: Math.ceil(papers.length / limit),
      currentPage: page
    };
  },

  // Get paper by ID
  getPaperById: async (id) => {
    await delay(200);
    const papers = getPapersFromStorage();
    return papers.find(paper => paper.id === id);
  },

  // Add new paper
  addPaper: async (paperData) => {
    await delay();
    const papers = getPapersFromStorage();
    const newPaper = {
      id: Date.now().toString(),
      ...paperData,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    papers.unshift(newPaper);
    savePapersToStorage(papers);
    return newPaper;
  },

  // Update paper
  updatePaper: async (id, updateData) => {
    await delay();
    const papers = getPapersFromStorage();
    const index = papers.findIndex(paper => paper.id === id);
    
    if (index !== -1) {
      papers[index] = {
        ...papers[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      savePapersToStorage(papers);
      return papers[index];
    }
    throw new Error('Paper not found');
  },

  // Delete paper
  deletePaper: async (id) => {
    await delay();
    const papers = getPapersFromStorage();
    const filteredPapers = papers.filter(paper => paper.id !== id);
    
    if (filteredPapers.length === papers.length) {
      throw new Error('Paper not found');
    }
    
    savePapersToStorage(filteredPapers);
    return true;
  },

  // Increment view count
  incrementViewCount: async (id) => {
    await delay(100);
    const papers = getPapersFromStorage();
    const paper = papers.find(p => p.id === id);
    
    if (paper) {
      paper.viewCount += 1;
      savePapersToStorage(papers);
      return paper;
    }
    throw new Error('Paper not found');
  },

  // Get statistics
  getStatistics: async () => {
    await delay(200);
    updateStats();
    const stats = localStorage.getItem(STORAGE_KEYS.STATS);
    return stats ? JSON.parse(stats) : mockStats;
  },

  // Get domains
  getDomains: async () => {
    await delay(100);
    return mockDomains;
  },

  // Get categories
  getCategories: async () => {
    await delay(100);
    return mockCategories;
  },

  // Get recent papers
  getRecentPapers: async (limit = 5) => {
    await delay(200);
    const papers = getPapersFromStorage();
    return papers
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }
};
