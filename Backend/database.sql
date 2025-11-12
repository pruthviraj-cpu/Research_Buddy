
-- 1️⃣ Authors
create table authors (
    author_id serial primary key,
    paper_id integer not null references research_papers_test(paper_id) on delete cascade,
    name varchar(255) not null
);

-- 2️⃣ Keywords
create table Keywords (
    keyword_id serial primary key,
    paper_id integer not null references research_papers_test(paper_id) on delete cascade,
    keywords varchar(100) not null,
    created_at timestamp default current_timestamp
)

-- 3️⃣ Citations
CREATE TABLE Citations (
    citation_id SERIAL PRIMARY KEY,
    citing_paper_id INTEGER NOT NULL REFERENCES Research_papers(paper_id) ON DELETE CASCADE,
    cited_paper_id INTEGER NOT NULL REFERENCES Research_papers(paper_id) ON DELETE CASCADE
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

-- 8️⃣ Trigger concept for insert
CREATE OR REPLACE FUNCTION log_paper_insert() RETURNS trigger AS $$
BEGIN
    INSERT INTO paper_actions(paper_id, paper_title, action, "user")
    VALUES (NEW.paper_id, NEW.title, 'Added', current_user);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER paper_insert_trigger
AFTER INSERT ON research_papers_test
FOR EACH ROW EXECUTE FUNCTION log_paper_insert();
  
-- 9️⃣ Trigger concept for update
CREATE OR REPLACE FUNCTION log_paper_update() RETURNS trigger AS $$
BEGIN
    INSERT INTO paper_actions(paper_id, paper_title, action, "user")
    VALUES (NEW.paper_id, NEW.title, 'Updated', current_user);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER paper_update_trigger
AFTER UPDATE ON research_papers_test
FOR EACH ROW EXECUTE FUNCTION log_paper_update();


-- 🔟 Trigger concept for delete
CREATE OR REPLACE FUNCTION log_paper_delete() RETURNS trigger AS $$
BEGIN
    INSERT INTO paper_actions(paper_id, paper_title, action, "user")
    VALUES (OLD.paper_id, OLD.title, 'Deleted', current_user);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER paper_delete_trigger
AFTER DELETE ON research_papers_test
FOR EACH ROW EXECUTE FUNCTION log_paper_delete();

-- 11 table for paper actions
create table Paper_Action (
    id serial primary key unique,
    paper_id int not null references research_papers_test(paper_id) on delete cascade,
    paper_title varchar(255) not null,
    action varchar(50) not null,
    "user" varchar(100) not null,
    timestamp timestamp default current_timestamp,
    notes TEXT
)