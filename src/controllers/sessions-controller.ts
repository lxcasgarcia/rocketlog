import { Request, Response } from 'express';
import { prisma } from '@/database/prisma';
import { z } from 'zod';
import { AppError } from '@/utils/AppError';
import { compare } from 'bcrypt';
import { authConfig } from '@/configs/auth';
import { sign } from 'jsonwebtoken';

class SessionsController {
    async create(request: Request, response: Response) {
        const bodySchema = z.object({
            email: z.string().email(),
            password: z.string().min(6)
        })

        const { email, password } = bodySchema.parse(request.body)

        const user = await prisma.user.findFirst({
            where: { email },
        })

        // Verifica se o usuário existe com o email informado
        if (!user) {
            throw new AppError("Invalid email or password", 401)
        }

        const passwordMatch = await compare(password, user.password)

        // Verifica se a senha informada é igual a senha do usuário
        if (!passwordMatch) {
            throw new AppError("Invalid email or password", 401)
        }

        const { secret, expiresIn } = authConfig.jwt

        const token = sign({ role: user.role ?? "customer" }, secret, {
            subject: user.id,
            expiresIn
        })

        const { password: hashedPassword, ...userWithoutPassword } = user

        return response.json({ token, user: userWithoutPassword })
    }
}

export { SessionsController }