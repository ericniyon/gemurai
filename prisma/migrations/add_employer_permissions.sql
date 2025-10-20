-- Add applications.view permission to existing EMPLOYER users
UPDATE "User"
SET permissions = array_append(permissions, 'applications.view')
WHERE role = 'EMPLOYER' AND NOT 'applications.view' = ANY(permissions);

-- Create a trigger to automatically add applications.view permission to new EMPLOYER users
CREATE OR REPLACE FUNCTION add_employer_permissions()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'EMPLOYER' THEN
        NEW.permissions = array_append(COALESCE(NEW.permissions, ARRAY[]::text[]), 'applications.view');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER employer_permissions_trigger
    BEFORE INSERT OR UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION add_employer_permissions(); 