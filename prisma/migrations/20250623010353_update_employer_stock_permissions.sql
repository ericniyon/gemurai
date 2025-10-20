-- Update permissions for all EMPLOYER users to include stock management
UPDATE users
SET permissions = ARRAY_CAT(
  ARRAY_REMOVE(
    ARRAY_REMOVE(
      ARRAY_REMOVE(
        ARRAY_REMOVE(
          ARRAY_REMOVE(
            ARRAY_REMOVE(
              ARRAY_REMOVE(permissions, 'orders.view'),
              'orders.manage'
            ),
            'products.view'
          ),
          'products.create'
        ),
        'products.edit'
      ),
      'products.delete'
    ),
    'products.manage'
  ),
  ARRAY[
    'orders.view',
    'orders.manage',
    'products.view',
    'products.create',
    'products.edit',
    'products.delete',
    'products.manage',
    'stock.view',
    'stock.manage'
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
        'orders.view',
        'orders.manage',
        'products.view',
        'products.create',
        'products.edit',
        'products.delete',
        'products.manage',
        'stock.view',
        'stock.manage'
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