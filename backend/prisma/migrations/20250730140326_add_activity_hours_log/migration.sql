-- CreateTable
CREATE TABLE `activity_hours_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ms_id` VARCHAR(255) NOT NULL,
    `project_id` INTEGER NOT NULL,
    `hours_added` INTEGER NOT NULL,
    `added_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activity_hours_log_ms_id_idx`(`ms_id`),
    INDEX `activity_hours_log_project_id_idx`(`project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `activity_hours_log` ADD CONSTRAINT `activity_hours_log_ms_id_fkey` FOREIGN KEY (`ms_id`) REFERENCES `users_up`(`ms_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_hours_log` ADD CONSTRAINT `activity_hours_log_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project_activity`(`project_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
