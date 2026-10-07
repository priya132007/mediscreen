ALTER TABLE `users` ADD COLUMN `passwordHash` text;
ALTER TABLE `users` ADD COLUMN `phone` varchar(32);
ALTER TABLE `users` ADD COLUMN `resetToken` varchar(128);
ALTER TABLE `users` ADD COLUMN `resetTokenExpiresAt` timestamp;
CREATE TABLE `patient_visits` (
  `id` int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `userId` int NOT NULL,
  `visitDate` timestamp NOT NULL DEFAULT (now()),
  `doctorName` varchar(160) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `status` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  `doctorSeen` enum('yes','no') NOT NULL DEFAULT 'no',
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT (now())
);