import { Request, Response } from 'express';
import { prisma } from "@/database/prisma";
import { z } from 'zod';
import { AppError } from '@/utils/AppError';

class DeliveryLogsController {
    async create(request: Request, response: Response) {
        const bodySchema = z.object({
            delivery_id: z.string().uuid(),
            description: z.string(),
        })

        const { delivery_id, description } = bodySchema.parse(request.body)

        const delivery = await prisma.delivery.findUnique({
            where: { id: delivery_id }
        })

        // Se o delivery não existir, lança um erro
        if (!delivery) {
            throw new AppError("delivery not found", 404)
        }

        // Se o status do delivery for delivered, lança um erro, pois não pode adicionar logs
        if(delivery.status === "delivered"){
            throw new AppError("delivery already delivered", 404)
        }

        // Se o status do delivery não for processing, lança um erro
        if (delivery.status === "processing") {
            throw new AppError("change status to shipped", 404)
        }

        await prisma.deliveryLog.create({
            data: {
                deliveryId: delivery_id,
                description
            }
        })

        return response.status(201).json()
    }

    async show(request: Request, response: Response) {
        const paramsSchema = z.object({
            delivery_id: z.string().uuid(),
        })

        const { delivery_id } = paramsSchema.parse(request.params)

        const delivery = await prisma.delivery.findUnique({
            where: {
                id: delivery_id
            },
            include: {
                user: true,
                logs: true,
  
            }
        })

        // Esse usuário é um cliente? e o id dele é diferente do id do delivery? Se sim, lança um erro
        if (request.user?.role === "customer" && request.user.id !== delivery?.userId) {
            throw new AppError("the user can only view their deliveries", 401)
        }

        return response.json(delivery)
    }
}

export { DeliveryLogsController }