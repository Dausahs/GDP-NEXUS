CREATE TABLE IF NOT EXISTS event_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    job_scope TEXT CHECK (job_scope IN ('Photographer', 'Videographer')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE event_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event schedules are viewable by all members" 
ON event_schedules FOR SELECT 
USING (true);

-- Allow MT to manage schedules
CREATE POLICY "MT can manage schedules" 
ON event_schedules FOR ALL 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'MT'
    )
);
