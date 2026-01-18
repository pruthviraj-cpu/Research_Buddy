import os
import fitz  # PyMuPDF
import json
import re
from groq import Groq
from datetime import datetime
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

class ResearchProcessor:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")
        self.groq_client = Groq(api_key=api_key)
        
    def extract_text_from_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF content"""
        try:
            doc = fitz.open(stream=file_content, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            return text
        except Exception as e:
            raise Exception(f"PDF extraction failed: {str(e)}")
        
    def validate_research_paper(self, text: str) -> bool:
        """Validate if the PDF content appears to be a research paper"""
        # Check for common research paper indicators
        indicators = [
            r'abstract', r'introduction', r'methodology', r'results', 
            r'discussion', r'conclusion', r'references', r'keywords',
            r'doi:', r'issn', r'volume', r'issue', r'journal',
            r'conference', r'proceedings', r'peer-reviewed'
        ]
        
        text_lower = text.lower()
        matches = [indicator for indicator in indicators if re.search(indicator, text_lower)]
        
        # Count sections typically found in research papers
        sections = ['abstract', 'introduction', 'method', 'results', 'conclusion', 'references']
        section_count = sum(1 for section in sections if re.search(f'\\b{section}\\b', text_lower))
        
        # Also check for academic content indicators
        academic_indicators = [
            r'\d+\.\s+references',  # References section
            r'corresponding author', 
            r'email:', 
            r'university',
            r'institute',
            r'fig\.',  # Figure references
            r'table\s+\d+'  # Table references
        ]
        
        academic_matches = [indicator for indicator in academic_indicators if re.search(indicator, text_lower)]
        
        # Basic validation logic
        if len(matches) >= 3 or (len(matches) >= 2 and section_count >= 2):
            return True
        
        # Check for academic structure
        if len(academic_matches) >= 2 and section_count >= 1:
            return True
        
        # Fallback: Use AI to validate if needed
        return self.validate_with_ai(text)
    

    def validate_with_ai(self, text: str) -> bool:
        """Use AI to validate if content is a research paper"""
        prompt = f"""
        Analyze the following text and determine if it appears to be a research paper.
        Return ONLY "true" or "false" with no additional text.
        
        Consider if it has:
        1. Academic structure (abstract, introduction, methodology, etc.)
        2. Academic content (references, citations, academic language)
        3. Research focus (presents research questions, findings, analysis)
        
        Text sample (first 5000 characters):
        {text[:5000]}
        
        Is this a research paper? Answer only "true" or "false":
        """
        
        try:
            chat_completion = self.groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                temperature=0.1,
                max_tokens=10
            )
            
            response = chat_completion.choices[0].message.content.strip().lower()
            return response == "true"
        except Exception:
            # If AI validation fails, return False for safety
            return False

    def analyze_with_groq(self, text: str) -> Dict[str, Any]:
        """Use Groq API to analyze the research paper"""
        prompt = f"""
        Analyze this research paper and extract the following information in JSON format provide .:
        
        Required fields:
        1. title (string)
        2. abstract (string -  same summary copy directly from paper)
        3. summary (string - brief content summary in detailed manner and more contextual information 2 paragraphs minimum)
        4. publication_date (string - date of publication in YYYY-MM-DD format if possible)
        5. authors (array of strings)
        8. keywords (array of strings)
        9. domain (string - research domain/field)
        10. category (string - paper category/type)
        
        Return ONLY valid JSON with these exact keys. Do not include any additional text.
        
        Paper content (first 12000 characters):
        {text[:12000]}
        """
        
        try:
            chat_completion = self.groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                temperature=0.1,
                max_tokens=4000,
                response_format={"type": "json_object"}
            )
            
            response = chat_completion.choices[0].message.content
            return json.loads(response)
        
        except Exception as e:
            raise Exception(f"Groq API error: {str(e)}")

    def process_research_paper(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """Full processing pipeline for a research paper"""
        # Extract text
        text = self.extract_text_from_pdf(file_content)
        
        # Analyze with Groq
        analysis = self.analyze_with_groq(text)
        
        # Create result with metadata
        result = {
            "processing_date": datetime.now().isoformat(),
            "original_filename": filename,
            "text_extract_length": len(text),
            **analysis  # Unpack all analysis fields
        }
        
        return result