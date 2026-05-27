CREATE TABLE `competencies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `competencies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employeeCompetencies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeName` varchar(255) NOT NULL,
	`positionId` int NOT NULL,
	`competencyId` int NOT NULL,
	`currentLevel` int NOT NULL,
	`assessmentDate` timestamp NOT NULL DEFAULT (now()),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employeeCompetencies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gapAnalysisResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeName` varchar(255) NOT NULL,
	`positionId` int NOT NULL,
	`totalGap` int NOT NULL,
	`gapPercentage` int NOT NULL,
	`analysisDate` timestamp NOT NULL DEFAULT (now()),
	`recommendedTraining` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gapAnalysisResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobPositions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`department` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobPositions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `positionCompetencies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`positionId` int NOT NULL,
	`competencyId` int NOT NULL,
	`requiredLevel` int NOT NULL,
	`importance` varchar(50) NOT NULL DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `positionCompetencies_id` PRIMARY KEY(`id`)
);
