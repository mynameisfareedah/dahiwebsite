-- test-approve-volunteer-application.sql
-- Create a test volunteer application, then verify its creation in the volunteers table.
-- Replace the email or timestamp if needed for repeat runs.

-- 1) Insert test volunteer application
INSERT INTO public.volunteer_applications
(full_name, email, phone, gender, state, country, occupation, skills, availability, interest, experience, motivation, status)
VALUES
(
  'Test Volunteer',
  'test+20260806T000000@example.com',
  '+10000000000',
  'Prefer not to say',
  'Test State',
  'Test Country',
  'Tester',
  'Testing, Outreach',
  'Weekends',
  'Health outreach',
  'None',
  'Verify approveVolunteerApplication persistence.',
  'Pending'
);

-- 2) Verify the application row exists
SELECT id, full_name, email, status, created_at
FROM public.volunteer_applications
WHERE email = 'test+20260806T000000@example.com';

-- 3) After approving in the admin UI, verify the volunteer row was created
SELECT id, name, email, phone, skills, availability, approval_status, created_by, created_at
FROM public.volunteers
WHERE email = 'test+20260806T000000@example.com';

-- 4) Cleanup the test rows when done
DELETE FROM public.volunteers
WHERE email = 'test+20260806T000000@example.com';

DELETE FROM public.volunteer_applications
WHERE email = 'test+20260806T000000@example.com';
