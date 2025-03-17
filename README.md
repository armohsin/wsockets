# WebSocket Access API

## Overview
This is a **WebSocket-based Access API** that allows users to request access using a **transaction ID** and **username**. Requests can be **accepted, rejected, or terminated** if not processed within **60 seconds**.

## Features
- **WebSocket API** for real-time communication
- **MySQL Database** to store transactions
- **Auto-Termination** of unprocessed requests after 60 seconds
- **Status Updates** sent to clients in real time

## Tech Stack
- **Node.js** (WebSocket Server)
- **Express.js** (HTTP Server)
- **MySQL2** (Database)
- **WebSocket (ws)** (Real-time Communication)

## Database Schema
```sql
CREATE DATABASE IF NOT EXISTS transactions_db;

USE transactions_db;

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transactionId VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'terminated') DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```


## API Usage
### WebSocket Endpoint
```
ws://localhost:3000
```

### WebSocket Request Format
| Action  | Description |
|---------|-------------|
| `request` | User requests access |
| `accept`  | Accepts the request |
| `reject`  | Rejects the request |

#### Example Requests
##### 1️⃣ Request Access
```json
{
  "transactionId": "txn123",
  "username": "johndoe",
  "action": "request"
}
```

##### 2️⃣ Accept/Reject Access
```json
{
  "transactionId": "txn123",
  "action": "accept"
}
```

##### 3️⃣ Auto-Termination (Triggered after 60s)
```json
{
  "transactionId": "txn123",
  "status": "terminated"
}
```

## Testing with cURL & WebSocket Clients
### Connect to WebSocket
```sh
wscat -c ws://localhost:3000
```

### Send a Request
```sh
wscat -c ws://localhost:3000 -x '{"transactionId": "txn123", "username": "johndoe", "action": "request"}'
```

### Accept a Request
```sh
wscat -c ws://localhost:3000 -x '{"transactionId": "txn123", "action": "accept"}'
```

## Future Enhancements
- ✅ **JWT Authentication** for security
- ✅ **Logging & Monitoring**
- ✅ **Integrate with WSO2 API Manager**

## License
This project is licensed under the MIT License.

---
_Developed by [Abdul Rehman Mohsin](https://github.com/armohsin)_
