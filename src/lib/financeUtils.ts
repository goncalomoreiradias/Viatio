export interface ParticipantBalance {
    name: string;
    balance: number;
}

export interface OptimizedTransfer {
    from: string;
    to: string;
    amount: number;
}

/**
 * Optimizes transfers using a greedy algorithm to minimize the number of transactions.
 * Net balance = Paid - FairShare.
 */
export function optimizeTransfers(balances: ParticipantBalance[]): OptimizedTransfer[] {
    const debtors = balances
        .filter(b => b.balance < -0.01)
        .sort((a, b) => a.balance - b.balance); // Most negative first

    const creditors = balances
        .filter(b => b.balance > 0.01)
        .sort((a, b) => b.balance - a.balance); // Most positive first

    const transfers: OptimizedTransfer[] = [];

    let dIdx = 0;
    let cIdx = 0;

    const dList = debtors.map(d => ({ ...d, balance: Math.abs(d.balance) }));
    const cList = creditors.map(c => ({ ...c }));

    while (dIdx < dList.length && cIdx < cList.length) {
        const debtor = dList[dIdx];
        const creditor = cList[cIdx];

        const amount = Math.min(debtor.balance, creditor.balance);
        
        if (amount > 0) {
            transfers.push({
                from: debtor.name,
                to: creditor.name,
                amount: Number(amount.toFixed(2))
            });
        }

        debtor.balance -= amount;
        creditor.balance -= amount;

        if (debtor.balance < 0.01) dIdx++;
        if (creditor.balance < 0.01) cIdx++;
    }

    return transfers;
}
