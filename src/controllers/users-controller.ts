import { Request, Response } from 'express';
import { hash } from "bcrypt";
import { prisma } from "@/database/prisma";
import { AppError } from '@/utils/AppError';
import { z } from 'zod';

class UsersController {
    async create(request: Request, response: Response) {
        const bodySchema = z.object({
            name: z.string().trim().min(3),
            email: z.string().email(),
            password: z.string().min(6)
        })

        const { name, email, password } = bodySchema.parse(request.body)

        const userWithSameEmail = await prisma.user.findFirst({ where: { email } })

        if (userWithSameEmail) {
            throw new AppError("User already exists")
        }

        const hashedPassword = await hash(password, 8)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        // Separa a senha desestruturada do objeto user, e retorna o restante do objeto no userWithoutPassword
        const { password: _, ...userWithoutPassword } = user

        return response.status(201).json(userWithoutPassword)
    }
}

export { UsersController }