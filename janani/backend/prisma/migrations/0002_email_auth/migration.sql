ALTER TABLE `User`
  MODIFY `mobile` VARCHAR(191) NULL,
  ADD COLUMN `email` VARCHAR(191) NULL,
  ADD UNIQUE INDEX `User_email_key`(`email`);

ALTER TABLE `OtpChallenge`
  MODIFY `mobile` VARCHAR(191) NULL,
  ADD COLUMN `email` VARCHAR(191) NULL,
  ADD INDEX `OtpChallenge_email_expiresAt_idx`(`email`, `expiresAt`);
