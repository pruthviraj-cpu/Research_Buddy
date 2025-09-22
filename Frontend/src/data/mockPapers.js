export const mockDomains = [
  'Computer Science',
  'Physics',
  'Mathematics',
  'Biology',
  'Chemistry',
  'Engineering',
  'Medicine',
  'Psychology'
];

export const mockCategories = [
  'Research Article',
  'Review Paper',
  'Conference Paper',
  'Case Study',
  'Technical Report',
  'Survey Paper',
  'Short Communication',
  'Editorial'
];

export const mockPapers = [
  {
    id: '1',
    title: 'Machine Learning Approaches for Natural Language Processing',
    authors: ['Dr. Sarah Johnson', 'Prof. Michael Chen', 'Dr. Emily Rodriguez'],
    domain: 'Computer Science',
    category: 'Research Article',
    publishDate: '2024-03-15',
    abstract: 'This paper explores various machine learning techniques applied to natural language processing tasks, including sentiment analysis, text classification, and language generation. We present comprehensive experimental results and propose novel architectures for improved performance.',
    keywords: ['Machine Learning', 'NLP', 'Deep Learning', 'Neural Networks'],
    pdfUrl: 'https://example.com/papers/ml-nlp.pdf',
    viewCount: 1247,
    createdAt: '2024-03-15T10:30:00Z',
    updatedAt: '2024-03-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'Quantum Computing Applications in Cryptography',
    authors: ['Prof. David Kim', 'Dr. Lisa Wang'],
    domain: 'Physics',
    category: 'Survey Paper',
    publishDate: '2024-02-28',
    abstract: 'A comprehensive survey of quantum computing applications in modern cryptography, examining both threats and opportunities presented by quantum technologies in securing digital communications.',
    keywords: ['Quantum Computing', 'Cryptography', 'Security', 'Quantum Algorithms'],
    pdfUrl: 'https://example.com/papers/quantum-crypto.pdf',
    viewCount: 892,
    createdAt: '2024-02-28T14:20:00Z',
    updatedAt: '2024-02-28T14:20:00Z'
  },
  {
    id: '3',
    title: 'Advanced Materials for Sustainable Energy Storage',
    authors: ['Dr. Anna Petrova', 'Prof. James Miller', 'Dr. Raj Patel'],
    domain: 'Engineering',
    category: 'Research Article',
    publishDate: '2024-01-20',
    abstract: 'Investigation of novel nanomaterials for next-generation battery technologies, focusing on lithium-sulfur and solid-state battery systems with enhanced energy density and safety profiles.',
    keywords: ['Energy Storage', 'Nanomaterials', 'Batteries', 'Sustainability'],
    pdfUrl: 'https://example.com/papers/energy-materials.pdf',
    viewCount: 1456,
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-20T09:15:00Z'
  },
  {
    id: '4',
    title: 'CRISPR Gene Editing: Recent Advances and Ethical Considerations',
    authors: ['Dr. Maria González', 'Prof. Robert Thompson'],
    domain: 'Biology',
    category: 'Review Paper',
    publishDate: '2024-04-10',
    abstract: 'This review examines the latest developments in CRISPR-Cas9 gene editing technology, discussing technical improvements, therapeutic applications, and the ongoing ethical debates surrounding human genome modification.',
    keywords: ['CRISPR', 'Gene Editing', 'Biotechnology', 'Ethics'],
    pdfUrl: 'https://example.com/papers/crispr-advances.pdf',
    viewCount: 2103,
    createdAt: '2024-04-10T16:45:00Z',
    updatedAt: '2024-04-10T16:45:00Z'
  },
  {
    id: '5',
    title: 'Climate Change Impact on Ocean Acidification',
    authors: ['Prof. Ocean Williams', 'Dr. Climate Chen'],
    domain: 'Chemistry',
    category: 'Research Article',
    publishDate: '2024-05-05',
    abstract: 'Comprehensive analysis of how increasing atmospheric CO2 levels affect ocean chemistry, marine ecosystems, and global carbon cycles.',
    keywords: ['Climate Change', 'Ocean Chemistry', 'Marine Biology', 'Environmental Science'],
    pdfUrl: 'https://example.com/papers/ocean-acidification.pdf',
    viewCount: 756,
    createdAt: '2024-05-05T11:30:00Z',
    updatedAt: '2024-05-05T11:30:00Z'
  }
];

export const mockStats = {
  totalPapers: mockPapers.length,
  totalViews: mockPapers.reduce((sum, paper) => sum + paper.viewCount, 0),
  totalDomains: mockDomains.length,
  totalCategories: mockCategories.length,
  recentPapers: 3,
  monthlyGrowth: 15.2
};
