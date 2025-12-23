-- Create trip_briefings table for pre-trip meetings
BEGIN;

-- Trip briefings table (行前說明會)
CREATE TABLE IF NOT EXISTS public.trip_briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,

  -- Meeting info
  title text DEFAULT '行前說明會',
  meeting_date date,
  meeting_time time,
  end_time time,

  -- Location (for in-person meetings)
  location_name text,
  location_address text,
  location_url text,  -- Google Maps link

  -- Online meeting (for virtual meetings)
  online_link text,   -- Zoom/Google Meet link
  online_password text,

  -- Agenda and documents
  agenda jsonb DEFAULT '[]'::jsonb,  -- [{title, description, duration}]
  documents jsonb DEFAULT '[]'::jsonb, -- [{name, url, type}]

  -- Additional notes
  notes text,

  -- Status
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS trip_briefings_trip_idx ON public.trip_briefings(trip_id);
CREATE INDEX IF NOT EXISTS trip_briefings_date_idx ON public.trip_briefings(meeting_date);

-- Enable RLS
ALTER TABLE public.trip_briefings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view briefings for their trips"
  ON public.trip_briefings FOR SELECT
  USING (
    trip_id IN (
      SELECT trip_id FROM public.trip_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Trip owners can manage briefings"
  ON public.trip_briefings FOR ALL
  USING (
    trip_id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Add comment
COMMENT ON TABLE public.trip_briefings IS '行前說明會資料表';

COMMIT;
