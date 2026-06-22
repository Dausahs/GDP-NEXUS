-- Add 'Member' to team_dept enum (used for MT/Penyelaras assigned to a project)
-- Run this in Supabase Dashboard → SQL Editor

ALTER TYPE team_dept ADD VALUE IF NOT EXISTS 'Member';
