-- AlterTable
ALTER TABLE `project_activity` ADD COLUMN `evaluation_statuspj` ENUM('awaiting_evaluation', 'evaluated') NOT NULL DEFAULT 'awaiting_evaluation';
