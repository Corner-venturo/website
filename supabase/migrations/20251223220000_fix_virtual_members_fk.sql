-- ============================================
-- 修復虛擬成員：移除 user_id 的外鍵約束
-- ============================================

-- 先查找並刪除 split_group_members 的 user_id 外鍵約束
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- 查找外鍵約束名稱
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'split_group_members'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
    LIMIT 1;

    -- 如果找到外鍵約束，刪除它
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.split_group_members DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Dropped foreign key constraint: %', constraint_name;
    ELSE
        RAISE NOTICE 'No foreign key constraint found on user_id';
    END IF;
END $$;

-- 同樣處理 expense_splits 表，讓虛擬成員也能參與分帳
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'expense_splits'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
    LIMIT 1;

    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.expense_splits DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Dropped foreign key constraint on expense_splits: %', constraint_name;
    ELSE
        RAISE NOTICE 'No foreign key constraint found on expense_splits.user_id';
    END IF;
END $$;
