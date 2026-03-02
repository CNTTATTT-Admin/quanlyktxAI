package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.models.Configuration;
import com.cntt.rentalmanagement.repository.ConfigurationRepository;
import com.cntt.rentalmanagement.services.ConfigurationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConfigurationServiceImpl implements ConfigurationService {

    @Autowired
    private ConfigurationRepository configurationRepository;

    private static final String LIVENESS_KEY = "face_liveness_enabled";

    @Override
    public String getConfig(String key, String defaultValue) {
        return configurationRepository.findByConfigKey(key)
                .map(Configuration::getConfigValue)
                .orElse(defaultValue);
    }

    @Override
    @Transactional
    public void updateConfig(String key, String value) {
        Configuration config = configurationRepository.findByConfigKey(key)
                .orElse(new Configuration(key, value));
        config.setConfigValue(value);
        configurationRepository.save(config);
    }

    @Override
    public boolean isLivenessEnabled() {
        return Boolean.parseBoolean(getConfig(LIVENESS_KEY, "true"));
    }

    @Override
    public void setLivenessEnabled(boolean enabled) {
        updateConfig(LIVENESS_KEY, String.valueOf(enabled));
    }
}
