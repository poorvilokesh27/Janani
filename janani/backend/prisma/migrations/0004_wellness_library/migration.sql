ALTER TABLE `WellnessContent`
  ADD COLUMN `category` VARCHAR(191) NOT NULL DEFAULT 'general',
  ADD COLUMN `summary` VARCHAR(191) NULL,
  ADD COLUMN `safetyNote` TEXT NULL,
  ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

CREATE INDEX `WellnessContent_category_language_active_idx`
  ON `WellnessContent`(`category`, `language`, `active`);
