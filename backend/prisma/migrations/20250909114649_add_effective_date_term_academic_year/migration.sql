-- DropForeignKey
ALTER TABLE `activity_hours_log` DROP FOREIGN KEY `activity_hours_log_ms_id_fkey`;

-- DropIndex
DROP INDEX `activity_hours_log_ms_id_added_at_idx` ON `activity_hours_log`;

-- AlterTable
ALTER TABLE `activity_hours_log` ADD COLUMN `academic_year` VARCHAR(9) NULL,
    ADD COLUMN `effective_date` DATETIME(3) NULL,
    ADD COLUMN `term` INTEGER NULL;

-- CreateIndex
CREATE INDEX `activity_hours_log_effective_date_idx` ON `activity_hours_log`(`effective_date`);

-- CreateIndex
CREATE INDEX `activity_hours_log_academic_year_term_idx` ON `activity_hours_log`(`academic_year`, `term`);

-- CreateIndex
CREATE INDEX `activity_hours_log_ms_id_academic_year_term_idx` ON `activity_hours_log`(`ms_id`, `academic_year`, `term`);

-- AddForeignKey
ALTER TABLE `event_posts` ADD CONSTRAINT `event_posts_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project_activity`(`project_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
