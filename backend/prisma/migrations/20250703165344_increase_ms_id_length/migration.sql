-- DropForeignKey
ALTER TABLE `activity_record` DROP FOREIGN KEY `activity_record_ibfk_2`;

-- AlterTable
ALTER TABLE `activity_record` MODIFY `ms_id` VARCHAR(100) NOT NULL;

-- AddForeignKey
ALTER TABLE `activity_record` ADD CONSTRAINT `activity_record_ibfk_2` FOREIGN KEY (`ms_id`) REFERENCES `users_up`(`ms_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
