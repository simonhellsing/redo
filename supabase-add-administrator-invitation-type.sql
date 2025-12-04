-- Add 'administrator' type to invitations table
-- This allows administrators to invite other administrators

ALTER TABLE invitations
DROP CONSTRAINT IF EXISTS invitations_type_check;

ALTER TABLE invitations
ADD CONSTRAINT invitations_type_check 
CHECK (type IN ('workspace_collaborator', 'customer', 'administrator'));


