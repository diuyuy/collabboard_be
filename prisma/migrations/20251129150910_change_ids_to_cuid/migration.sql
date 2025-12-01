/*
  Warnings:

  - The primary key for the `Board` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Card` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CardAssignee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CardLabel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Comment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Label` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `List` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Member` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Workspace` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `WorkspaceMember` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `Board` DROP FOREIGN KEY `Board_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Board` DROP FOREIGN KEY `Board_ibfk_2`;

-- DropForeignKey
ALTER TABLE `Card` DROP FOREIGN KEY `Card_ibfk_1`;

-- DropForeignKey
ALTER TABLE `CardAssignee` DROP FOREIGN KEY `CardAssignee_ibfk_1`;

-- DropForeignKey
ALTER TABLE `CardAssignee` DROP FOREIGN KEY `CardAssignee_ibfk_2`;

-- DropForeignKey
ALTER TABLE `CardLabel` DROP FOREIGN KEY `CardLabel_ibfk_1`;

-- DropForeignKey
ALTER TABLE `CardLabel` DROP FOREIGN KEY `CardLabel_ibfk_2`;

-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_ibfk_2`;

-- DropForeignKey
ALTER TABLE `Label` DROP FOREIGN KEY `Label_ibfk_1`;

-- DropForeignKey
ALTER TABLE `List` DROP FOREIGN KEY `List_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Workspace` DROP FOREIGN KEY `Workspace_ibfk_1`;

-- DropForeignKey
ALTER TABLE `WorkspaceMember` DROP FOREIGN KEY `WorkspaceMember_ibfk_1`;

-- DropForeignKey
ALTER TABLE `WorkspaceMember` DROP FOREIGN KEY `WorkspaceMember_ibfk_2`;

-- AlterTable
ALTER TABLE `Board` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `workspaceId` VARCHAR(191) NOT NULL,
    MODIFY `ownerId` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Card` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `listId` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `CardAssignee` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `cardId` VARCHAR(191) NOT NULL,
    MODIFY `memberId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `CardLabel` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `cardId` VARCHAR(191) NOT NULL,
    MODIFY `labelId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Comment` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `memberId` VARCHAR(191) NULL,
    MODIFY `cardId` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Label` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `boardId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `List` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `boardId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Member` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Workspace` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `ownerId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `WorkspaceMember` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `workspaceId` VARCHAR(191) NOT NULL,
    MODIFY `memberId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

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
