package com.bookbridge.service;

import com.bookbridge.model.UpworkTransaction;
import com.bookbridge.repository.UpworkTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UpworkTransactionService {

    @Autowired
    private UpworkTransactionRepository upworkTransactionRepository;

    public List<UpworkTransaction> getAllTransactions() {
        return upworkTransactionRepository.findAll();
    }

    public Page<UpworkTransaction> getAllTransactionsPaged(Pageable pageable) {
        return upworkTransactionRepository.findAllTransactionsPaged(pageable);
    }

    public Optional<UpworkTransaction> getTransactionById(Long id) {
        return upworkTransactionRepository.findById(id);
    }

    public Optional<UpworkTransaction> getTransactionByTransactionId(String transactionId) {
        return upworkTransactionRepository.findByTransactionId(transactionId);
    }

    @Transactional
    public UpworkTransaction createTransaction(String transactionId, String projectName, BigDecimal amount, String description) {
        UpworkTransaction transaction = new UpworkTransaction(transactionId, projectName, amount, description);
        return upworkTransactionRepository.save(transaction);
    }

    @Transactional
    public UpworkTransaction updateTransactionStatus(Long id, UpworkTransaction.TransactionStatus status) {
        Optional<UpworkTransaction> transactionOpt = upworkTransactionRepository.findById(id);
        if (transactionOpt.isPresent()) {
            UpworkTransaction transaction = transactionOpt.get();
            transaction.setStatus(status);
            
            if (status == UpworkTransaction.TransactionStatus.COMPLETED) {
                transaction.setCompletedAt(LocalDateTime.now());
            }
            
            return upworkTransactionRepository.save(transaction);
        }
        throw new IllegalArgumentException("Transaction not found");
    }

    @Transactional
    public void deleteTransaction(Long id) {
        upworkTransactionRepository.deleteById(id);
    }

    public List<UpworkTransaction> getTransactionsByStatus(UpworkTransaction.TransactionStatus status) {
        return upworkTransactionRepository.findByStatus(status);
    }

    public Long countTransactionsCreatedAfter(LocalDateTime date) {
        return upworkTransactionRepository.countTransactionsCreatedAfter(date);
    }

    public Double sumCompletedTransactions() {
        Double sum = upworkTransactionRepository.sumCompletedTransactions();
        return sum != null ? sum : 0.0;
    }
}
