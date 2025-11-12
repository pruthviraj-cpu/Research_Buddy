
-- 1️⃣ Authors
CREATE TABLE Authors (
    author_id SERIAL PRIMARY KEY,
    paper_id INTEGER NOT NULL REFERENCES Research_papers(paper_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL
);

-- 2️⃣ Keywords
CREATE TABLE Keywords (
    keyword_id SERIAL PRIMARY KEY,
    paper_id INTEGER NOT NULL REFERENCES Research_papers(paper_id) ON DELETE CASCADE,
    keywords VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3️⃣ Citations
CREATE TABLE Citations (
    citation_id SERIAL PRIMARY KEY,
    citing_paper_id INTEGER NOT NULL REFERENCES Research_papers(paper_id) ON DELETE CASCADE,
    cited_paper_id INTEGER NOT NULL REFERENCES Research_papers(paper_id) ON DELETE CASCADE
);

-- 4️⃣ User Activity (Admin or Super User only)
CREATE TABLE User_Activity (
    activity_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    paper_id INTEGER NOT NULL REFERENCES Research_papers(paper_id) ON DELETE CASCADE,
    action_type VARCHAR(50) CHECK (action_type IN ('upload', 'update', 'save', 'delete')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5️⃣ Publications
CREATE TABLE Publications (
    pub_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('Journal', 'Conference')),
    location VARCHAR(150),
    date DATE
);

-- 6️⃣ Paper_Publications (Many-to-Many between papers and publications)
CREATE TABLE Paper_Publications (
    id SERIAL PRIMARY KEY,
    paper_id INTEGER NOT NULL REFERENCES Research_papers(paper_id) ON DELETE CASCADE,
    pub_id INTEGER NOT NULL REFERENCES Publications(pub_id) ON DELETE CASCADE
);

-- 7️⃣ Reviews
CREATE TABLE Reviews (
    review_id SERIAL PRIMARY KEY,
    paper_id INTEGER NOT NULL REFERENCES Research_papers(paper_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL, -- super user or admin
    review_text TEXT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);