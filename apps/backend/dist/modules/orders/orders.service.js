"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let OrdersService = class OrdersService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async createOrder(dto) {
        const userExists = await this.prisma.user.findUnique({
            where: { id: dto.userId },
        });
        if (!userExists) {
            throw new common_1.NotFoundException(`User with ID ${dto.userId} not found`);
        }
        const totalAmount = dto.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const order = await this.prisma.order.create({
            data: {
                orderNumber: dto.orderNumber,
                userId: dto.userId,
                totalAmount,
                orderItems: {
                    create: dto.orderItems.map((item) => ({
                        itemId: item.itemId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: {
                orderItems: true,
            },
        });
        await this.prisma.sale.create({
            data: {
                orderId: order.id,
                totalAmount,
            },
        });
        return order;
    }
    async getAllOrders() {
        return this.prisma.order.findMany({
            include: { orderItems: true, sale: true, user: true },
        });
    }
    async getOrderById(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { orderItems: true, sale: true, user: true },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }
    async deleteOrder(id) {
        await this.prisma.sale.deleteMany({ where: { orderId: id } });
        return this.prisma.order.delete({
            where: { id },
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)()
], OrdersService);
