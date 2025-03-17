const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mysql = require('mysql2/promise');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// MySQL Connection
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'transactions_db'
});

const transactions = new Map(); // Store active transactions in memory

wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
        try {
            const { transactionId, username, action } = JSON.parse(message);

            if (action === 'request') {
                // Store request in DB
                await db.query("INSERT INTO transactions (transactionId, username) VALUES (?, ?)", [transactionId, username]);

                // Start a termination timer
                const timer = setTimeout(() => terminateRequest(transactionId), 60000);

                // Store in memory with WebSocket reference
                transactions.set(transactionId, { status: 'pending', timer });

                ws.send(JSON.stringify({ transactionId, status: 'pending' }));

                // Handle WebSocket disconnection
                ws.on('close', () => {
                    console.log(`Client disconnected for ${transactionId}`);
                    transactions.delete(transactionId);
                });
            } 
            else if (['accept', 'reject'].includes(action)) {
                if (transactions.has(transactionId)) {
                    const transaction = transactions.get(transactionId);
                    clearTimeout(transaction.timer); // Clear termination timer

                    await db.query("UPDATE transactions SET status = ? WHERE transactionId = ?", [action, transactionId]);

                    // Notify all clients
                    broadcast(transactionId, action);
                    transactions.delete(transactionId);
                }
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
});

// Function to terminate request after timeout
async function terminateRequest(transactionId) {
    if (transactions.has(transactionId)) {
        await db.query("UPDATE transactions SET status = 'terminated' WHERE transactionId = ?", [transactionId]);

        broadcast(transactionId, 'terminated'); // Notify all clients

        transactions.delete(transactionId);
    }
}

// Function to broadcast status updates to all WebSocket clients
function broadcast(transactionId, status) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ transactionId, status }));
        }
    });
}

server.listen(3000, () => console.log('Server running on port 3000'));
