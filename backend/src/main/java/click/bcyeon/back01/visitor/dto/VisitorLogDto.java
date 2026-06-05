package click.bcyeon.back01.visitor.dto;

import lombok.Data;

import java.util.Date;

@Data
public class VisitorLogDto {
    private Long id;
    private String ip;
    private String uri;
    private String method;
    private int statusCode;
    private long responseTime;
    private String userAgent;
    private String referer;
    private String country;
    private String city;
    private Date visitedAt;
}
