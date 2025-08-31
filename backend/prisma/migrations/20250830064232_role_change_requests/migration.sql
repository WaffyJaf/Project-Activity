-- CreateTable
CREATE TABLE `RoleChangeRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `currentRole` ENUM('admin', 'organizer', 'user') NOT NULL,
    `requestedRole` ENUM('admin', 'organizer', 'user') NOT NULL,
    `reason` VARCHAR(191) NULL,
    `status` ENUM('pending', 'approved', 'rejected', 'canceled') NOT NULL DEFAULT 'pending',
    `reviewedBy` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RoleChangeRequest_userId_status_idx`(`userId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RoleChangeRequest` ADD CONSTRAINT `RoleChangeRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users_up`(`ms_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoleChangeRequest` ADD CONSTRAINT `RoleChangeRequest_reviewedBy_fkey` FOREIGN KEY (`reviewedBy`) REFERENCES `users_up`(`ms_id`) ON DELETE SET NULL ON UPDATE CASCADE;
