package org.api.quizzz.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public abstract class BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    Long id;

    @CreatedBy
    @Column(name = "CREATED_BY")
    String createdBy;

    @CreatedDate
    @Column(name = "CREATED_DATE", updatable = false)
    LocalDateTime createdDate;

    @LastModifiedBy
    @Column(name = "UPDATED_BY")
    String updatedBy;

    @LastModifiedDate
    @Column(name = "UPDATED_DATE")
    LocalDateTime updatedDate;
}
