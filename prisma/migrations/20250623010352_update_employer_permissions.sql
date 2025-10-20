-- Update permissions for all EMPLOYER users
UPDATE users
SET permissions = ARRAY[
  'applications.view',
  'applications.evaluate',
  'applications.manage',
  'applications.review',
  'products.view',
  'products.create',
  'products.edit',
  'products.delete',
  'products.manage',
  'orders.view',
  'orders.create',
  'orders.manage',
  'learning.view',
  'learning.enroll',
  'jobs.view',
  'jobs.post',
  'jobs.manage',
  'finance.view',
  'finance.request',
  'dashboard.view'
]
WHERE role = 'EMPLOYER';

-- Create a trigger to automatically set these permissions for new EMPLOYER users
CREATE OR REPLACE FUNCTION set_employer_permissions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'EMPLOYER' THEN
    NEW.permissions = ARRAY[
      'applications.view',
      'applications.evaluate',
      'applications.manage',
      'applications.review',
      'products.view',
      'products.create',
      'products.edit',
      'products.delete',
      'products.manage',
      'orders.view',
      'orders.create',
      'orders.manage',
      'learning.view',
      'learning.enroll',
      'jobs.view',
      'jobs.post',
      'jobs.manage',
      'finance.view',
      'finance.request',
      'dashboard.view'
    ];
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_employer_permissions_trigger ON users;
CREATE TRIGGER set_employer_permissions_trigger
  BEFORE INSERT OR UPDATE OF role ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_employer_permissions(); 