export { performOutpostBankService } from './frontierOutpostBankServices';
export { performOutpostTrainingService, redeemOutpostBounty } from './frontierOutpostTrainingServices';

// Legacy compatibility: single dispatcher some code used before
export async function performOutpostServices({ serviceId, ...ctx }) {
  if (serviceId?.startsWith?.('fo_bank_')) {
    const { performOutpostBankService } = await import('./frontierOutpostBankServices');
    return performOutpostBankService({ serviceId, ...ctx });
  }
  if (serviceId?.startsWith?.('fo_')) {
    const { performOutpostTrainingService } = await import('./frontierOutpostTrainingServices');
    return performOutpostTrainingService({ serviceId, ...ctx });
  }
  return { log: [`[FO] Unknown serviceId: ${String(serviceId)}`], actions: [] };
}
