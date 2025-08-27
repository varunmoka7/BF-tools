-- Update Company Overviews in Database
-- This script updates the companies table with enhanced overview information
-- Generated from company-overviews-final.json

-- First, let's add some sample company overview updates based on our collected data
-- These are professional, informative descriptions for the companies

-- Update some key companies with their enhanced overviews
UPDATE companies SET 
  description = 'Alstom SA is a major industrial company headquartered in France, with expertise in Railroads. The company operates with 78,684 workforce, providing essential industrial solutions and services to clients across various sectors.',
  business_overview = 'Specializing in Railroads, Alstom SA delivers comprehensive industrial solutions including manufacturing, engineering services, and specialized equipment. The company serves diverse markets with a focus on quality, innovation, and operational excellence.'
WHERE company_name = 'Alstom SA';

UPDATE companies SET 
  description = 'Siemens AG is a major industrial company headquartered in Germany, with expertise in Specialty Industrial Machinery. The company operates with a substantial workforce, providing essential industrial solutions and services to clients across various sectors.',
  business_overview = 'Specializing in Specialty Industrial Machinery, Siemens AG delivers comprehensive industrial solutions including manufacturing, engineering services, and specialized equipment. The company serves diverse markets with a focus on quality, innovation, and operational excellence.'
WHERE company_name = 'Siemens AG';

UPDATE companies SET 
  description = 'BASF SE is a leading materials company based in Germany, specializing in Chemicals. With numerous employees, the company produces essential materials that support various industries and infrastructure development globally.',
  business_overview = 'Active in Chemicals, BASF SE manufactures and supplies high-quality materials to customers worldwide. The company focuses on sustainable production methods and innovative material solutions to meet evolving market demands.'
WHERE company_name = 'BASF SE';

UPDATE companies SET 
  description = 'Nestlé SA is a well-established consumer staples company headquartered in Switzerland, specializing in Packaged Foods. The company employs numerous people in the production and distribution of essential consumer goods.',
  business_overview = 'Operating in Packaged Foods, Nestlé SA provides essential products that consumers use regularly. The company maintains strong supply chains and distribution networks to ensure consistent availability of its products across global markets.'
WHERE company_name = 'Nestle SA';

UPDATE companies SET 
  description = 'BMW AG (Bayerische Motoren Werke AG) is a leading consumer goods company based in Germany, operating in the Auto Manufacturers market. With thousands of employees, the company creates and markets products that enhance consumers daily lives.',
  business_overview = 'Active in the Auto Manufacturers space, BMW AG develops, manufactures, and distributes consumer products to markets worldwide. The company focuses on understanding consumer needs and delivering high-quality products that build lasting brand loyalty.'
WHERE company_name = 'Bayerische Motoren Werke AG';

-- Note: For a complete database update, you would need to process all 325 companies
-- from the company-overviews-final.json file. This can be done with a Node.js script
-- that reads the JSON file and generates UPDATE statements for each company.

-- Example of how to update all companies (template):
-- UPDATE companies SET 
--   description = '[enhanced_overview from JSON]',
--   business_overview = '[business_overview from JSON]'
-- WHERE id = '[company_id from JSON]';

COMMENT ON COLUMN companies.description IS 'Enhanced company description with professional overview';
COMMENT ON COLUMN companies.business_overview IS 'Detailed business overview explaining company operations and focus areas';