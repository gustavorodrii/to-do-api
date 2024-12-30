const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Criar uma tarefa
router.post('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { title, description, completed, reminder, createdWhen } = req.body;

    try {
        const newTodo = await prisma.toDo.create({
            data: {
                title,
                description,
                completed: completed || false,
                userId,
                reminder: reminder ? new Date(reminder) : null,
                createdWhen,
            },
        });
        res.status(201).json(newTodo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar tarefa' });
    }
});

// Listar todas as tarefas de um usuário específico
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const todos = await prisma.toDo.findMany({
            where: { userId: userId },

        });
        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar tarefas' });
    }
});

// Atualizar uma tarefa
router.put('/:taskId', async (req, res) => {
    const { taskId } = req.params;
    const { title, description, completed } = req.body;

    try {
        const updatedTodo = await prisma.toDo.update({
            where: { id: taskId },
            data: {
                title,
                description,
                completed,
            },
        });
        res.status(200).json(updatedTodo);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar tarefa' });
    }
});

// Deletar uma tarefa
router.delete('/:taskId', async (req, res) => {
    const { taskId } = req.params;

    try {
        await prisma.toDo.delete({
            where: { id: taskId },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar tarefa' });
    }
});

module.exports = router;
