package click.bcyeon.back01.visitor.service;

import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.model.CityResponse;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.InetAddress;

@Service
public class GeoIpService {

    private static final Logger log = LoggerFactory.getLogger(GeoIpService.class);

    private DatabaseReader reader;

    @PostConstruct
    public void init() {
        try (InputStream is = getClass().getResourceAsStream("/geoip/GeoLite2-City.mmdb")) {
            if (is == null) {
                log.warn("GeoLite2-City.mmdb not found. GeoIP lookup will be disabled.");
                return;
            }
            reader = new DatabaseReader.Builder(is).build();
            log.info("GeoIP database loaded.");
        } catch (Exception e) {
            log.warn("Failed to load GeoIP database: {}", e.getMessage());
        }
    }

    public String[] lookup(String ip) {
        if (reader == null || ip == null) return new String[]{null, null};
        try {
            String cleanIp = ip.contains(",") ? ip.split(",")[0].trim() : ip.trim();
            if ("127.0.0.1".equals(cleanIp) || "0:0:0:0:0:0:0:1".equals(cleanIp)) return new String[]{"localhost", null};
            InetAddress address = InetAddress.getByName(cleanIp);
            CityResponse response = reader.city(address);
            String country = response.getCountry().getName();
            String city = response.getCity().getName();
            return new String[]{country, city};
        } catch (Exception e) {
            return new String[]{null, null};
        }
    }
}
