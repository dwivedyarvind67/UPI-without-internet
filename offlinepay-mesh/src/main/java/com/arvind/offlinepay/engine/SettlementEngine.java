package com.arvind.offlinepay.engine;

import com.arvind.offlinepay.domain.*;
import com.arvind.offlinepay.exception.PaymentException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Executes the actual ledger update for a decrypted payment instruction.
 *
 * Wrapped in @Transactional so the debit and credit are atomic — either
 * BOTH happen or neither does.
 *
 * The @Version column on Account provides optimistic locking as an
 * additional safety net against concurrent balance corruption.
 *
 * @author Arvind Dwivedi
 */
@Service
public class SettlementEngine {

    private static final Logger log = LoggerFactory.getLogger(SettlementEngine.class);

    private final AccountRepository accountRepo;
    private final TransactionRepository transactionRepo;

    public SettlementEngine(AccountRepository accountRepo, TransactionRepository transactionRepo) {
        this.accountRepo = accountRepo;
        this.transactionRepo = transactionRepo;
    }

    @Transactional
    public Transaction execute(PaymentInstruction instruction, String packetHash,
                               String bridgeNodeId, int hopCount) {

        Account sender = accountRepo.findById(instruction.getSenderVpa())
                .orElseThrow(() -> new PaymentException("unknown_sender",
                        "Sender VPA not found: " + instruction.getSenderVpa()));

        Account receiver = accountRepo.findById(instruction.getReceiverVpa())
                .orElseThrow(() -> new PaymentException("unknown_receiver",
                        "Receiver VPA not found: " + instruction.getReceiverVpa()));

        BigDecimal amount = instruction.getAmount();
        if (amount.signum() <= 0) {
            throw new PaymentException("invalid_amount", "Transfer amount must be positive");
        }

        if (sender.getBalance().compareTo(amount) < 0) {
            log.warn("Insufficient funds: {} has ₹{}, attempted ₹{}",
                    sender.getVpa(), sender.getBalance(), amount);
            return recordOutcome(instruction, packetHash, bridgeNodeId, hopCount,
                    Transaction.Outcome.REJECTED);
        }

        sender.setBalance(sender.getBalance().subtract(amount));
        receiver.setBalance(receiver.getBalance().add(amount));
        accountRepo.save(sender);
        accountRepo.save(receiver);

        Transaction tx = recordOutcome(instruction, packetHash, bridgeNodeId, hopCount,
                Transaction.Outcome.SETTLED);

        log.info("SETTLED ₹{} from {} → {} (hash={}..., bridge={}, hops={})",
                amount, sender.getVpa(), receiver.getVpa(),
                packetHash.substring(0, 12), bridgeNodeId, hopCount);

        return tx;
    }

    private Transaction recordOutcome(PaymentInstruction instruction, String packetHash,
                                      String bridgeNodeId, int hopCount,
                                      Transaction.Outcome outcome) {
        Transaction tx = new Transaction();
        tx.setPacketHash(packetHash);
        tx.setSenderVpa(instruction.getSenderVpa());
        tx.setReceiverVpa(instruction.getReceiverVpa());
        tx.setAmount(instruction.getAmount());
        tx.setSignedAt(Instant.ofEpochMilli(instruction.getSignedAt()));
        tx.setSettledAt(Instant.now());
        tx.setBridgeNodeId(bridgeNodeId);
        tx.setHopCount(hopCount);
        tx.setOutcome(outcome);
        return transactionRepo.save(tx);
    }
}
