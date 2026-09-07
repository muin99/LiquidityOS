import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { IsNull, Repository } from 'typeorm';
import { AppModule } from './app.module';
import { Area } from './areas/area.entity';
import { UserRole } from './common/enums/user-role.enum';
import { UserStatus } from './common/enums/user-status.enum';
import { TransactionType } from './common/enums/transaction-type.enum';
import { Provider } from './providers/provider.entity';
import { CashDrawer } from './wallets/cash-drawer.entity';
import { CashTransaction } from './wallets/cash-transaction.entity';
import { Wallet } from './wallets/wallet.entity';
import { User } from './users/user.entity';
import { CoordinatorProvider } from './coordinator-providers/coordinator-provider.entity';
import { ApplicationStatus } from './common/enums/application-status.enum';

const demoPassword = 'DemoPass123!';

async function ensureUser(
  usersRepo: Repository<User>,
  data: {
    fullName: string;
    email: string;
    role: UserRole;
    areaId?: string;
    providerId?: string;
  },
) {
  let user = await usersRepo.findOne({ where: { email: data.email } });
  const passwordHash = await bcrypt.hash(demoPassword, 10);

  if (!user) {
    user = usersRepo.create({
      ...data,
      passwordHash,
      status: UserStatus.ACTIVE,
    });
  } else {
    Object.assign(user, data, {
      passwordHash,
      status: UserStatus.ACTIVE,
    });
  }

  return usersRepo.save(user);
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const areasRepo = app.get<Repository<Area>>(getRepositoryToken(Area));
  const providersRepo = app.get<Repository<Provider>>(
    getRepositoryToken(Provider),
  );
  const usersRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const coordinatorProvidersRepo = app.get<Repository<CoordinatorProvider>>(
    getRepositoryToken(CoordinatorProvider),
  );
  const walletsRepo = app.get<Repository<Wallet>>(getRepositoryToken(Wallet));
  const cashDrawersRepo = app.get<Repository<CashDrawer>>(
    getRepositoryToken(CashDrawer),
  );
  const transactionsRepo = app.get<Repository<CashTransaction>>(
    getRepositoryToken(CashTransaction),
  );

  try {
    let area = await areasRepo.findOne({ where: { name: 'Demo Central' } });
    if (!area) {
      area = await areasRepo.save(
        areasRepo.create({ name: 'Demo Central', region: 'Dhaka' }),
      );
    }

    let provider = await providersRepo.findOne({
      where: { name: 'Demo Mobile Money' },
    });
    if (!provider) {
      provider = await providersRepo.save(
        providersRepo.create({ name: 'Demo Mobile Money' }),
      );
    }

    const admin = await ensureUser(usersRepo, {
      fullName: 'Demo Admin',
      email: 'demo.admin@liquidityos.local',
      role: UserRole.ADMIN,
    });
    const providerUser = await ensureUser(usersRepo, {
      fullName: 'Demo Provider',
      email: 'demo.provider@liquidityos.local',
      role: UserRole.PROVIDER,
      areaId: area.id,
      providerId: provider.id,
    });
    const agent = await ensureUser(usersRepo, {
      fullName: 'Demo Agent',
      email: 'demo.agent@liquidityos.local',
      role: UserRole.AGENT,
      areaId: area.id,
    });
    const coordinator = await ensureUser(usersRepo, {
      fullName: 'Demo Coordinator',
      email: 'demo.coordinator@liquidityos.local',
      role: UserRole.COORDINATOR,
      areaId: area.id,
    });

    let coordinatorProvider = await coordinatorProvidersRepo.findOne({
      where: { coordinatorId: coordinator.id, providerId: provider.id },
    });
    if (!coordinatorProvider) {
      coordinatorProvider = coordinatorProvidersRepo.create({
        coordinatorId: coordinator.id,
        providerId: provider.id,
        status: ApplicationStatus.APPROVED,
      });
      await coordinatorProvidersRepo.save(coordinatorProvider);
    }

    let wallet = await walletsRepo.findOne({
      where: { agentId: agent.id, providerId: provider.id },
    });
    if (!wallet) {
      wallet = await walletsRepo.save(
        walletsRepo.create({
          agentId: agent.id,
          providerId: provider.id,
          balance: 37_500,
        }),
      );
    }

    let drawer = await cashDrawersRepo.findOne({
      where: { agentId: agent.id },
    });
    if (!drawer) {
      drawer = await cashDrawersRepo.save(
        cashDrawersRepo.create({ agentId: agent.id, balance: 12_500 }),
      );
    }

    let coordinatorWallet = await walletsRepo.findOne({
      where: { coordinatorId: coordinator.id, providerId: provider.id },
    });
    if (!coordinatorWallet) {
      await walletsRepo.save(
        walletsRepo.create({
          coordinatorId: coordinator.id,
          providerId: provider.id,
          balance: 50_000,
        }),
      );
    }

    let coordinatorDrawer = await cashDrawersRepo.findOne({
      where: { coordinatorId: coordinator.id },
    });
    if (!coordinatorDrawer) {
      await cashDrawersRepo.save(
        cashDrawersRepo.create({ coordinatorId: coordinator.id, balance: 50_000 }),
      );
    }

    const providerReserve = await walletsRepo.findOne({
      where: {
        providerId: provider.id,
        agentId: IsNull(),
        coordinatorId: IsNull(),
      },
    });
    if (!providerReserve) {
      await walletsRepo.save(
        walletsRepo.create({ providerId: provider.id, balance: 200_000 }),
      );
    }

    const providerCashReserve = await cashDrawersRepo.findOne({
      where: { providerId: provider.id },
    });
    if (!providerCashReserve) {
      await cashDrawersRepo.save(
        cashDrawersRepo.create({ providerId: provider.id, balance: 200_000 }),
      );
    }

    const transactionCount = await transactionsRepo.count({
      where: { agentId: agent.id, providerId: provider.id },
    });
    if (transactionCount === 0) {
      await transactionsRepo.save([
        transactionsRepo.create({
          agentId: agent.id,
          providerId: provider.id,
          type: TransactionType.CASH_IN,
          amount: 10_000,
          drawerBalanceAfter: 10_000,
          walletBalanceAfter: 40_000,
        }),
        transactionsRepo.create({
          agentId: agent.id,
          providerId: provider.id,
          type: TransactionType.CASH_OUT,
          amount: 2_500,
          drawerBalanceAfter: 7_500,
          walletBalanceAfter: 42_500,
        }),
        transactionsRepo.create({
          agentId: agent.id,
          providerId: provider.id,
          type: TransactionType.CASH_IN,
          amount: 5_000,
          drawerBalanceAfter: 12_500,
          walletBalanceAfter: 37_500,
        }),
      ]);
    }

    console.log('Synthetic demo data is ready.');
    console.log(`Demo password: ${demoPassword}`);
    console.log(
      [admin, providerUser, agent, coordinator]
        .map((user) => `${user.role}: ${user.email}`)
        .join('\n'),
    );
  } finally {
    await app.close();
  }
}

seed().catch((error) => {
  console.error('Synthetic data seed failed.', error);
  process.exitCode = 1;
});
