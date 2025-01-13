const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Criar uma tarefa
router.post('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { title, description, completed, reminder, completedDate } = req.body;

    try {
        const newTodo = await prisma.toDo.create({
            data: {
                title,
                description,
                completed: completed || false,
                userId,
                reminder: reminder ? new Date(reminder) : null,
                completedDate: completedDate ? new Date(completedDate) : null,

            },
        });

        await updateConsecutiveDays(userId);

        res.status(201).json(newTodo);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});

// Listar todas as tarefas de um usuário específico
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const todos = await prisma.toDo.findMany({
            where: { userId: userId },
        });

        const consecutiveDays = calculateConsecutiveDays(todos);
        res.status(200).json({ todos: todos, consecutiveDays: consecutiveDays });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Atualizar uma tarefa
router.put('/:taskId', async (req, res) => {
    const { taskId } = req.params;
    const { title, description, completed, completedDate } = req.body;

    try {
        const updatedTodo = await prisma.toDo.update({
            where: { id: taskId },
            data: {
                title,
                description,
                completed,
                completedDate,
            },
        });
        res.status(200).json(updatedTodo);
    } catch (error) {
        res.status(500).json({ error: error.message });
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



async function updateConsecutiveDays(userId) {
    const tasks = await prisma.toDo.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },  // Ordena pela data de criação (mais recente primeiro)
    });

    const consecutiveDays = calculateConsecutiveDays(tasks);

    await prisma.user.update({
        where: { id: userId },
        data: { consecutiveDays },
    });
}


function calculateConsecutiveDays(tasks) {
    tasks.sort((a, b) => b.createdAt - a.createdAt);

    let consecutiveDays = 0;
    let lastTaskDate = null;

    for (const task of tasks) {
        const taskDate = new Date(task.createdAt);
        taskDate.setHours(0, 0, 0, 0);

        if (!lastTaskDate) {
            consecutiveDays++;
            lastTaskDate = taskDate;
        } else {
            const diffDays = Math.floor((lastTaskDate - taskDate) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                consecutiveDays++;
                lastTaskDate = taskDate;
            } else if (diffDays > 1) {
                break;
            }
        }
    }

    return consecutiveDays;
}


router.get('/consecutiveDaysUsers/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Obter o usuário atual
        const actualUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                consecutiveDays: true,
            },
        });

        if (!actualUser) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Obter os demais usuários
        const allUsers = await prisma.user.findMany({
            orderBy: {
                consecutiveDays: 'desc',
            },
            take: 10,
            select: {
                id: true,
                name: true,
                email: true,
                consecutiveDays: true,
            },
        });

        res.status(200).json({
            actualUser,
            allUsers,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
