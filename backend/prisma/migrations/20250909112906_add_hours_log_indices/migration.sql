-- CreateIndex
CREATE INDEX `activity_hours_log_added_at_idx` ON `activity_hours_log`(`added_at`);

-- CreateIndex
CREATE INDEX `activity_hours_log_ms_id_added_at_idx` ON `activity_hours_log`(`ms_id`, `added_at`);
