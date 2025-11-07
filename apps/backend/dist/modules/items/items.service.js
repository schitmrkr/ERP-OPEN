"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let ItemsService = class ItemsService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async createItem(dto) {
        return this.prisma.item.create({
            data: {
                name: dto.name,
                sellingPrice: dto.sellingPrice,
            },
        });
    }
    async getAllItems() {
        return this.prisma.item.findMany({
            include: {
                expenses: true,
                orderItems: true,
            },
        });
    }
    async getItemById(id) {
        const item = await this.prisma.item.findUnique({
            where: { id },
            include: {
                expenses: true,
            },
        });
        if (!item)
            throw new common_1.NotFoundException('Item not found');
        return item;
    }
    async updateItem(id, dto) {
        await this.getItemById(id); // ensure exists
        return this.prisma.item.update({
            where: { id },
            data: {
                name: dto.name,
                sellingPrice: dto.sellingPrice,
            },
        });
    }
    async deleteItem(id) {
        await this.getItemById(id);
        return this.prisma.item.delete({
            where: { id },
        });
    }
};
exports.ItemsService = ItemsService;
exports.ItemsService = ItemsService = __decorate([
    (0, common_1.Injectable)()
], ItemsService);
