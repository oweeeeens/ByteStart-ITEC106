-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: compubasics
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'Computer Basics','Introduction to computers, hardware and software.');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lessons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `content` text DEFAULT NULL,
  `lesson_order` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
INSERT INTO `lessons` VALUES (1,1,'General Introduction to Computers','{\"summary\":\"Learn what computers are, how they help us, and the basic parts every computer has.\",\"points\":[\"Computers help us learn and have fun\",\"They follow instructions called programs\",\"Basic parts: input, output, system unit, storage\",\"Used everywhere: school, home, work\",\"Can be desktop, laptop, tablet, or phone\",\"Software = programs, Hardware = physical parts\",\"The internet connects computers worldwide\"]}',1),(2,1,'Input Devices','{\"summary\":\"Input devices help you put information into the computer. They are how you tell the computer what to do.\",\"points\":[\"Keyboard: type letters, numbers, and symbols\",\"Mouse: move and click to choose items on screen\",\"Microphone: speak to record sound or give voice commands\",\"Scanner: copy paper documents into the computer\",\"Webcam: capture pictures and video\",\"Touchscreen: tap and swipe to control directly\",\"Game controllers: input devices for playing games\"]}',2),(3,1,'Output Devices','{\"summary\":\"Output devices show you the results from the computer. They help you see or hear what the computer does.\",\"points\":[\"Monitor: shows pictures, text, video, and games\",\"Printer: prints documents and images on paper\",\"Speakers: play sound, music, and voice out loud\",\"Headphones: listen privately\",\"Projector: display on a big screen for presentations\",\"Output devices show us the results of our work\"]}',3),(4,1,'System Unit','{\"summary\":\"The system unit is the computer’s main body. Inside are parts like the CPU and memory.\",\"points\":[\"CPU: the brain that processes instructions\",\"RAM: short-term memory for speed\",\"Storage: hard drive or SSD for saving files\",\"Motherboard: connects all parts together\",\"Power Supply: provides electricity to all parts\",\"Graphics Card (GPU): displays images and video\",\"Fans: keep everything cool\"]}',4),(5,1,'Storage Devices','{\"summary\":\"Storage devices hold your files and programs, even when the power is off.\",\"points\":[\"Hard Drive (HDD): stores lots of data using spinning disks\",\"Solid-State Drive (SSD): faster storage with no moving parts\",\"USB Flash Drive: small and portable for carrying files\",\"SD Card: tiny card for photos and videos\",\"External Hard Drive: extra portable storage\",\"Cloud Storage: save files online from anywhere\",\"Always back up important files!\"]}',5),(6,1,'Computer Safety and Care','{\"summary\":\"Staying safe around computers protects you and the equipment. Learn safe handling and care.\",\"points\":[\"Wash hands before using equipment\",\"Handle cables carefully — do not pull or bend them\",\"Shut down properly before unplugging\",\"Avoid food and drinks near the computer\",\"Ask for help if something looks broken\",\"Take breaks to rest your eyes\",\"Do not click unknown links or download strange files\",\"Log out on shared computers\"]}',6);
/*!40000 ALTER TABLE `lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `progress`
--

DROP TABLE IF EXISTS `progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `lesson_id` int(11) NOT NULL,
  `score` int(11) NOT NULL DEFAULT 0,
  `status` enum('Locked','Unlocked','Completed') NOT NULL DEFAULT 'Locked',
  PRIMARY KEY (`id`),
  UNIQUE KEY `u_user_lesson` (`user_id`,`lesson_id`),
  KEY `lesson_id` (`lesson_id`),
  CONSTRAINT `progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `progress_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `progress`
--

LOCK TABLES `progress` WRITE;
/*!40000 ALTER TABLE `progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quiz_id` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `image_path` text DEFAULT NULL,
  `option_a` varchar(255) NOT NULL,
  `option_b` varchar(255) NOT NULL,
  `option_c` varchar(255) NOT NULL,
  `option_d` varchar(255) NOT NULL,
  `correct_answer` enum('A','B','C','D') NOT NULL,
  `paragraph_after` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `quiz_id` (`quiz_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,1,'Look at the image. What type of electronic device is shown?','/images/hero-computer.png','A computer','A television','A calculator','A gaming console','A',0),(2,1,'Identify the computer part shown in this image.','/images/tower.png','Refrigerator','System Unit','Lamp','Chair','B',0),(3,1,'Look at this image. What type of computer is shown?','/images/quiz/laptop.png','Desktop computer','Tablet','Laptop','Smartphone','C',0),(4,1,'Look at the image. What type of device is this?','/images/quiz/tablet.png','Laptop','Tablet','Microwave','Desktop','B',0),(5,1,'Look at the image. What does this symbol represent?','/images/quiz/internet-icon.png','A long cable','The internet','A power strip','Bluetooth','B',0),(6,2,'What input device is shown in this image?','/images/keyboard.png','Keyboard','Monitor','Mouse','Printer','A',0),(7,2,'Identify the input device shown in this image.','/images/mouse.png','Speaker','Mouse','Projector','Scanner','B',0),(8,2,'What input device is shown in this image?','/images/microphone.png','Printer','Monitor','Microphone','Headphones','C',0),(9,2,'Look at the image. What input device is this?','/images/quiz/scanner.png','Printer','Speaker','Scanner','Monitor','C',0),(10,2,'What input device is shown in this image?','/images/quiz/touchscreen.png','Mouse','Keyboard','Touchscreen','Webcam','C',0),(11,3,'What output device is shown in this image?','/images/monitor.png','Keyboard','Monitor','Mouse','Microphone','B',0),(12,3,'Identify the output device shown in this image.','/images/speaker.png','Speakers','Scanner','Webcam','Router','A',0),(13,3,'What output device is shown in this image?','/images/printer.png','Monitor','Keyboard','Printer','Mouse','C',0),(14,3,'Look at the image. What output device is this?','/images/headphones.png','Speakers','Projector','Headphones','Printer','C',0),(15,3,'Identify the output device shown in this image.','/images/quiz/projector.png','Scanner','Webcam','Output device called a Projector','Keyboard','C',0),(16,4,'Look at the image. What computer part is this?','/images/tower.png','System Unit','Printer','Projector','Mouse','A',0),(17,4,'Identify the component shown in this image.','/images/quiz/cpu.png','CPU','Monitor','Keyboard','USB Drive','A',0),(18,4,'What computer component is shown in this image?','/images/quiz/ram.png','Hard Drive','RAM','Power Supply','Graphics Card','B',0),(19,4,'Look at the image. What part of the computer is this?','/images/quiz/motherboard.png','Power cable','Motherboard','Speakers','Mouse','B',0),(20,4,'What part shown in this image keeps the computer cool?','/images/quiz/cooling-fan.png','The monitor','Cooling fan','The keyboard','The printer','B',0),(21,5,'What storage device is shown in this image?','/images/hdd-open.png','Hard Drive (HDD)','Mouse','Webcam','Microphone','A',0),(22,5,'Identify the storage device shown in this image.','/images/quiz/usb-flash-drive.png','USB Flash Drive','CPU','Speakers','Monitor','A',0),(23,5,'What storage device is shown in this image?','/images/quiz/ssd.png','Hard Drive (HDD)','SSD (Solid-State Drive)','RAM','DVD','B',0),(24,5,'Look at the image. What type of storage is this?','/images/quiz/cloud-storage.png','USB Drive','Cloud Storage','DVD disc','Hard Drive','B',0),(25,5,'Identify the storage device shown in this image.','/images/quiz/cd-dvd.png','USB Flash Drive','Hard Drive','CD / DVD Disc','Memory Card','C',0),(26,6,'Look at the image. What safety item is this?','/images/quiz/anti-static-strap.png','Anti-static Wrist Strap','VR Headset','Sunglasses','Headphones','A',0),(27,6,'Look at the image. What safe habit is being shown?','/images/clean-screen.png','Eating near the keyboard','Pulling cables hard','Cleaning gently with a soft cloth','Spilling water on it','C',0),(28,6,'What does the image show as the correct way to turn off a computer?','/images/quiz/shutdown-menu.png','Pull the plug from the wall','Press and hold the power button','Use the Start menu to shut down','Close the monitor lid','C',0),(29,6,'Look at the image. What healthy habit is this student practicing?','/images/quiz/screen-break.png','Skipping lunch','Playing games all day','Taking a break from the screen','Sleeping at the desk','C',0),(30,6,'Look at the image. What should you do when you see something like this?','/images/quiz/suspicious-link.png','Click it right away','Share it with friends','Do not click it — it could be harmful','Download the file from it','C',0);
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_history`
--

DROP TABLE IF EXISTS `quiz_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quiz_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `lesson_id` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `score` int(11) NOT NULL,
  `passed` tinyint(1) NOT NULL DEFAULT 0,
  `attempted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `quiz_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_history`
--

LOCK TABLES `quiz_history` WRITE;
/*!40000 ALTER TABLE `quiz_history` DISABLE KEYS */;
INSERT INTO `quiz_history` VALUES (1,9,'lesson0','General Introduction to Computers',100,1,'2026-05-15 09:38:03');
/*!40000 ALTER TABLE `quiz_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lesson_id` int(11) NOT NULL,
  `passing_score` int(11) NOT NULL DEFAULT 70,
  PRIMARY KEY (`id`),
  KEY `lesson_id` (`lesson_id`),
  CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizzes`
--

LOCK TABLES `quizzes` WRITE;
/*!40000 ALTER TABLE `quizzes` DISABLE KEYS */;
INSERT INTO `quizzes` VALUES (1,1,70),(2,2,70),(3,3,70),(4,4,70),(5,5,70),(6,6,70);
/*!40000 ALTER TABLE `quizzes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_progress`
--

DROP TABLE IF EXISTS `user_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `progress_json` text NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `user_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_progress`
--

LOCK TABLES `user_progress` WRITE;
/*!40000 ALTER TABLE `user_progress` DISABLE KEYS */;
INSERT INTO `user_progress` VALUES (1,1,'{\"lesson0\":\"completed\",\"lesson1\":\"unlocked\",\"lesson2\":\"locked\",\"lesson3\":\"locked\",\"lesson4\":\"locked\",\"lesson5\":\"locked\"}','2026-03-27 12:50:38'),(2,2,'{\"lesson0\":\"unlocked\",\"lesson1\":\"locked\",\"lesson2\":\"locked\",\"lesson3\":\"locked\",\"lesson4\":\"locked\",\"lesson5\":\"locked\"}','2026-03-27 14:51:07'),(4,9,'{\"lesson0\":\"completed\",\"lesson1\":\"unlocked\",\"lesson2\":\"locked\",\"lesson3\":\"locked\",\"lesson4\":\"locked\",\"lesson5\":\"locked\"}','2026-05-15 09:38:04');
/*!40000 ALTER TABLE `user_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_settings`
--

DROP TABLE IF EXISTS `user_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `settings_json` text NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_settings`
--

LOCK TABLES `user_settings` WRITE;
/*!40000 ALTER TABLE `user_settings` DISABLE KEYS */;
INSERT INTO `user_settings` VALUES (1,1,'{\"fontSize\":\"large\",\"highContrast\":true,\"darkMode\":true,\"dyslexiaFont\":false,\"reducedMotion\":false,\"lineSpacing\":\"normal\",\"cursorSize\":\"large\",\"screenReader\":false,\"highlightFocus\":false,\"textToSpeech\":false}','2026-03-27 13:18:54'),(2,2,'{\"fontSize\":\"medium\",\"highContrast\":false,\"darkMode\":true,\"dyslexiaFont\":false,\"reducedMotion\":false,\"lineSpacing\":\"normal\",\"cursorSize\":\"default\",\"screenReader\":false,\"highlightFocus\":false,\"textToSpeech\":false}','2026-03-27 15:46:01'),(3,3,'{\"fontSize\":\"medium\",\"highContrast\":false,\"darkMode\":true,\"dyslexiaFont\":false,\"reducedMotion\":false,\"lineSpacing\":\"normal\",\"cursorSize\":\"default\",\"screenReader\":false,\"highlightFocus\":false,\"textToSpeech\":false}','2026-04-18 07:27:11'),(6,8,'{\"fontSize\":\"medium\",\"highContrast\":false,\"darkMode\":true,\"dyslexiaFont\":false,\"reducedMotion\":false,\"lineSpacing\":\"normal\",\"cursorSize\":\"default\",\"screenReader\":false,\"highlightFocus\":false,\"textToSpeech\":false}','2026-05-01 15:37:52'),(7,9,'{\"fontSize\":\"medium\",\"highContrast\":false,\"darkMode\":true,\"dyslexiaFont\":false,\"reducedMotion\":false,\"lineSpacing\":\"wide\",\"cursorSize\":\"default\",\"screenReader\":false,\"highlightFocus\":false,\"textToSpeech\":false}','2026-05-15 09:40:34'),(8,10,'{\"fontSize\":\"medium\",\"highContrast\":false,\"darkMode\":true,\"dyslexiaFont\":false,\"reducedMotion\":false,\"lineSpacing\":\"normal\",\"cursorSize\":\"default\",\"screenReader\":false,\"highlightFocus\":false,\"textToSpeech\":false}','2026-05-18 04:00:54');
/*!40000 ALTER TABLE `user_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `guardian_name` varchar(100) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `grade_level` varchar(20) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'student',
  `failed_login_attempts` int(11) NOT NULL DEFAULT 0,
  `locked_until` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Jonnel Saguid','Paolo',10,'Grade 6','jonnel123@compubasics.local','jonnel123','$2a$10$1Lypria9lciJFjmbU8Z/7eOuckV.eEYuAd.WlSpJ3hge71sV7HaCW','student',0,NULL),(2,'CompuBasics Admin','System',NULL,NULL,'admin@compubasics.local','admin','$2a$10$4B/nrWvcKTOI7IEf0EC90Otwkxre9qAzygABw6Uj6OyvvVFrqSY6.','admin',0,NULL),(3,'Dagohoy Jonnel','Paolo',10,'Grade 6','paolopogi@compubasics.local','paolopogi','$2a$10$Zi9sWx76ofFhA28V98XrTeM.Mlpk1Gp4dzIxgIMrDSFxG6Nlph6Te','student',0,NULL),(6,'Test User','John Smith',12,'Grade 6','testuser_1777649648506@compubasics.local','testuser_1777649648506','$2a$10$DxacyehNq8/O2IN5tC0Fl.z3VK0Vtnd4XMwjMwI5R5ZzH3Grd3P/e','student',0,NULL),(7,'Test User','John Smith',12,'Grade 6','testuser_1777649723298@compubasics.local','testuser_1777649723298','$2a$10$1HQa4y2YL035gfJNyMUFJOELRvh.1okDXxVS0e/mEj136uZYBOCAu','student',0,NULL),(8,'Jonnel Saguid','dasdadaas',11,'Grade 6','gdagdh@32','gdagdh@32','$2a$10$SK.P3A.ew.VQsHMqxvE2rejDz5EGhWj4rFiZ2Hs5c3bJadQ9iZazq','student',0,NULL),(9,'Paolo Basco','Mayan Basco',13,'Grade 6','PaoloBsc0@compubasics.local','PaoloBsc0','$2a$10$5FaqjP/VwJFaHkEckVtqHuOPJpY8jWjIpZVO1YL.ofSGQUMkgI08K','student',0,NULL),(10,'paopoa','dsadsadadry',11,'Grade 6','paopao123@compubasics.local','paopao123','$2a$10$KLn7nmrbDqezdwC4k2OvNuysIx4amrRVzcD3c6uBlt0IheyuT4EGq','student',0,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-18 13:52:18
