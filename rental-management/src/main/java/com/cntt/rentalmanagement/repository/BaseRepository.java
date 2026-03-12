package com.cntt.rentalmanagement.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.Query;
import jakarta.persistence.Tuple;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.hibernate.Session;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.sql.Connection;
import java.sql.Date;
import java.sql.Statement;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

public class BaseRepository {

    private static final Logger log = LogManager.getLogger(BaseRepository.class);

    private BaseRepository() {
    }

    // -------------------------------------------------------------------------
    // Native Query - List
    // -------------------------------------------------------------------------

    public static <T> List<T> getResultListNativeQuery(EntityManager em, String strQuery,
                                                       Map<String, Object> params, Class<T> clazz) {
        Query nativeQuery = em.createNativeQuery(strQuery, clazz);
        return getResultList(nativeQuery, params, clazz);
    }

    // -------------------------------------------------------------------------
    // JPA Query - List
    // -------------------------------------------------------------------------

    public static <T> List<T> getResultListJpaQuery(EntityManager em, String strQuery,
                                                    Map<String, Object> params, Class<T> clazz) {
        Query jpaQuery = em.createQuery(strQuery, clazz);
        return getResultList(jpaQuery, params, clazz);
    }

    private static <T> List<T> getResultList(Query query, Map<String, Object> params, Class<T> clazz) {
        params.forEach(query::setParameter);
        List<T> resultList = new ArrayList<>();

        for (Object obj : query.getResultList()) {
            if (obj != null) {
                if (!clazz.isInstance(obj)) {
                    throw new IllegalArgumentException("Error");
                }
                resultList.add(clazz.cast(obj));
            }
        }

        return resultList;
    }

    // -------------------------------------------------------------------------
    // Native Query - Scalar
    // -------------------------------------------------------------------------

    public static <T> T getScalarResultNativeQuery(EntityManager em, String strQuery,
                                                   Map<String, Object> params, Class<T> clazz) {
        Query nativeCountQuery = em.createNativeQuery(strQuery);
        return getScalarResult(nativeCountQuery, params, clazz);
    }

    // -------------------------------------------------------------------------
    // JPA Query - Scalar
    // -------------------------------------------------------------------------

    public static <T> T getScalarResultJpaQuery(EntityManager em, String strQuery,
                                                Map<String, Object> params, Class<T> clazz) {
        Query jpaCountQuery = em.createQuery(strQuery);
        return getScalarResult(jpaCountQuery, params, clazz);
    }

