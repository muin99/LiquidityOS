import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { CashDrawer } from './cash-drawer.entity';
import { Wallet } from './wallet.entity';
import { CashTransaction } from './cash-transaction.entity';
import { TransactionType } from '../common/enums/transaction-type.enum';
import { CoordinatorProvider } from '../coordinator-providers/coordinator-provider.entity';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import { RequestType } from '../common/enums/request-type.enum';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(CashDrawer)
    private cashDrawersRepo: Repository<CashDrawer>,
    @InjectRepository(Wallet)
    private walletsRepo: Repository<Wallet>,
    @InjectRepository(CashTransaction)
    private cashTransactionsRepo: Repository<CashTransaction>,
    @InjectRepository(CoordinatorProvider)
    private coordinatorProvidersRepo: Repository<CoordinatorProvider>,
    // dataSource is what lets us do a "transaction" — see below.
    private dataSource: DataSource,
  ) {}

  // Every agent gets exactly one cash drawer. If they don't have one yet
  // (e.g. this is their very first cash-in), we make one for them, starting at 0.
  private async getOrCreateDrawer(agentId: string) {
    let drawer = await this.cashDrawersRepo.findOne({ where: { agentId } });
    if (!drawer) {
      drawer = this.cashDrawersRepo.create({ agentId, balance: 0 });
      drawer = await this.cashDrawersRepo.save(drawer);
    }
    return drawer;
  }

  private async getOrCreateWallet(agentId: string, providerId: string) {
    let wallet = await this.walletsRepo.findOne({
      where: { agentId, providerId },
    });
    if (!wallet) {
      wallet = this.walletsRepo.create({ agentId, providerId, balance: 0 });
      wallet = await this.walletsRepo.save(wallet);
    }
    return wallet;
  }

  async myWallets(agentId: string) {
    const drawer = await this.getOrCreateDrawer(agentId);
    // loading the "provider" relation too, so the frontend can show a
    // name like "bKash" instead of just a providerId uuid
    const wallets = await this.walletsRepo.find({
      where: { agentId },
      relations: ['provider'],
    });
    return { cashDrawer: drawer, ecashWallets: wallets };
  }

  // The agent's own cash-in/cash-out history, oldest first — this is
  // what lets the frontend draw a "balance over time" chart instead
  // of just showing the current numbers.
  async myTransactions(agentId: string) {
    return this.cashTransactionsRepo.find({
      where: { agentId },
      relations: ['provider'],
      order: { createdAt: 'ASC' },
    });
  }

  // Provider-level history includes every completed liquidity swap in its network.
  providerTransactions(providerId: string) {
    return this.cashTransactionsRepo.find({
      where: { providerId, type: TransactionType.LIQUIDITY_SWAP },
      relations: ['agent', 'coordinator'],
      order: { createdAt: 'DESC' },
    });
  }

  // A provider has one cash reserve and one e-cash reserve for its network.
  async providerBalances(providerId: string) {
    let ecashWallet = await this.walletsRepo.findOne({
      where: { providerId, agentId: IsNull(), coordinatorId: IsNull() },
    });
    if (!ecashWallet) {
      ecashWallet = await this.walletsRepo.save(
        this.walletsRepo.create({ providerId, balance: 0 }),
      );
    }

    let cashDrawer = await this.cashDrawersRepo.findOne({
      where: { providerId },
    });
    if (!cashDrawer) {
      cashDrawer = await this.cashDrawersRepo.save(
        this.cashDrawersRepo.create({ providerId, balance: 0 }),
      );
    }

    return { cash: cashDrawer.balance, ecash: ecashWallet.balance };
  }

  // Small provider report: total customer cash-in and cash-out for today.
  async providerDailySummary(providerId: string) {
    const transactions = await this.cashTransactionsRepo.find({
      where: { providerId },
    });
    const today = new Date().toDateString();
    let cashIn = 0;
    let cashOut = 0;

    for (const transaction of transactions) {
      if (new Date(transaction.createdAt).toDateString() !== today) continue;
      if (transaction.type === TransactionType.CASH_IN) {
        cashIn += Number(transaction.amount);
      }
      if (transaction.type === TransactionType.CASH_OUT) {
        cashOut += Number(transaction.amount);
      }
    }

    return { cashIn, cashOut };
  }

  // This represents money arriving from the provider's real bank, vault, or MFS account.
  async addProviderReserve(
    providerId: string,
    type: RequestType,
    amount: number,
  ) {
    return this.dataSource.transaction(async (safe) => {
      if (type === 'e_cash') {
        let wallet = await safe.findOne(Wallet, {
          where: { providerId, agentId: IsNull(), coordinatorId: IsNull() },
        });
        if (!wallet) {
          wallet = safe.create(Wallet, { providerId, balance: 0 });
        }
        wallet.balance = Number(wallet.balance) + amount;
        await safe.save(wallet);

        const transaction = safe.create(CashTransaction, {
          providerId,
          type: TransactionType.PROVIDER_TOP_UP,
          amount,
          drawerBalanceAfter: 0,
          walletBalanceAfter: wallet.balance,
        });
        await safe.save(transaction);
        return { wallet, transaction };
      }

      let drawer = await safe.findOne(CashDrawer, { where: { providerId } });
      if (!drawer) {
        drawer = safe.create(CashDrawer, { providerId, balance: 0 });
      }
      drawer.balance = Number(drawer.balance) + amount;
      await safe.save(drawer);

      const transaction = safe.create(CashTransaction, {
        providerId,
        type: TransactionType.PROVIDER_TOP_UP,
        amount,
        drawerBalanceAfter: drawer.balance,
        walletBalanceAfter: 0,
      });
      await safe.save(transaction);
      return { drawer, transaction };
    });
  }

  // Move one kind of liquidity from a provider reserve to an approved coordinator.
  async supplyCoordinator(
    providerId: string,
    coordinatorId: string,
    type: RequestType,
    amount: number,
  ) {
    return this.dataSource.transaction(async (safe) => {
      const approved = await safe.findOne(CoordinatorProvider, {
        where: {
          providerId,
          coordinatorId,
          status: ApplicationStatus.APPROVED,
        },
      });
      if (!approved) {
        throw new BadRequestException('This coordinator is not approved for your provider');
      }

      if (type === 'e_cash') {
        let providerWallet = await safe.findOne(Wallet, {
          where: { providerId, agentId: IsNull(), coordinatorId: IsNull() },
        });
        if (!providerWallet || Number(providerWallet.balance) < amount) {
          throw new BadRequestException('Not enough e-cash in the provider reserve');
        }

        let coordinatorWallet = await safe.findOne(Wallet, {
          where: { providerId, coordinatorId },
        });
        if (!coordinatorWallet) {
          coordinatorWallet = safe.create(Wallet, {
            providerId,
            coordinatorId,
            balance: 0,
          });
        }

        providerWallet.balance = Number(providerWallet.balance) - amount;
        coordinatorWallet.balance = Number(coordinatorWallet.balance) + amount;
        await safe.save([providerWallet, coordinatorWallet]);

        const transaction = safe.create(CashTransaction, {
          coordinatorId,
          providerId,
          type: TransactionType.PROVIDER_SUPPLY,
          amount,
          drawerBalanceAfter: 0,
          walletBalanceAfter: coordinatorWallet.balance,
        });
        await safe.save(transaction);
        return { coordinatorWallet, transaction };
      }

      let providerDrawer = await safe.findOne(CashDrawer, { where: { providerId } });
      if (!providerDrawer || Number(providerDrawer.balance) < amount) {
        throw new BadRequestException('Not enough cash in the provider reserve');
      }

      let coordinatorDrawer = await safe.findOne(CashDrawer, {
        where: { coordinatorId },
      });
      if (!coordinatorDrawer) {
        coordinatorDrawer = safe.create(CashDrawer, { coordinatorId, balance: 0 });
      }

      providerDrawer.balance = Number(providerDrawer.balance) - amount;
      coordinatorDrawer.balance = Number(coordinatorDrawer.balance) + amount;
      await safe.save([providerDrawer, coordinatorDrawer]);

      const transaction = safe.create(CashTransaction, {
        coordinatorId,
        providerId,
        type: TransactionType.PROVIDER_SUPPLY,
        amount,
        drawerBalanceAfter: coordinatorDrawer.balance,
        walletBalanceAfter: 0,
      });
      await safe.save(transaction);
      return { coordinatorDrawer, transaction };
    });
  }

  // ============================================================
  //  CASH-IN: a customer hands the agent physical cash, and the
  //  agent sends the same amount of e-cash to the customer.
  //  So: e-cash goes OUT of the wallet, physical cash comes IN to
  //  the drawer.
  //
  //  We wrap the whole swap in a "transaction". A transaction is
  //  like a magic box: EITHER everything inside happens together,
  //  OR — if any single step fails — NOTHING happens at all, and
  //  it's like we never even tried. This stops us from ever
  //  ending up "half done" (e.g. wallet emptied but drawer not
  //  topped up).
  // ============================================================
  async cashIn(agentId: string, providerId: string, amount: number) {
    // dataSource.transaction() opens the magic box for us.
    // "safe" below is our special toolbox to use ONLY inside this box.
    return this.dataSource.transaction(async (safe) => {
      // Step 1: get the agent's e-cash wallet for this one provider
      let wallet = await safe.findOne(Wallet, {
        where: { agentId, providerId },
      });
      if (!wallet) {
        wallet = safe.create(Wallet, { agentId, providerId, balance: 0 });
      }

      // You can't send out more e-cash than you actually have.
      if (Number(wallet.balance) < amount) {
        throw new BadRequestException('Not enough e-cash in this wallet');
      }

      // Step 2: get the agent's cash drawer (create one if it's their first time)
      let drawer = await safe.findOne(CashDrawer, { where: { agentId } });
      if (!drawer) {
        drawer = safe.create(CashDrawer, { agentId, balance: 0 });
      }

      // Step 3: do the swap in memory first
      //   - take the e-cash out of the wallet
      //   - put the same amount of physical cash into the drawer
      wallet.balance = Number(wallet.balance) - amount;
      drawer.balance = Number(drawer.balance) + amount;

      // Step 4: save both changes. Because we're inside the transaction,
      // these two saves either BOTH succeed, or BOTH get cancelled.
      await safe.save(drawer);
      await safe.save(wallet);

      // Step 5: write one line in the ledger book, so there's a permanent
      // record of exactly what happened and when.
      const entry = safe.create(CashTransaction, {
        agentId,
        providerId,
        type: TransactionType.CASH_IN,
        amount,
        drawerBalanceAfter: drawer.balance,
        walletBalanceAfter: wallet.balance,
      });
      await safe.save(entry);

      // Step 6: hand back the fresh numbers.
      return { drawer, wallet, transaction: entry };
    });
  }

  // ============================================================
  //  CASH-OUT: the opposite swap — a customer is withdrawing, so the
  //  agent hands over physical cash and receives e-cash back in
  //  return. So: physical cash goes OUT of the drawer, e-cash comes
  //  IN to the wallet. Same magic-box idea as cashIn above.
  // ============================================================
  async cashOut(agentId: string, providerId: string, amount: number) {
    return this.dataSource.transaction(async (safe) => {
      // The agent must already have a drawer (they'd have made one by
      // cashing in before), but just in case, create an empty one.
      let drawer = await safe.findOne(CashDrawer, { where: { agentId } });
      if (!drawer) {
        drawer = safe.create(CashDrawer, { agentId, balance: 0 });
      }

      // You can't hand over more physical cash than you actually have.
      if (Number(drawer.balance) < amount) {
        throw new BadRequestException('Not enough cash in the drawer');
      }

      let wallet = await safe.findOne(Wallet, {
        where: { agentId, providerId },
      });
      if (!wallet) {
        wallet = safe.create(Wallet, { agentId, providerId, balance: 0 });
      }

      // Step 1: take the physical cash out of the drawer
      drawer.balance = Number(drawer.balance) - amount;
      // Step 2: give the same amount back as e-cash in the wallet
      wallet.balance = Number(wallet.balance) + amount;

      await safe.save(drawer);
      await safe.save(wallet);

      const entry = safe.create(CashTransaction, {
        agentId,
        providerId,
        type: TransactionType.CASH_OUT,
        amount,
        drawerBalanceAfter: drawer.balance,
        walletBalanceAfter: wallet.balance,
      });
      await safe.save(entry);

      return { drawer, wallet, transaction: entry };
    });
  }
}
