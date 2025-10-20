-- Add applications.evaluate permission to all EMPLOYER users
UPDATE users 
SET permissions = array_append(permissions, 'applications.evaluate')
WHERE role = 'EMPLOYER' 
AND NOT 'applications.evaluate' = ANY(permissions);

-- Add applications.view permission if not already present
UPDATE users 
SET permissions = array_append(permissions, 'applications.view')
WHERE role = 'EMPLOYER' 
AND NOT 'applications.view' = ANY(permissions); 