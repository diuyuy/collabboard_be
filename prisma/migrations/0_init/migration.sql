-- CreateTable
CREATE TABLE `Board` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `backgroundColor` VARCHAR(7) NOT NULL,
    `workspaceId` BIGINT NOT NULL,
    `ownerId` BIGINT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT (now()),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT (now()),

    INDEX `ownerId`(`ownerId`),
    INDEX `workspaceId`(`workspaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Card` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `listId` BIGINT NULL,
    `position` VARCHAR(255) NOT NULL,
    `priority` ENUM('HIGH', 'MEDIUM', 'LOW') NOT NULL,
    `status` ENUM('TODO', 'IN_PROGRESS', 'DONE', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    `createdAt` DATETIME(0) NOT NULL DEFAULT (now()),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT (now()),

    INDEX `listId`(`listId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CardAssignee` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `cardId` BIGINT NOT NULL,
    `memberId` BIGINT NOT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT (now()),

    INDEX `cardId`(`cardId`),
    UNIQUE INDEX `idx_member_card`(`memberId`, `cardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CardLabel` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `cardId` BIGINT NOT NULL,
    `labelId` BIGINT NOT NULL,

    INDEX `cardId`(`cardId`),
    UNIQUE INDEX `idx_label_card`(`labelId`, `cardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comment` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `memberId` BIGINT NULL,
    `cardId` BIGINT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT (now()),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT (now()),

    INDEX `cardId`(`cardId`),
    INDEX `memberId`(`memberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Label` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `color` VARCHAR(7) NOT NULL,
    `boardId` BIGINT NOT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT (now()),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT (now()),

    INDEX `boardId`(`boardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `List` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `boardId` BIGINT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `position` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT (now()),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT (now()),

    INDEX `boardId`(`boardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Member` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(60) NULL,
    `nickname` VARCHAR(50) NULL,
    `role` ENUM('USER', 'ADMIN') NULL DEFAULT 'USER',
    `createdAt` DATETIME(0) NOT NULL DEFAULT (now()),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT (now()),

    UNIQUE INDEX `email`(`email`),
    UNIQUE INDEX `nickname`(`nickname`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Workspace` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `ownerId` BIGINT NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT (now()),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT (now()),

    UNIQUE INDEX `idx_member_name`(`ownerId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkspaceMember` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `workspaceId` BIGINT NOT NULL,
    `memberId` BIGINT NOT NULL,
    `role` ENUM('OWNER', 'ADMIN', 'MEMBER', 'VIEWER') NOT NULL,
    `joinAt` DATETIME(0) NOT NULL DEFAULT (now()),
    `createdAt` DATETIME(0) NOT NULL DEFAULT (now()),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT (now()),

    INDEX `memberId`(`memberId`),
    UNIQUE INDEX `idx_member_workspace`(`workspaceId`, `memberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Board` ADD CONSTRAINT `Board_ibfk_1` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Board` ADD CONSTRAINT `Board_ibfk_2` FOREIGN KEY (`ownerId`) REFERENCES `Member`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Card` ADD CONSTRAINT `Card_ibfk_1` FOREIGN KEY (`listId`) REFERENCES `List`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardAssignee` ADD CONSTRAINT `CardAssignee_ibfk_1` FOREIGN KEY (`cardId`) REFERENCES `Card`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardAssignee` ADD CONSTRAINT `CardAssignee_ibfk_2` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardLabel` ADD CONSTRAINT `CardLabel_ibfk_1` FOREIGN KEY (`cardId`) REFERENCES `Card`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardLabel` ADD CONSTRAINT `CardLabel_ibfk_2` FOREIGN KEY (`labelId`) REFERENCES `Label`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_ibfk_1` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_ibfk_2` FOREIGN KEY (`cardId`) REFERENCES `Card`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Label` ADD CONSTRAINT `Label_ibfk_1` FOREIGN KEY (`boardId`) REFERENCES `Board`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `List` ADD CONSTRAINT `List_ibfk_1` FOREIGN KEY (`boardId`) REFERENCES `Board`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Workspace` ADD CONSTRAINT `Workspace_ibfk_1` FOREIGN KEY (`ownerId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkspaceMember` ADD CONSTRAINT `WorkspaceMember_ibfk_1` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkspaceMember` ADD CONSTRAINT `WorkspaceMember_ibfk_2` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

