const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Endpoint de registro
router.post('/', async (req, res) => {
    const { name, password, email } = req.body;
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email já cadastrado.' });
        }

        const newUser = await prisma.user.create({
            data: { name, password, email, consecutiveDays: 0 },
        });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
});

module.exports = router;
