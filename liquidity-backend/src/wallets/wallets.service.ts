import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CashDrawer } from './cash-drawer.entity';
import { Wallet } from './wallet.entity';
import { CashTransaction } from './cash-transaction.entity';
import { TransactionType } from '../common/enums/transaction-type.enum';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(CashDrawer)
    private cashDrawersRepo: Repository<CashDrawer>,
    @InjectRepository(Wallet)
    private walletsRepo: Repository<Wallet>,
    @InjectRepository(CashTransaction)
    private cashTransactionsRepo: Repository<CashTransaction>,
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
