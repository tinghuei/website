CREATE TABLE `competencyFrameworks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`competencyId` int NOT NULL,
	`icapCode` varchar(50),
	`knowledgeRequirements` text,
	`skillRequirements` text,
	`attitudeRequirements` text,
	`level1Description` text,
	`level2Description` text,
	`level3Description` text,
	`level4Description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `competencyFrameworks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employeeSelfAssessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`employeeName` varchar(255) NOT NULL,
	`positionId` int NOT NULL,
	`assessmentDate` timestamp NOT NULL DEFAULT (now()),
	`status` enum('draft','submitted','reviewed','approved') NOT NULL DEFAULT 'draft',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employeeSelfAssessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `selfAssessmentDetails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`competencyId` int NOT NULL,
	`selfRatedLevel` int NOT NULL,
	`evidenceDescription` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `selfAssessmentDetails_id` PRIMARY KEY(`id`)
);
