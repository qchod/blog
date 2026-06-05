package click.bcyeon.back01.visitor.service;

import click.bcyeon.back01.visitor.dto.VisitorLogDto;
import click.bcyeon.back01.visitor.mapper.VisitorLogMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class VisitorLogService {

    private static final Logger fileLogger = LoggerFactory.getLogger("visitor-log");

    @Autowired
    private VisitorLogMapper visitorLogMapper;

    @Autowired
    private GeoIpService geoIpService;

    @Async("visitorLogExecutor")
    public void log(String ip, String uri, String method, int statusCode, long responseTime,
                    String userAgent, String referer, Date visitedAt) {
        String[] geo = geoIpService.lookup(ip);

        VisitorLogDto dto = new VisitorLogDto();
        dto.setIp(ip);
        dto.setUri(uri);
        dto.setMethod(method);
        dto.setStatusCode(statusCode);
        dto.setResponseTime(responseTime);
        dto.setUserAgent(userAgent);
        dto.setReferer(referer);
        dto.setCountry(geo[0]);
        dto.setCity(geo[1]);
        dto.setVisitedAt(visitedAt);

        try {
            visitorLogMapper.insertVisitorLog(dto);
        } catch (Exception e) {
            LoggerFactory.getLogger(getClass()).error("Failed to insert visitor log: {}", e.getMessage());
        }

        fileLogger.info("{}\t{}\t{}\t{}\t{}ms\t{}\t{}\t{}\t{}",
                visitedAt, ip, method, uri, statusCode, responseTime,
                geo[0], geo[1], userAgent);
    }
}
