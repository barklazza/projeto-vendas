CREATE TABLE `sales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productCode` varchar(100) NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`paymentMethod` varchar(50) NOT NULL,
	`paymentDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sales_id` PRIMARY KEY(`id`)
);
