package com.cntt.rentalmanagement.domain.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ElectricAndWaterResponse {
    private Long id;
    private String name;
    private int month;
    private int lastMonthNumberOfElectric;
    private int thisMonthNumberOfElectric;
    private int lastMonthBlockOfWater;
    private int thisMonthBlockOfWater;
    private BigDecimal moneyEachNumberOfElectric;
    private BigDecimal moneyEachBlockOfWater;
    private BigDecimal internetCost;
    private BigDecimal totalMoneyOfElectric;
    private BigDecimal totalMoneyOfWater;
    private boolean paid;
    private Integer totalUsersToPay;
    private Integer paidUsersCount;
    private boolean userPaid;
    private RoomResponse room;
    private BigDecimal perPersonElectric;
    private BigDecimal perPersonWater;
    private BigDecimal perPersonInternet;
}
