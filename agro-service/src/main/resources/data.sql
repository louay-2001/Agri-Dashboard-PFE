INSERT INTO organizations (id, name, subscription_plan_id, created_at)
VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Agri Demo Organization',
    NULL,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;
