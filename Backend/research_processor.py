import os
import fitz  # PyMuPDF
import json
from groq import Groq
from datetime import datetime
from typing import Dict, Any, List
import re
from config import API_KEYS
from utils import create_directory

class ResearchProcessor:
    def __init__(self):
        self.groq_client = Groq(api_key=API_KEYS['GROQ'])
        create_directory('assets/extracted_text')
        create_directory('assets/research_data')
        create_directory('assets/summaries')

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF using PyMuPDF"""
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        return text

    def extract_metadata_from_text(self, text: str) -> Dict[str, Any]:
        """Extract basic metadata using regex patterns"""
        metadata = {
            'title': '',
            'authors': [],
            'publication_date': '',
            'journal': '',
            'abstract': ''
        }
        
        # Extract title (often at the beginning)
        title_match = re.search(r'^(.+?)\n(?=[A-Z][a-z]+:)', text, re.MULTILINE)
        if title_match:
            metadata['title'] = title_match.group(1).strip()
        
        # Extract authors (look for patterns like "Author1, A., Author2, B., etc.")
        author_matches = re.findall(r'([A-Z][a-z]+,\s*[A-Z]\.(?:\s*[A-Z]\.)?)', text[:2000])
        if author_matches:
            metadata['authors'] = author_matches
        
        # Extract publication date patterns
        date_patterns = [
            r'(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})',
            r'((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4})',
            r'(\d{4}-\d{2}-\d{2})',
            r'(\d{1,2}/\d{1,2}/\d{4})'
        ]
        
        for pattern in date_patterns:
            date_match = re.search(pattern, text[:3000])
            if date_match:
                metadata['publication_date'] = date_match.group(1)
                break
        
        return metadata

    def analyze_with_groq(self, text: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Use Groq API to analyze the research paper"""
        prompt = f"""
        Analyze this research paper and extract the following information:
        
        1. Title (if not provided: {metadata.get('title', '')})
        2. Authors (if not provided: {', '.join(metadata.get('authors', []))})
        3. Abstract (concise summary of the paper)
        4. Key findings/results
        5. Methodology/approach used
        6. Publication venue (journal, conference, etc.)
        7. Publication date (if not provided: {metadata.get('publication_date', '')})
        8. Region/country of study (if applicable)
        9. Keywords/tags
        10. Citation count/impact (if mentioned)
        
        Provide the response in JSON format with these exact keys:
        title, authors, abstract, key_findings, methodology, publication_venue, 
        publication_date, region, keywords, citation_info
        
        Paper content (first 8000 characters):
        {text[:8000]}
        """
        
        try:
            chat_completion = self.groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="mixtral-8x7b-32768",  # You can use other models like "llama2-70b-4096"
                temperature=0.1,
                max_tokens=4000,
                response_format={"type": "json_object"}
            )
            
            response = chat_completion.choices[0].message.content
            return json.loads(response)
        
        except Exception as e:
            print(f"Error with Groq API: {e}")
            return {}

    def process_research_paper(self, pdf_path: str) -> Dict[str, Any]:
        """Full processing pipeline for a research paper"""
        # Extract text
        text = self.extract_text_from_pdf(pdf_path)
        
        # Save extracted text
        text_filename = os.path.basename(pdf_path).replace('.pdf', '.txt')
        with open(f"assets/extracted_text/{text_filename}", 'w', encoding='utf-8') as f:
            f.write(text)
        
        # Extract basic metadata with regex
        metadata = self.extract_metadata_from_text(text)
        
        # Analyze with Groq
        analysis = self.analyze_with_groq(text, metadata)
        
        # Combine metadata and analysis
        result = {
            "extraction_date": datetime.now().isoformat(),
            "source_file": pdf_path,
            "metadata": metadata,
            "analysis": analysis
        }
        
        # Save results
        result_filename = os.path.basename(pdf_path).replace('.pdf', '_analysis.json')
        with open(f"assets/research_data/{result_filename}", 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2)
        
        return result