CREATE TABLE `mediscreen_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`snapshotKey` varchar(64) NOT NULL,
	`payload` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mediscreen_snapshots_id` PRIMARY KEY(`id`),
	CONSTRAINT `mediscreen_snapshots_snapshotKey_unique` UNIQUE(`snapshotKey`)
);
