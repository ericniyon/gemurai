-- Migration: Add MCC Roles
-- This migration adds new MCC-related roles to the UserRole enum

-- AlterEnum: Add new MCC roles to UserRole enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'MCC_MANAGER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'FIELD_AGENT';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'COOP_ADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'FARMER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ACCOUNTANT';

