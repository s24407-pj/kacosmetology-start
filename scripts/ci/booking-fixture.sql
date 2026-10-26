-- Synthetic fixture, only for the disposable integration database.
\set ON_ERROR_STOP on
BEGIN;
INSERT INTO companies (id, name)
VALUES ('00000000-0000-4000-8000-000000000001', 'Booking integration fixture');
INSERT INTO company_employees (company_id, user_id, role, first_name, last_name)
VALUES ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000004', 'EMPLOYEE', 'Anna', 'Testowa');
INSERT INTO offerings (id, company_id, name, price, duration_minutes)
VALUES ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'Usługa testowa', 100, 30);
INSERT INTO employee_work_schedules (company_id, employee_id, day_of_week, start_time, end_time)
SELECT '00000000-0000-4000-8000-000000000001'::uuid,
       '00000000-0000-4000-8000-000000000004'::uuid,
       day, '09:00'::time, '17:00'::time
FROM unnest(ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']) AS day;
COMMIT;