    private static <T> T getScalarResult(Query query, Map<String, Object> params, Class<T> clazz) {
        params.forEach(query::setParameter);

        try {
            Object obj = query.getSingleResult();
            ObjectMapper mapper = new ObjectMapper();
            String debugResult = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(obj);
            log.debug(debugResult);
            log.debug(obj.getClass());

            if (clazz.isInstance(obj)) {
                return clazz.cast(obj);
            }
        } catch (NoResultException e) {
            log.info(e.getMessage());
        } catch (Exception e) {
            log.error(e.getMessage());
            if (log.isDebugEnabled()) {
                log.debug(e.getMessage(), e);
            }
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // Native Query - Paged
    // -------------------------------------------------------------------------

    public static <T> Page<T> getPagedNativeQuery(EntityManager em, String strQuery, String strCountQuery,
                                                  Map<String, Object> params, Pageable pageable, Class<T> clazz) {
        Query nativeQuery = em.createNativeQuery(strQuery, clazz);
        Number total = getScalarResultNativeQuery(em, strCountQuery, params, Number.class);
        return getPaged(nativeQuery, params, pageable, total, clazz);
    }

    // -------------------------------------------------------------------------
    // JPA Query - Paged
    // -------------------------------------------------------------------------

    public static <T> Page<T> getPagedJpaQuery(EntityManager em, String strQuery, String strCountQuery,
                                               Map<String, Object> params, Pageable pageable, Class<T> clazz) {
        Query jpaQuery = em.createQuery(strQuery, clazz);
        Number total = null;

        if (pageable.getPageSize() != Integer.MAX_VALUE) {
            total = getScalarResultJpaQuery(em, strCountQuery, params, Number.class);
        }

        return getPaged(jpaQuery, params, pageable, total, clazz);
    }

    private static <T> Page<T> getPaged(Query query, Map<String, Object> params, Pageable pageable,
                                        Number total, Class<T> clazz) {
        int firstResult = pageable.getPageNumber() * pageable.getPageSize();
        query.setFirstResult(firstResult);
        query.setMaxResults(pageable.getPageSize());
        params.forEach(query::setParameter);

        List<T> resultList = new ArrayList<>();

        for (Object obj : query.getResultList()) {
            if (!clazz.isInstance(obj)) {
                throw new IllegalArgumentException("Error");
            }
            resultList.add(clazz.cast(obj));
        }

        long totalCount = (total == null) ? resultList.size() : total.longValue();
        return new PageImpl<>(resultList, pageable, totalCount);
    }

    // -------------------------------------------------------------------------
    // Native Query - First Result
    // -------------------------------------------------------------------------

    public static <T> T getFirstResultNativeQuery(EntityManager em, String strQuery,
                                                  Map<String, Object> params, Class<T> clazz) {
        List<T> list = getResultListNativeQuery(em, strQuery, params, clazz);
        return list.isEmpty() ? null : list.get(0);
    }

    public static <T> Optional<T> getFirstOptionalResultNativeQuery(EntityManager em, String strQuery,
                                                                    Map<String, Object> params, Class<T> clazz) {
        T t = getFirstResultNativeQuery(em, strQuery, params, clazz);
        return Optional.ofNullable(t);
    }

    // -------------------------------------------------------------------------
    // DML - Count Row Effects
    // -------------------------------------------------------------------------

    public static int countRowEffects(EntityManager em, String strQuery, Map<String, Object> params) {
        if (!em.isJoinedToTransaction()) {
            em.joinTransaction();
        }

        Query nativeQuery = em.createNativeQuery(strQuery);
        params.forEach(nativeQuery::setParameter);

        try {
            return nativeQuery.executeUpdate();
        } catch (Exception e) {
            log.error("{}\n{}\n{}\n{}", e.getMessage(), strQuery, params, e);
            throw new IllegalArgumentException("countRowEffects ERROR");
        }
    }

    // -------------------------------------------------------------------------
    // DDL - Execute DDL Query
    // -------------------------------------------------------------------------

    public static void executeDDLQuery(EntityManager em, String strQuery) {
        if (!em.isJoinedToTransaction()) {
            em.joinTransaction();
        }

        // Hibernate 6 (Spring Boot 3): unwrap Session thay vì SessionImpl
        Session session = em.unwrap(Session.class);
        session.doWork(connection -> {
            try (Statement statement = connection.createStatement()) {
                statement.executeUpdate(strQuery);
            } catch (Exception e) {
                log.error("{}\n{}\n{}", e.getMessage(), strQuery, e);
                throw new IllegalArgumentException("executeQuery ERROR");
            }
        });
    }

    // -------------------------------------------------------------------------
    // Native Query - Map Result (không dùng deprecated ResultTransformer)
    // -------------------------------------------------------------------------

    public static List<Map<String, Object>> getResultListNativeQuery(EntityManager em, String strQuery,
                                                                     Map<String, Object> params) {
        // Hibernate 6: dùng Tuple thay cho AliasToEntityMapResultTransformer (deprecated)
        Query nativeQuery = em.createNativeQuery(strQuery, Tuple.class);
        params.forEach(nativeQuery::setParameter);

        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS'Z'");
        List<Map<String, Object>> resultList = new ArrayList<>();

        @SuppressWarnings("unchecked")
        List<Tuple> tuples = nativeQuery.getResultList();

        for (Tuple tuple : tuples) {
            if (tuple == null) continue;

            Map<String, Object> row = tuple.getElements().parallelStream()
                    .filter(e -> e != null && e.getAlias() != null && tuple.get(e) != null)
                    .collect(Collectors.toMap(
                            e -> String.valueOf(e.getAlias()),
                            e -> {
                                Object value = tuple.get(e);
                                if (value instanceof Date date) {
                                    return simpleDateFormat.format(date);
                                } else if (value instanceof Timestamp timestamp) {
                                    return simpleDateFormat.format(timestamp);
                                } else {
                                    return value;
                                }
                            }
                    ));

            if (!row.isEmpty()) {
                log.info(row);
                resultList.add(row);
            }
        }

        return resultList;
    }
}