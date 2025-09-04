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
        api_key = os.getenv('GROQ_API_KEY')
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

    def analyze_with_groq(self, text: str) -> Dict[str, Any]:
        """Use Groq API to analyze the research paper"""
        prompt = f"""
        Analyze this research paper and extract the following information in JSON format:
        
        Required fields:
        1. title (string)
        2. abstract (string - concise summary)
        3. summary (string - brief content summary)
        4. publication_date (string - date of publication in YYYY-MM-DD format if possible)
        5. authors (array of strings)
        6. publication_venue (string - journal, conference, etc.)
        7. region (string - country/region of study)
        8. keywords (array of strings)
        
        Return ONLY valid JSON with these exact keys. Do not include any additional text.
        
        Paper content (first 12000 characters):
        {text[:12000]}
        """
        
        try:
            chat_completion = self.groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="mixtral-8x7b-32768",
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