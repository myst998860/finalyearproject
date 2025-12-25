package com.bookbridge.repository;

import com.bookbridge.model.UpworkTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UpworkTransactionRepository extends JpaRepository<UpworkTransaction, Long> {
    Optional<UpworkTransaction> findByTransactionId(String transactionId);
    
    @Query("SELECT ut FROM UpworkTransaction ut WHERE ut.status = ?1")
    List<UpworkTransaction> findByStatus(UpworkTransaction.TransactionStatus status);
    
    @Query("SELECT ut FROM UpworkTransaction ut ORDER BY ut.createdAt DESC")
    Page<UpworkTransaction> findAllTransactionsPaged(Pageable pageable);
    
    @Query("SELECT COUNT(ut) FROM UpworkTransaction ut WHERE ut.createdAt >= ?1")
    Long countTransactionsCreatedAfter(LocalDateTime date);
    
    @Query("SELECT SUM(ut.amount) FROM UpworkTransaction ut WHERE ut.status = 'COMPLETED'")
    Double sumCompletedTransactions();
}
