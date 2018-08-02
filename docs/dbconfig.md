Here's the MySql comands to configure the database (with name 'launchpad')

```sql
-- Create Table --
CREATE DATABASE IF NOT EXISTS `launchpad`;

-- Indicate which database to use --
USE `launchpad`;

-- Crete Database --
CREATE TABLE `links` (
  `link` char(64) NOT NULL,
  `data` varchar(2048) NOT NULL,
  `parameters` varchar(512) NOT NULL,
  `clicks` int(11) NOT NULL DEFAULT '1',
  `expiration` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `server` varchar(5120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Set Primary Key --
ALTER TABLE `links`
  ADD PRIMARY KEY (`link`);
```