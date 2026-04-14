-- Add tsvector column
ALTER TABLE "Asset" ADD COLUMN "searchVector" tsvector;

-- Create GIN index
CREATE INDEX "Asset_searchVector_idx" ON "Asset" USING GIN ("searchVector");

-- Create trigger function
CREATE OR REPLACE FUNCTION asset_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('english', coalesce(NEW."title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW."content", '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW."description", '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER asset_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "Asset"
  FOR EACH ROW
  EXECUTE FUNCTION asset_search_vector_update();
