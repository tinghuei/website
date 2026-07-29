CREATE TABLE `assessmentResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeName` varchar(255) NOT NULL,
	`department` varchar(255) NOT NULL,
	`positionId` int NOT NULL,
	`positionName` varchar(255) NOT NULL,
	`assessmentData` text NOT NULL,
	`totalCompetencies` int NOT NULL,
	`acquiredCompetencies` int NOT NULL,
	`gapCompetencies` int NOT NULL,
	`completionPercentage` int NOT NULL,
	`gapPercentage` int NOT NULL,
	`recommendations` text,
	`assessmentDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessmentResults_id` PRIMARY KEY(`id`)
);
