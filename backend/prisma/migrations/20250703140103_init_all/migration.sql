-- CreateTable
CREATE TABLE `event_posts` (
    `post_id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_id` INTEGER NULL,
    `ms_id` VARCHAR(255) NULL,
    `post_content` TEXT NULL,
    `imge_url` VARCHAR(255) NULL,
    `post_date` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `post_status` ENUM('active', 'expired') NULL DEFAULT 'active',
    `location_post` VARCHAR(255) NULL,
    `hour_post` INTEGER NULL,
    `post_datetime` DATETIME(0) NULL,
    `registration_start` DATETIME(0) NULL,
    `registration_end` DATETIME(0) NULL,

    INDEX `project_id`(`project_id`),
    INDEX `event_posts_ms_id_idx`(`ms_id`),
    PRIMARY KEY (`post_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_activity` (
    `project_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ms_id` VARCHAR(255) NULL,
    `project_name` VARCHAR(255) NOT NULL,
    `project_description` TEXT NULL,
    `department` VARCHAR(255) NULL,
    `location` VARCHAR(255) NULL,
    `budget` DECIMAL(15, 2) NULL,
    `hours` INTEGER NULL,
    `created_date` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `project_status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `project_datetime` DATETIME(0) NULL,
    `approval_datetime` DATETIME(0) NULL,
    `qrCodeData` VARCHAR(255) NULL,
    `project_year` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `project_enddate` DATETIME(0) NULL,

    INDEX `project_activity_ms_id_idx`(`ms_id`),
    PRIMARY KEY (`project_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registration_activity` (
    `register_id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER NULL,
    `student_id` CHAR(9) NOT NULL,
    `student_name` VARCHAR(255) NOT NULL,
    `faculty` VARCHAR(255) NOT NULL,
    `project_id` INTEGER NULL,

    INDEX `post_id`(`post_id`),
    INDEX `project_id`(`project_id`),
    PRIMARY KEY (`register_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users_up` (
    `id` INTEGER NULL,
    `ms_id` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NULL DEFAULT 'user',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `givenName` VARCHAR(255) NULL,
    `surname` VARCHAR(255) NULL,
    `jobTitle` VARCHAR(255) NULL,
    `department` VARCHAR(255) NULL,
    `displayName` VARCHAR(255) NULL,
    `qrCodeId` VARCHAR(255) NULL,

    UNIQUE INDEX `qrCodeId`(`qrCodeId`),
    PRIMARY KEY (`ms_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_record` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_id` INTEGER NOT NULL,
    `ms_id` VARCHAR(10) NOT NULL,
    `joined_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `evaluation_status` ENUM('PENDING', 'COMPLETED', 'NOT_EVALUATED') NOT NULL DEFAULT 'PENDING',

    INDEX `ms_id`(`ms_id`),
    INDEX `project_id`(`project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `event_posts` ADD CONSTRAINT `event_posts_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project_activity`(`project_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `event_posts` ADD CONSTRAINT `event_posts_ms_id_fkey` FOREIGN KEY (`ms_id`) REFERENCES `users_up`(`ms_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_activity` ADD CONSTRAINT `project_activity_ms_id_fkey` FOREIGN KEY (`ms_id`) REFERENCES `users_up`(`ms_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registration_activity` ADD CONSTRAINT `registration_activity_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `event_posts`(`post_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `registration_activity` ADD CONSTRAINT `registration_activity_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `project_activity`(`project_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `activity_record` ADD CONSTRAINT `activity_record_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project_activity`(`project_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `activity_record` ADD CONSTRAINT `activity_record_ibfk_2` FOREIGN KEY (`ms_id`) REFERENCES `users_up`(`ms_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
