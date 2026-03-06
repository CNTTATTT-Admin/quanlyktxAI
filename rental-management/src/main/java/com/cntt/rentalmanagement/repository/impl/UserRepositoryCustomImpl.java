package com.cntt.rentalmanagement.repository.impl;

import com.cntt.rentalmanagement.domain.enums.RoleName;
import com.cntt.rentalmanagement.domain.models.Room;
import com.cntt.rentalmanagement.domain.models.User;
import com.cntt.rentalmanagement.repository.BaseRepository;
import com.cntt.rentalmanagement.repository.UserRepositoryCustom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Repository
@Transactional
public class UserRepositoryCustomImpl implements UserRepositoryCustom {
    @PersistenceContext
    private EntityManager em;

    private static final String FROM_USER = "from rental_home.users u ";
    @Override
    public Page<User> searchingAccount(String keyword, Pageable pageable) {
        StringBuilder strQuery = new StringBuilder();
        strQuery.append(FROM_USER);
        strQuery.append(" where 1=1 AND u.email NOT IN ('master@gmail.com') ");

        Map<String, Object> params = new HashMap<>();
        if (Objects.nonNull(keyword) && !keyword.isEmpty()) {
            strQuery.append(" AND (u.name LIKE :keyword OR u.email LIKE :keyword)  ");
            params.put("keyword", "%"+keyword+"%");
        }

        String strSelectQuery = "SELECT * " + strQuery;

        String strCountQuery = "SELECT COUNT(DISTINCT u.id)" + strQuery;

        return BaseRepository.getPagedNativeQuery(em,strSelectQuery, strCountQuery, params, pageable, User.class);
    }

    @Override
    public Page<User> searchingAccountByRole(String keyword, List<RoleName> roles, Pageable pageable) {
        StringBuilder strQuery = new StringBuilder();
        strQuery.append(FROM_USER);
        strQuery.append(" JOIN rental_home.user_roles ur ON u.id = ur.user_id ");
        strQuery.append(" JOIN rental_home.roles r ON ur.role_id = r.id ");
        strQuery.append(" where 1=1 AND u.email NOT IN ('master@gmail.com') ");

        Map<String, Object> params = new HashMap<>();
        if (Objects.nonNull(keyword) && !keyword.isEmpty()) {
            strQuery.append(" AND (u.name LIKE :keyword OR u.email LIKE :keyword)  ");
            params.put("keyword", "%"+keyword+"%");
        }

        if (roles != null && !roles.isEmpty()) {
            strQuery.append(" AND r.name IN (:roles) ");
            List<String> roleStrings = roles.stream().map(Enum::name).collect(Collectors.toList());
            params.put("roles", roleStrings);
        }

        String strSelectQuery = "SELECT DISTINCT u.* " + strQuery;

        String strCountQuery = "SELECT COUNT(DISTINCT u.id)" + strQuery;

        return BaseRepository.getPagedNativeQuery(em, strSelectQuery, strCountQuery, params, pageable, User.class);
    }

    @Override
    public void deleteRoleOfAccount(Long userId) {
        String queryString = "DELETE FROM user_roles WHERE user_id = :userId ";
        Query nativeQuery = em.createNativeQuery(queryString);
        nativeQuery.setParameter("userId", userId);
        nativeQuery.executeUpdate();
    }
}
