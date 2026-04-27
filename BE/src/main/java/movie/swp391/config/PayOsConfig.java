package movie.swp391.config;

import movie.swp391.properties.PayOsProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.payos.PayOS;

@Configuration
public class PayOsConfig {

    @Bean
    @ConditionalOnProperty(name = {"payos.client-id", "payos.api-key", "payos.checksum-key"})
    public PayOS payOS(PayOsProperties payOsProperties) {
        return new PayOS(
                payOsProperties.getClientId(),
                payOsProperties.getApiKey(),
                payOsProperties.getChecksumKey()
        );
    }
}

