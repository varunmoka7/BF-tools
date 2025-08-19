-- Migration: Add Coordinates to Companies Table
-- Date: 2024-01-XX
-- Description: Add latitude and longitude coordinates to companies table for mapping functionality

-- Step 1: Add coordinates columns to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- Step 2: Create index for coordinate-based queries
CREATE INDEX IF NOT EXISTS idx_companies_coordinates ON companies(latitude, longitude);

-- Step 3: Update existing companies with mock coordinates based on country
-- This provides reasonable default locations for existing data
UPDATE companies 
SET 
  latitude = CASE 
    WHEN country = 'USA' THEN 39.8283
    WHEN country = 'Germany' THEN 51.1657
    WHEN country = 'Japan' THEN 36.2048
    WHEN country = 'UK' THEN 55.3781
    WHEN country = 'France' THEN 46.2276
    WHEN country = 'Canada' THEN 56.1304
    WHEN country = 'Australia' THEN -25.2744
    WHEN country = 'China' THEN 35.8617
    WHEN country = 'India' THEN 20.5937
    WHEN country = 'Brazil' THEN -14.2350
    ELSE 0.0
  END,
  longitude = CASE 
    WHEN country = 'USA' THEN -98.5795
    WHEN country = 'Germany' THEN 10.4515
    WHEN country = 'Japan' THEN 138.2529
    WHEN country = 'UK' THEN -3.4360
    WHEN country = 'France' THEN 2.2137
    WHEN country = 'Canada' THEN -106.3468
    WHEN country = 'Australia' THEN 133.7751
    WHEN country = 'China' THEN 104.1954
    WHEN country = 'India' THEN 78.9629
    WHEN country = 'Brazil' THEN -51.9253
    ELSE 0.0
  END
WHERE latitude IS NULL OR longitude IS NULL;

-- Step 4: Add constraint to ensure coordinates are within valid ranges
ALTER TABLE companies 
ADD CONSTRAINT chk_latitude CHECK (latitude >= -90 AND latitude <= 90),
ADD CONSTRAINT chk_longitude CHECK (longitude >= -180 AND longitude <= 180);

-- Step 5: Create a view for companies with coordinates
CREATE OR REPLACE VIEW companies_with_coordinates AS
SELECT 
  c.*,
  COALESCE(c.latitude, 0.0) as lat,
  COALESCE(c.longitude, 0.0) as lng,
  CASE 
    WHEN c.latitude IS NOT NULL AND c.longitude IS NOT NULL THEN true
    ELSE false
  END as has_coordinates
FROM companies c;

-- Step 6: Create a function to get companies with coordinates
CREATE OR REPLACE FUNCTION get_companies_with_coordinates(
  p_country TEXT DEFAULT NULL,
  p_sector TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  company_name TEXT,
  country TEXT,
  sector TEXT,
  industry TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  coordinates JSONB,
  employees INTEGER,
  year_of_disclosure INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.company_name,
    c.country,
    c.sector,
    c.industry,
    c.latitude,
    c.longitude,
    CASE 
      WHEN c.latitude IS NOT NULL AND c.longitude IS NOT NULL THEN
        jsonb_build_object('lat', c.latitude, 'lng', c.longitude)
      ELSE
        jsonb_build_object('lat', 0.0, 'lng', 0.0)
    END as coordinates,
    c.employees,
    c.year_of_disclosure
  FROM companies c
  WHERE (p_country IS NULL OR c.country = p_country)
    AND (p_sector IS NULL OR c.sector = p_sector)
  ORDER BY c.company_name
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
