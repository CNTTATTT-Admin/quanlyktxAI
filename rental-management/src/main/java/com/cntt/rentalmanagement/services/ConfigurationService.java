package com.cntt.rentalmanagement.services;

public interface ConfigurationService {
    String getConfig(String key, String defaultValue);
    void updateConfig(String key, String value);
    
    boolean isLivenessEnabled();
    void setLivenessEnabled(boolean enabled);
}
