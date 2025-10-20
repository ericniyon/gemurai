-- Update permissions for all EMPLOYER users to include stock management
DO $$
BEGIN
  -- Update existing EMPLOYER users
  UPDATE users
  SET permissions = (
    SELECT ARRAY(
      SELECT DISTINCT unnest(permissions || ARRAY[
        'orders.view',
        'orders.manage',
        'products.view',
        'products.create',
        'products.edit',
        'products.delete',
        'products.manage',
        'stock.view',
        'stock.manage'
      ])
    )
  )
  WHERE role = 'EMPLOYER';

  -- Create or replace the trigger function
  CREATE OR REPLACE FUNCTION ensure_employer_permissions()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.role = 'EMPLOYER' THEN
      NEW.permissions = (
        SELECT ARRAY(
          SELECT DISTINCT unnest(COALESCE(NEW.permissions, ARRAY[]::text[]) || ARRAY[
            'orders.view',
            'orders.manage',
            'products.view',
            'products.create',
            'products.edit',
            'products.delete',
            'products.manage',
            'stock.view',
            'stock.manage'
          ])
        )
      );
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Drop the trigger if it exists
  DROP TRIGGER IF EXISTS ensure_employer_permissions_trigger ON users;

  -- Create the trigger
  CREATE TRIGGER ensure_employer_permissions_trigger
    BEFORE INSERT OR UPDATE OF role ON users
    FOR EACH ROW
    EXECUTE FUNCTION ensure_employer_permissions();

END $$; 