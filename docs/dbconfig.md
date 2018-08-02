Here's the MySql comands to configure the database (with name 'launchpad')

```sql
CREATE DATABASE IF NOT EXISTS launchpad;

CREATE TABLE `links` (
  `link` char(64) NOT NULL,
  `data` varchar(2048) NOT NULL,
  `parameters` varchar(512) NOT NULL,
  `clicks` int(11) NOT NULL DEFAULT '1',
  `expiration` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `server` varchar(5120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `links`
  ADD PRIMARY KEY (`link`);
```