-- Update permissions for all EMPLOYER users to include full application access
UPDATE users
SET permissions = ARRAY_CAT(
  ARRAY_REMOVE(
    ARRAY_REMOVE(
      ARRAY_REMOVE(
        ARRAY_REMOVE(
          ARRAY_REMOVE(
            ARRAY_REMOVE(
              ARRAY_REMOVE(
                ARRAY_REMOVE(
                  ARRAY_REMOVE(permissions, 'applications.view'),
                  'applications.evaluate'
                ),
                'applications.manage'
              ),
              'applications.review'
            ),
            'applications.delete'
          ),
          'applications.update'
        ),
        'applications.process'
      ),
      'applications.approve'
    ),
    'applications.reject'
  ),
  ARRAY[
    'applications.view',
    'applications.create',
    'applications.evaluate',
    'applications.manage',
    'applications.review',
    'applications.delete',
    'applications.update',
    'applications.process',
    'applications.approve',
    'applications.reject'
  ]
)
WHERE role = 'EMPLOYER';

-- Update permissions for all EMPLOYER users to include wallet access
UPDATE users
SET permissions = ARRAY_CAT(
  permissions,
  ARRAY[
    'wallet.view',
    'wallet.withdraw',
    'wallet.manage'
  ]
)
WHERE role = 'EMPLOYER';

-- Update the trigger function to include these permissions for new EMPLOYER users
CREATE OR REPLACE FUNCTION set_employer_permissions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'EMPLOYER' THEN
    NEW.permissions = ARRAY_CAT(
      COALESCE(NEW.permissions, ARRAY[]::text[]),
      ARRAY[
        'applications.view',
        'applications.create',
        'applications.evaluate',
        'applications.manage',
        'applications.review',
        'applications.delete',
        'applications.update',
        'applications.process',
        'applications.approve',
        'applications.reject',
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
        'stock.view',
        'stock.manage',
        'stock.create',
        'stock.edit',
        'stock.delete',
        'stock.orders.view',
        'stock.orders.create',
        'stock.orders.manage',
        'dashboard.view',
        'wallet.view',
        'wallet.withdraw',
        'wallet.manage'
      ]
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_employer_permissions_trigger ON users;

-- Create new trigger
CREATE TRIGGER set_employer_permissions_trigger
  BEFORE INSERT OR UPDATE OF role ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_employer_permissions(); 