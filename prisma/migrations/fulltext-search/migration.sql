-- Enable pg_trgm extension for trigram matching (similarity search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add a generated tsvector column to Product for full-text search
ALTER TABLE "Product" ADD COLUMN "search_vector" tsvector;

-- Create a GIN index on the search vector for fast full-text search
CREATE INDEX "Product_search_vector_idx" ON "Product" USING GIN("search_vector");

-- Create a GIN index on name and description for trigram similarity search
CREATE INDEX "Product_name_trgm_idx" ON "Product" USING GIN("name" gin_trgm_ops);
CREATE INDEX "Product_description_trgm_idx" ON "Product" USING GIN("description" gin_trgm_ops);

-- Create a function to update the search vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW."search_vector" :=
    setweight(to_tsvector('english', COALESCE(NEW."name", '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW."sku", '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW."description", '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW."shortDescription", '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update search vector on INSERT/UPDATE
CREATE TRIGGER product_search_vector_trigger
  BEFORE INSERT OR UPDATE OF "name", "sku", "description", "shortDescription"
  ON "Product"
  FOR EACH ROW
  EXECUTE FUNCTION update_product_search_vector();

-- Backfill existing products
UPDATE "Product" SET "search_vector" =
  setweight(to_tsvector('english', COALESCE("name", '')), 'A') ||
  setweight(to_tsvector('english', COALESCE("sku", '')), 'A') ||
  setweight(to_tsvector('english', COALESCE("description", '')), 'B') ||
  setweight(to_tsvector('english', COALESCE("shortDescription", '')), 'B');
