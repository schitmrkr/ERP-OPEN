"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let ExpensesService = class ExpensesService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async createExpense(dto) {
        return this.prisma.expense.create({
            data: {
                description: dto.description,
                amount: dto.amount,
                type: dto.type, // defaults to INGREDIENT if not provided
                itemId: dto.itemId ?? null,
                userId: dto.userId ?? null,
            },
        });
    }
    async getAllExpenses() {
        return this.prisma.expense.findMany({
            include: {
                item: true,
                user: true,
            },
        });
    }
    async getExpenseById(id) {
        const expense = await this.prisma.expense.findUnique({
            where: { id },
            include: {
                item: true,
                user: true,
            },
        });
        if (!expense)
            throw new common_1.NotFoundException('Expense not found');
        return expense;
    }
    async deleteExpense(id) {
        await this.getExpenseById(id); // ensure exists
        return this.prisma.expense.delete({
            where: { id },
        });
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)()
], ExpensesService);
