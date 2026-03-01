package com.cntt.rentalmanagement.utils;

import com.cntt.rentalmanagement.domain.models.Room;
import com.cntt.rentalmanagement.domain.payload.response.RoomResponse;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class MapperUtils {
    private ModelMapper modelMapper;

    @Autowired
    public MapperUtils(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public <T,S> S convertToEntity(T data, Class<S> type) {
        return modelMapper.map(data,type);
    }

    public <T, S> S convertToResponse(T data, Class<S> type) {
        return modelMapper.map(data, type);
    }

    public <T, S> List<S> convertToResponseList(List<T> lists, Class<S> type) {
        if (Objects.isNull(lists) || lists.isEmpty()) {
            return Collections.emptyList();
        }
        return lists.stream()
                .map(list -> convertToResponse(list, type))
                .collect(Collectors.toList());
    }

    public <T, S> Page<S> convertToResponsePage(Page<T> page, Class<S> type, Pageable pageable) {
        List<S> content = convertToResponseList(page.getContent(), type);
        if (type.equals(RoomResponse.class)) {
            for (int i = 0; i < page.getContent().size(); i++) {
                Object entity = page.getContent().get(i);
                if (entity instanceof Room) {
                    ((RoomResponse) content.get(i)).setCurrentOccupancy(((Room) entity).getResidents() != null ? ((Room) entity).getResidents().size() : 0);
                }
            }
        }
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    public <T, S> S convertToEntityStrict(T data, Class<S> type) {
        modelMapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
        return modelMapper.map(data, type);
    }

    public <T, S> List<S> convertToEntityList(List<T> lists, Class<S> type) {
        return lists.stream()
                .map(list -> convertToResponse(list, type))
                .collect(Collectors.toList());
    }
}

