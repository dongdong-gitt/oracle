import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 用户相关操作
export const userDb = {
  // 创建或更新用户
  async upsertUser(data: {
    email?: string;
    phone?: string;
    wechatId?: string;
    name?: string;
    avatar?: string;
  }) {
    const where = data.email 
      ? { email: data.email }
      : data.phone 
      ? { phone: data.phone }
      : { wechatId: data.wechatId };
      
    return prisma.user.upsert({
      where: where as any,
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        ...data,
        membership: 'FREE',
      },
    });
  },

  // 获取用户信息
  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        baziReadings: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  },

  // 更新会员信息
  async updateMembership(userId: string, membership: string, expiresAt?: Date) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        membership: membership as any,
        membershipExpiresAt: expiresAt,
      },
    });
  },
};

// 八字测算相关操作
export const baziDb = {
  // 保存测算记录
  async createReading(data: {
    userId: string;
    name: string;
    gender: 'MALE' | 'FEMALE';
    birthDate: Date;
    birthTime: string;
    birthPlace: string;
    country?: string;
    province?: string;
    city?: string;
    district?: string;
    longitude?: number;
    latitude?: number;
    baziData: any;
    daYun: any;
    liuNian: any;
    aiAnalysis?: any;
    baseScores?: any;
    klineData?: any;
  }) {
    // 更新用户统计
    await prisma.user.update({
      where: { id: data.userId },
      data: {
        readingCount: { increment: 1 },
        lastReadingAt: new Date(),
      },
    });

    return prisma.baziReading.create({
      data,
    });
  },

  // 获取用户的测算记录
  async getUserReadings(userId: string, limit = 20) {
    return prisma.baziReading.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  // 获取单条测算记录
  async getReadingById(id: string, userId: string) {
    return prisma.baziReading.findFirst({
      where: { id, userId },
    });
  },

  // 检查是否已存在相同生辰的测算
  async findExistingReading(
    userId: string,
    birthDate: Date,
    birthTime: string,
    gender: string
  ) {
    return prisma.baziReading.findFirst({
      where: {
        userId,
        birthDate,
        birthTime,
        gender: gender as any,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // 更新收藏状态
  async toggleFavorite(id: string, userId: string) {
    const reading = await prisma.baziReading.findFirst({
      where: { id, userId },
    });
    
    if (!reading) return null;
    
    return prisma.baziReading.update({
      where: { id },
      data: { isFavorite: !reading.isFavorite },
    });
  },

  // 添加备注
  async updateNotes(id: string, userId: string, notes: string) {
    return prisma.baziReading.updateMany({
      where: { id, userId },
      data: { notes },
    });
  },

  // 删除测算记录
  async deleteReading(id: string, userId: string) {
    return prisma.baziReading.deleteMany({
      where: { id, userId },
    });
  },
};

// 六爻测算相关操作
export const liuyaoDb = {
  async createReading(data: {
    userId: string;
    question: string;
    method: string;
    guaXiang: any;
    yaoList: any;
    aiAnalysis?: any;
  }) {
    return prisma.liuyaoReading.create({
      data: {
        ...data,
        method: data.method as any,
      },
    });
  },

  async getUserReadings(userId: string, limit = 20) {
    return prisma.liuyaoReading.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },
};

// 支付相关操作
export const paymentDb = {
  async createPayment(data: {
    userId: string;
    amount: number;
    currency?: string;
    type: string;
    provider: string;
    membershipType?: string;
  }) {
    return prisma.payment.create({
      data: {
        ...data,
        type: data.type as any,
        status: 'PENDING',
      },
    });
  },

  async updatePaymentStatus(
    id: string,
    status: 'PAID' | 'FAILED' | 'REFUNDED',
    providerOrderId?: string
  ) {
    return prisma.payment.update({
      where: { id },
      data: {
        status: status as any,
        providerOrderId,
        paidAt: status === 'PAID' ? new Date() : undefined,
      },
    });
  },

  async getUserPayments(userId: string) {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },
};

// AI调用日志
export const aiLogDb = {
  async create(data: {
    userId?: string;
    provider: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    requestType: string;
    latencyMs: number;
  }) {
    return prisma.aiLog.create({
      data,
    });
  },

  async getStats(startDate: Date, endDate: Date) {
    return prisma.aiLog.groupBy({
      by: ['provider', 'model', 'requestType'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        cost: true,
        inputTokens: true,
        outputTokens: true,
      },
      _count: true,
    });
  },
};

// 系统配置
export const configDb = {
  async get(key: string) {
    const config = await prisma.config.findUnique({
      where: { key },
    });
    return config?.value;
  },

  async set(key: string, value: any, description?: string) {
    return prisma.config.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });
  },
};
